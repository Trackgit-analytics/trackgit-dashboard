/** Event types for different cases */
enum EventTypes {
  login = "login",
  logout = "logout",
  signUp = "registration",
  updateProfile = "update-profile",
  userVerificationEmail = "verification-email-send",
  updatePassword = "update-password",
  passwordReset = "password-reset-email",
  userDelete = "user-delete"
}
export default EventTypes;
