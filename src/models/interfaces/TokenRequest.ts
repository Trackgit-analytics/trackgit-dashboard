/** A request interface for token requests */
interface TokenRequest {
  deviceKey: string;
  deviceType: string;
  location: {
    city: string;
    country: string;
  };
  time: number;
  tokenId: string;
  userAgent: string;
}

export default TokenRequest;
