/** Creates a meta object with all necessary information
 * @returns An object containing the meta properties
 */
function populateMeta(title: string, description: string, image: string) {
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
    "Supercharge your Github respositories with audience traffic analytics. Get insights like number of views, traffic location, visits over time, and more in just a few clicks.",
    "metaImage.png"
  ),
  /** meta tags for Login */
  Login: populateMeta(
    "Login - trackgit",
    "Sign into your trackgit account",
    "metaImage.png"
  ),
  /** meta tags for Login */
  Register: populateMeta(
    "Register - trackgit",
    "Create a trackgit account. Sign up using email, or you can also create an account using your Google or Github account.",
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