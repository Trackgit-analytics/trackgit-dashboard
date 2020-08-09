/** The different form types used in routing*/
enum FormTypes {
  /** for the login page */
  login = "login",
  /** for the register page */
  register = "register",
  /** for forgot password page */
  forgotPassword = "forgot-password",
  /** forms which come from email links */
  emailReferrer = "email-referrer"
}

export default FormTypes;
