/** Field names of each token request document in firestore */
export enum TokenRequestFileds {
  groupId = "groupId",
  requestCount = "requestCount",
  timeLogs = "timeLogs",
  tokenId = "tokenId"
}

/** A request interface for token requests */
interface TokenRequest {
  [TokenRequestFileds.groupId]: number;
  [TokenRequestFileds.requestCount]: number;
  [TokenRequestFileds.timeLogs]: number[];
  [TokenRequestFileds.tokenId]: string;
}

export default TokenRequest;
