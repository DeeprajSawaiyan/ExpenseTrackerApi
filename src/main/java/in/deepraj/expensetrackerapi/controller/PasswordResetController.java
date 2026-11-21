package in.deepraj.expensetrackerapi.controller;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import in.deepraj.expensetrackerapi.entity.ForgotPasswordRequest;
import in.deepraj.expensetrackerapi.entity.ResetPasswordRequest;
import in.deepraj.expensetrackerapi.service.EmailService;
import in.deepraj.expensetrackerapi.service.PasswordResetService;

@RestController
public class PasswordResetController {

	private final PasswordResetService passwordResetService;
	private final EmailService emailService;

	public PasswordResetController(PasswordResetService passwordResetService, EmailService emailService) {
		this.passwordResetService = passwordResetService;
		this.emailService = emailService;
	}

	/** Always returns the same response so it can't be used to check which emails are registered. */
	@PostMapping("/forgot-password")
	public ResponseEntity<Map<String, Object>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
		passwordResetService.requestReset(request.getEmail());
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("message", "If an account exists for that email, a password reset link has been sent.");
		// Server-wide setting (same for every email), so it reveals nothing about which accounts exist.
		// Lets the UI say plainly when this server can't send email at all.
		body.put("emailDeliveryEnabled", emailService.isMailConfigured());
		return ResponseEntity.ok(body);
	}

	@PostMapping("/reset-password")
	public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
		passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
		return ResponseEntity.ok(Collections.singletonMap("message",
				"Your password has been reset. You can now sign in with your new password."));
	}
}
