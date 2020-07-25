import FormTypes from "./FormTypes";

/**
 * All hyperlinks used in the project
 */
export const Hyperlinks = {
  accountSettings: "/account-settings",
  donate: "https://trackgit.com/donate",
  recoverPassword: "/#forgot-password",
  login: `/${FormTypes.login}`,
  register: `/${FormTypes.register}`,
  tos: "https://trackgit.com/tos"
};

/**
 * API endpoints used in the project
 */
export const API = {
  /** API endpoint which a token pings to  */
  tokenPingApi:
    "https://us-central1-trackgit-analytics.cloudfunctions.net/token/ping/{0}",
  /** API endpoint for URL shortener */
  urlShortener: `https://shorturl-sfy-cx.p.rapidapi.com?url={0}`
};
