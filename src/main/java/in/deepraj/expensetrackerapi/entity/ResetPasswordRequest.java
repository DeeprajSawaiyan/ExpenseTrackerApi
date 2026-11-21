package in.deepraj.expensetrackerapi.entity;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import lombok.Data;

@Data
public class ResetPasswordRequest {

	@NotBlank(message = "Reset token is missing")
	private String token;

	@NotNull(message = "Password should not be empty")
	@Size(min = 5, message = "Password should be atleast 5 characters")
	private String newPassword;
}
