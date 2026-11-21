package in.deepraj.expensetrackerapi.entity;

import lombok.Data;

@Data
public class AuthModel {

	private String email;
	
	private String password;

	/** Trim before validation so " me@x.com " is accepted. */
	public void setEmail(String email) {
		this.email = email == null ? null : email.trim();
	}
}
