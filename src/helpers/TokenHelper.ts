import FirebaseModule from "@/store/modules/FirebaseModule";
import CollectionNames from "@/models/data/CollectionNames";
import TokenRequest, {
  TokenRequestFileds
} from "@/models/interfaces/TokenRequest";
import Halfmoon, { HalfmoonAlertType } from "./Halfmoon";

export default class TokenHelper {
  /**
   * Get all requests from a token
   * @param tokenId The token ID whose requests to fetch
   */
  public static async getTokenRequests(
    tokenId: string
  ): Promise<TokenRequest[]> {
    const requests: TokenRequest[] = [];

    const tokenRequestsSnapShot = await FirebaseModule.db
      ?.collection(CollectionNames.tokens)
      .doc(tokenId)
      .collection(CollectionNames.requests)
      .where(TokenRequestFileds.tokenId, "==", tokenId)
      .get()
      .catch(() => {
        Halfmoon.toast({
          content: "Couldn't fetch token request list",
          alertType: HalfmoonAlertType.danger
        });
      });

    if (tokenRequestsSnapShot) {
      tokenRequestsSnapShot?.forEach(doc => {
        requests.push(doc.data() as TokenRequest);
      });
    }

    return requests;
  }
}
