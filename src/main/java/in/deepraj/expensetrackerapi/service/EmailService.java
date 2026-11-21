package in.deepraj.expensetrackerapi.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.annotation.PostConstruct;
import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Sends transactional emails. Channels, in order of preference:
 * <ol>
 *   <li><b>Brevo HTTP API</b> (BREVO_API_KEY) — works on hosts that block SMTP ports, e.g. Render's free tier.</li>
 *   <li><b>SMTP</b> (MAIL_HOST + app password) — e.g. Gmail when running locally or on a paid host.</li>
 *   <li><b>Disabled</b> — nothing is sent. With {@code app.mail.log-links=true} (local profile only)
 *       the reset link is printed to the console so the flow can still be tested.</li>
 * </ol>
 */
@Service
public class EmailService {

	private static final Logger log = LoggerFactory.getLogger(EmailService.class);

	private final ObjectProvider<JavaMailSender> mailSender;
	private final ObjectMapper objectMapper;
	private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

	@Value("${spring.mail.host:}")
	private String mailHost;

	@Value("${spring.mail.password:}")
	private String mailPassword;

	@Value("${app.mail.brevo-api-key:}")
	private String brevoApiKey;

	@Value("${app.mail.brevo-url:https://api.brevo.com/v3/smtp/email}")
	private String brevoUrl;

	@Value("${app.mail.from:no-reply@expensetracker.local}")
	private String fromAddress;

	@Value("${app.mail.from-name:ExpTrack}")
	private String fromName;

	/**
	 * Print reset links to the log when email isn't sent (not configured, or sending failed).
	 * Local development only — never enable in production, where logs may be visible to others.
	 */
	@Value("${app.mail.log-links:false}")
	private boolean logLinks;

	public EmailService(ObjectProvider<JavaMailSender> mailSender, ObjectMapper objectMapper) {
		this.mailSender = mailSender;
		this.objectMapper = objectMapper;
	}

	@PostConstruct
	void logMailStatus() {
		if (isBrevoConfigured()) {
			log.info("Email delivery: ENABLED via Brevo HTTP API (from {})", fromAddress);
		} else if (isSmtpConfigured()) {
			log.info("Email delivery: ENABLED via SMTP host {} (from {})", mailHost, fromAddress);
		} else {
			log.warn("Email delivery: DISABLED — set BREVO_API_KEY, or MAIL_HOST + app password. {}",
					logLinks ? "Reset links will be printed to this console instead (local testing)."
							: "Password reset emails will not be sent.");
		}
	}

	public boolean isMailConfigured() {
		return isBrevoConfigured() || isSmtpConfigured();
	}

	private boolean isBrevoConfigured() {
		return brevoApiKey != null && !brevoApiKey.trim().isEmpty();
	}

	private boolean isSmtpConfigured() {
		return mailHost != null && !mailHost.trim().isEmpty()
				&& !isPlaceholderPassword()
				&& mailSender.getIfAvailable() != null;
	}

	/** Treat an empty or template password (from local-mail.properties.example) as "not configured". */
	private boolean isPlaceholderPassword() {
		String p = mailPassword == null ? "" : mailPassword.trim();
		return p.isEmpty() || p.equals("PASTE_APP_PASSWORD_HERE") || p.equals("your16charapppassword");
	}

	/** Runs asynchronously so response time doesn't reveal whether the account exists. */
	@Async
	public void sendPasswordResetEmail(String to, String name, String resetLink, long validMinutes) {
		String subject = "Reset your ExpTrack password";
		String text = plainText(name, resetLink, validMinutes);
		String html = html(name, resetLink, validMinutes);

		boolean sent;
		if (isBrevoConfigured()) {
			sent = sendViaBrevo(to, name, subject, text, html);
		} else if (isSmtpConfigured()) {
			sent = sendViaSmtp(to, subject, text, html);
		} else {
			log.warn("Email delivery is not configured — password reset email to {} NOT sent.", to);
			sent = false;
		}

		if (sent) {
			log.info("Password reset email sent to {}", to);
		} else if (logLinks) {
			log.warn("Reset link for {} (not emailed; printed for local testing): {}", to, resetLink);
		}
	}

