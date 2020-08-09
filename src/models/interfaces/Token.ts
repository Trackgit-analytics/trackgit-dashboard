import TokenRequest from "./TokenRequest";

/** Field names of each token document in firestore */
export enum TokenFields {
  id = "id",
  name = "name",
  owner = "owner",
  url = "url",
  shortUrl = "shortUrl",
  tokenRequests = "tokenRequests",
  requestObserver = "requestObserver"
}

/** Interface for trackgit tokens */
interface Token {
  [TokenFields.id]: string;
  [TokenFields.name]: string;
  [TokenFields.owner]: string;
  [TokenFields.url]: string;
  [TokenFields.shortUrl]: string;
  [TokenFields.tokenRequests]: TokenRequest[];
  [TokenFields.requestObserver]?: () => void;
}

export default Token;

/** The token document structure in firestore */
export interface TokenFirestore {
  [TokenFields.name]: string;
  [TokenFields.owner]: string;
  [TokenFields.url]: string;
  [TokenFields.shortUrl]: string;
}
