import TokenRequest from "./TokenRequest";

/** Interface for trackgit tokens */
interface Token {
  id: string;
  name: string;
  owner: string;
  url: string;
  shortUrl: string;
  tokenRequests: TokenRequest[];
}

export default Token;
