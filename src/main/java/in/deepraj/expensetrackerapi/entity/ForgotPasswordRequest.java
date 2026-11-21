package in.deepraj.expensetrackerapi.entity;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

import lombok.Data;

@Data
public class ForgotPasswordRequest {

	@NotBlank(message = "Email should not be empty")
	@Email(message = "Enter a valid email")
	private String email;

	/** Trim before validation so " me@x.com " is accepted. */
	public void setEmail(String email) {
		this.email = email == null ? null : email.trim();
	}
}
