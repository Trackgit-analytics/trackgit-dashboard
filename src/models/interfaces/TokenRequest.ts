/** Field names of each token request document in firestore */
export enum TokenRequestFileds {
  deviceKey = "deviceKey",
  deviceType = "deviceType",
  location = "location",
  referrer = "referrer",
  time = "time",
  tokenId = "tokenId",
  userAgent = "userAgent"
}

/** A request interface for token requests */
interface TokenRequest {
  [TokenRequestFileds.deviceKey]: string;
  [TokenRequestFileds.deviceType]: string;
  [TokenRequestFileds.location]: {
    city: string;
    country: string;
  };
  [TokenRequestFileds.referrer]: string;
  [TokenRequestFileds.time]: number;
  [TokenRequestFileds.tokenId]: string;
  [TokenRequestFileds.userAgent]: string;
}

export default TokenRequest;
