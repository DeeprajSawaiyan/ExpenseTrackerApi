package in.deepraj.expensetrackerapi.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import in.deepraj.expensetrackerapi.entity.PasswordResetToken;
import in.deepraj.expensetrackerapi.entity.User;
import in.deepraj.expensetrackerapi.exceptions.InvalidTokenException;
import in.deepraj.expensetrackerapi.repository.PasswordResetTokenRepository;
import in.deepraj.expensetrackerapi.repository.UserRepository;

@Service
public class PasswordResetService {

	private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);

	/** Minimum time between two reset emails for the same account. */
	private static final Duration RESEND_COOLDOWN = Duration.ofSeconds(60);

	private static final SecureRandom RANDOM = new SecureRandom();

	private final UserRepository userRepository;
	private final PasswordResetTokenRepository tokenRepository;
	private final PasswordEncoder passwordEncoder;
	private final EmailService emailService;

	@Value("${app.frontend-base-url:http://localhost:5173}")
	private String frontendBaseUrl;

	@Value("${app.password-reset.token-validity-minutes:30}")
	private long tokenValidityMinutes;

	public PasswordResetService(UserRepository userRepository, PasswordResetTokenRepository tokenRepository,
			PasswordEncoder passwordEncoder, EmailService emailService) {
		this.userRepository = userRepository;
		this.tokenRepository = tokenRepository;
		this.passwordEncoder = passwordEncoder;
		this.emailService = emailService;
	}

	/**
	 * Starts a reset for the given email. Always completes silently, whether or not the
	 * account exists, so callers can't use it to discover registered emails.
	 */
	@Transactional
	public void requestReset(String email) {
		Optional<User> maybeUser = userRepository.findByEmailIgnoreCase(email.trim());
		if (!maybeUser.isPresent()) {
			log.info("Password reset requested for unknown email");
			return;
		}

		User user = maybeUser.get();
		Instant now = Instant.now();

		if (tokenRepository.existsByUserIdAndCreatedAtAfter(user.getId(), now.minus(RESEND_COOLDOWN))) {
			log.info("Password reset for user {} skipped: requested again within cooldown", user.getId());
			return;
		}

		// Only the newest link should work
		tokenRepository.deleteAllForUser(user.getId());

		String rawToken = generateToken();
		PasswordResetToken token = new PasswordResetToken();
		token.setUser(user);
		token.setTokenHash(hash(rawToken));
		token.setCreatedAt(now);
		token.setExpiresAt(now.plus(Duration.ofMinutes(tokenValidityMinutes)));
		tokenRepository.save(token);

		String link = frontendBaseUrl.replaceAll("/+$", "") + "/reset-password?token=" + rawToken;
		emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), link, tokenValidityMinutes);
	}

	/** Sets a new password if the token is valid, then invalidates all of the user's reset tokens. */
	@Transactional
	public void resetPassword(String rawToken, String newPassword) {
		PasswordResetToken token = tokenRepository.findByTokenHash(hash(rawToken.trim()))
				.orElseThrow(() -> new InvalidTokenException(
						"This reset link is invalid or has already been used. Please request a new one."));

		if (token.isExpired()) {
			tokenRepository.delete(token);
			throw new InvalidTokenException("This reset link has expired. Please request a new one.");
		}

		User user = token.getUser();
		user.setPassword(passwordEncoder.encode(newPassword));
		user.revokeAllTokens(); // signs the user out on every device
		userRepository.save(user);

		tokenRepository.deleteAllForUser(user.getId());
		log.info("Password reset completed for user {}; all existing sessions revoked", user.getId());
	}

	private static String generateToken() {
		byte[] bytes = new byte[32];
		RANDOM.nextBytes(bytes);
		return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
	}

	private static String hash(String value) {
		try {
			byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
			StringBuilder hex = new StringBuilder(digest.length * 2);
			for (byte b : digest) {
				hex.append(String.format("%02x", b));
			}
			return hex.toString();
		} catch (NoSuchAlgorithmException e) {
			throw new IllegalStateException("SHA-256 not available", e);
		}
	}
}
