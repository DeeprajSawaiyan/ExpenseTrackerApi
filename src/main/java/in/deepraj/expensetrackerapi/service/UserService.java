package in.deepraj.expensetrackerapi.service;

import in.deepraj.expensetrackerapi.entity.User;
import in.deepraj.expensetrackerapi.entity.UserModel;

public interface UserService {
	
	User createUser(UserModel user);
	
	User readUser();
	
	User updateUser(UserModel user);
	
	void deleteUser();
	
	User getLoggedInUser();
}
