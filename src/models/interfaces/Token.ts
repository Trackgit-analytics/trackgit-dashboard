import TokenRequest from "./TokenRequest";

/** Field names of each token document in firestore */
export enum TokenFields {
  id = "id",
  name = "name",
  owner = "owner",
  url = "url",
  shortUrl = "shortUrl",
  tokenRequests = "tokenRequests"
}

/** Interface for trackgit tokens */
interface Token {
  [TokenFields.id]: string;
  [TokenFields.name]: string;
  [TokenFields.owner]: string;
  [TokenFields.url]: string;
  [TokenFields.shortUrl]: string;
  [TokenFields.tokenRequests]: TokenRequest[];
}

export default Token;
