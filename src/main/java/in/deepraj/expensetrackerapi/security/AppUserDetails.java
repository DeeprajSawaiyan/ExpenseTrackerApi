package in.deepraj.expensetrackerapi.security;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

/**
 * Spring Security user that also carries the account's token version.
 * JWTs embed this version; bumping it (e.g. on password reset) invalidates every earlier token.
 */
public class AppUserDetails extends User {

	private static final long serialVersionUID = 1L;

	private final long tokenVersion;

	public AppUserDetails(String username, String password, Collection<? extends GrantedAuthority> authorities,
			long tokenVersion) {
		super(username, password, authorities);
		this.tokenVersion = tokenVersion;
	}

	public long getTokenVersion() {
		return tokenVersion;
	}
}