	private boolean sendViaSmtp(String to, String subject, String text, String html) {
		try {
			MimeMessage message = mailSender.getObject().createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
			helper.setFrom(fromAddress, fromName);
			helper.setTo(to);
			helper.setSubject(subject);
			helper.setText(text, html);
			mailSender.getObject().send(message);
			return true;
		} catch (MessagingException | MailException | java.io.UnsupportedEncodingException e) {
			log.error("SMTP: failed to send email to {}: {}", to, e.getMessage());
			return false;
		}
	}

	private boolean sendViaBrevo(String to, String name, String subject, String text, String html) {
		try {
			Map<String, Object> body = new LinkedHashMap<>();
			Map<String, String> sender = new LinkedHashMap<>();
			sender.put("email", fromAddress);
			sender.put("name", fromName);
			body.put("sender", sender);
			Map<String, String> recipient = new LinkedHashMap<>();
			recipient.put("email", to);
			recipient.put("name", name);
			body.put("to", Collections.singletonList(recipient));
			body.put("subject", subject);
			body.put("htmlContent", html);
			body.put("textContent", text);

			HttpRequest request = HttpRequest.newBuilder(URI.create(brevoUrl))
					.timeout(Duration.ofSeconds(15))
					.header("api-key", brevoApiKey.trim())
					.header("Content-Type", "application/json")
					.header("Accept", "application/json")
					.POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
					.build();
			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			if (response.statusCode() / 100 == 2) {
				return true;
			}
			log.error("Brevo: failed to send email to {} (HTTP {}): {}", to, response.statusCode(), response.body());
			return false;
		} catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			log.error("Brevo: interrupted while sending email to {}", to);
			return false;
		} catch (Exception e) {
			log.error("Brevo: failed to send email to {}: {}", to, e.getMessage());
			return false;
		}
	}

	private String plainText(String name, String link, long minutes) {
		return "Hi " + name + ",\n\n"
				+ "We received a request to reset your ExpTrack password.\n"
				+ "Open this link to choose a new password (valid for " + minutes + " minutes):\n\n"
				+ link + "\n\n"
				+ "If you didn't ask for this, you can ignore this email — your password won't change.\n";
	}

	private String html(String name, String link, long minutes) {
		String safeName = HtmlUtils.htmlEscape(name);
		String safeLink = HtmlUtils.htmlEscape(link);
		return "<div style=\"background:#FFF8F1;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#1D1B23\">"
				+ "<div style=\"max-width:480px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden\">"
				+ "<div style=\"background:#F3543B;padding:28px 32px;color:#ffffff\">"
				+ "<div style=\"font-size:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;opacity:.85\">ExpTrack</div>"
				+ "<div style=\"font-size:28px;font-weight:800;line-height:1.1;margin-top:8px\">Reset your password</div>"
				+ "</div>"
				+ "<div style=\"padding:28px 32px\">"
				+ "<p style=\"margin:0 0 16px\">Hi " + safeName + ",</p>"
				+ "<p style=\"margin:0 0 24px;line-height:1.5\">We received a request to reset your password. "
				+ "Click the button below to choose a new one. This link is valid for <b>" + minutes + " minutes</b> and can be used once.</p>"
				+ "<a href=\"" + safeLink + "\" style=\"display:inline-block;background:#1D1B23;color:#ffffff;text-decoration:none;"
				+ "font-weight:bold;padding:14px 28px;border-radius:999px\">Reset password</a>"
				+ "<p style=\"margin:24px 0 0;font-size:13px;color:#7C7985;line-height:1.5\">If the button doesn't work, copy this link into your browser:<br>"
				+ "<a href=\"" + safeLink + "\" style=\"color:#DE4A31;word-break:break-all\">" + safeLink + "</a></p>"
				+ "<p style=\"margin:24px 0 0;font-size:13px;color:#7C7985\">Didn't ask for this? Ignore this email — your password won't change.</p>"
				+ "</div></div></div>";
	}
}
