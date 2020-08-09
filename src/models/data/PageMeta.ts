import PageMetaTag from "@/models/interfaces/PageMetaTag";

/** Creates a meta object with all necessary information
 * @returns An object containing the meta properties
 */
function populateMeta(
  title: string,
  description: string,
  image: string
): { title: string; metaTags: PageMetaTag[] } {
  // eslint-disable-next-line
  const imageURL = require(`@/assets/${image}`);
  const result = {
    title,
    metaTags: [
      {
        name: "description",
        content: description
      },
      {
        property: "og:description",
        content: description
      },
      {
        property: "og:title",
        content: title
      },
      {
        property: "og:type",
        content: "website"
      },
      {
        property: "og:image",
        content: imageURL
      },
      {
        property: "twitter:card",
        content: "summary"
      },
      {
        property: "twitter:title",
        content: title
      },
      {
        property: "twitter:description",
        content: description
      },
      {
        property: "twitter:image",
        content: imageURL
      }
    ]
  };
  return result;
}

/**
 * All meta tags used by main pages
 */
const PageMeta = {
  /** meta tags for Dashboard.vue */
  Dashboard: populateMeta(
    "Dashboard - trackgit",
    "Supercharge your Github respositories with traffic analytics. Get insights like number of views over time in just a few clicks. And it's all free!",
    "metaImage.png"
  ),
  /** meta tags for Login */
  Login: populateMeta(
    "Login - trackgit",
    "Sign into your trackgit account",
    "metaImage.png"
  ),
  /** meta tags for Register */
  Register: populateMeta(
    "Register - trackgit",
    "Create a trackgit account. Sign up using email, or you can also create an account using your Google or Github account.",
    "metaImage.png"
  ),
  /** meta tags for Forgot Password */
  ForgotPassword: populateMeta(
    "Forgot password - trackgit",
    "Get instructions to recover your trackgit password",
    "metaImage.png"
  ),
  /** meta tags for Reset Password */
  ResetPassword: populateMeta(
    "Reset password - trackgit",
    "Create a new password for your trackgit account",
    "metaImage.png"
  ),
  /** meta tags for Email verification */
  EmailVerification: populateMeta(
    "Verify email - trackgit",
    "Verifying the email for your trackgit account",
    "metaImage.png"
  ),
  /** meta tags for Account settings */
  AccountSettings: populateMeta(
    "Account settings",
    "Change your trackgit account settings",
    "metaImage.png"
  ),
  /** meta tags for 404.vue */
  Error404: populateMeta(
    "Error 404",
    "The resource you requested couldn't be found. Error code: 404",
    "metaImage.png"
  )
};

export default PageMeta;
