package in.deepraj.expensetrackerapi.entity;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "tbl_users")
public class User {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private String name;
	
	@Column(unique = true)
	private String email;
	
	@JsonIgnore
	private String password;
	
	private Long age;
	
	@Column(name = "created_at", nullable = false, updatable = false)
	@CreationTimestamp
	private Timestamp createdAt;
	
	@Column(name = "updated_at")
	@UpdateTimestamp
	private Timestamp updatedAt;

	/**
	 * Embedded in every JWT. Incrementing it signs the user out on all devices
	 * (done on password reset). Null for rows created before this column existed.
	 */
	@JsonIgnore
	@Column(name = "token_version")
	private Long tokenVersion = 0L;

	@JsonIgnore
	public long getTokenVersionOrZero() {
		return tokenVersion == null ? 0L : tokenVersion;
	}

	/** Invalidates every JWT issued so far for this user. */
	public void revokeAllTokens() {
		tokenVersion = getTokenVersionOrZero() + 1;
	}

}














