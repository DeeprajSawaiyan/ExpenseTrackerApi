package in.deepraj.expensetrackerapi.service;

import java.util.Locale;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import in.deepraj.expensetrackerapi.entity.User;
import in.deepraj.expensetrackerapi.entity.UserModel;
import in.deepraj.expensetrackerapi.exceptions.ItemExistsException;
import in.deepraj.expensetrackerapi.exceptions.ResourceNotFoundException;
import in.deepraj.expensetrackerapi.repository.UserRepository;

@Service
public class UserServiceImpl implements UserService {
	
	@Autowired
	private PasswordEncoder bcryptEncoder;
	
	@Autowired
	private UserRepository userRepository;
	
	/** Emails are stored trimmed and lower-case so lookups never depend on how they were typed. */
	static String normalizeEmail(String email) {
		return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
	}

	@Override
	public User createUser(UserModel user) {
		String email = normalizeEmail(user.getEmail());
		if (userRepository.existsByEmailIgnoreCase(email)) {
			throw new ItemExistsException("User is already register with email:"+email);
		}
		User newUser = new User();
		BeanUtils.copyProperties(user, newUser);
		newUser.setEmail(email);
		newUser.setPassword(bcryptEncoder.encode(newUser.getPassword()));
		return userRepository.save(newUser);
	}

	@Override
	public User readUser() {
		Long userId = getLoggedInUser().getId();
		return userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found for the id:"+userId));
	}

	@Override
	public User updateUser(UserModel user) {
		User existingUser = readUser();
		existingUser.setName(user.getName() != null ? user.getName() : existingUser.getName());
		if (user.getEmail() != null) {
			String newEmail = normalizeEmail(user.getEmail());
			if (!newEmail.equalsIgnoreCase(existingUser.getEmail()) && userRepository.existsByEmailIgnoreCase(newEmail)) {
				throw new ItemExistsException("User is already register with email:"+newEmail);
			}
			existingUser.setEmail(newEmail);
		}
		existingUser.setPassword(user.getPassword() != null ? bcryptEncoder.encode(user.getPassword()) : existingUser.getPassword());
		existingUser.setAge(user.getAge() != null ? user.getAge() : existingUser.getAge());
		return userRepository.save(existingUser);
	}

	@Override
	public void deleteUser() {
		User existingUser = readUser();
		userRepository.delete(existingUser);
	}

	@Override
	public User getLoggedInUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		
		String email = authentication.getName();
		
		return userRepository.findByEmailIgnoreCase(email).orElseThrow(() -> new UsernameNotFoundException("User not found for the email"+email));
	}

}

























