import FirebaseModule from "@/store/modules/FirebaseModule";
import CollectionNames from "@/models/data/CollectionNames";
import TokenRequest, {
  TokenRequestFileds
} from "@/models/interfaces/TokenRequest";
import Halfmoon, { HalfmoonAlertType } from "./Halfmoon";
import baseService from "@/services/baseService";
import { API } from "@/models/data/LinkDirectory";
import ApiKeys from "@/models/data/ApiKeys";
import TokenModule from "@/store/modules/TokenModule";

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

  /**
   * Sets up a realtime listener for requests on the token.
   * The listener updates TokenModule as data updates in firestore.
   * @param tokenId The token Id whose requests to listen to
   * @param tokenName The name of the token (only used for displaying errors)
   */
  public static async setTokenRequestListener(
    tokenId: string,
    tokenName: string
  ) {
    await FirebaseModule.db
      ?.collection(CollectionNames.tokens)
      .doc(tokenId)
      .collection(CollectionNames.requests)
      .where(TokenRequestFileds.tokenId, "==", tokenId)
      .onSnapshot(
        tokenRequestsSnapShot => {
          const tokenRequests: TokenRequest[] = [];

          tokenRequestsSnapShot.forEach(doc => {
            tokenRequests.push(doc.data() as TokenRequest);
          });

          TokenModule.updateTokenRequests({ tokenId, tokenRequests });
        },
        () => {
          Halfmoon.toast({
            content: `Couldn't fetch requests for token: ${tokenName}`,
            alertType: HalfmoonAlertType.danger
          });
        }
      );
  }

  /** Generate a random 20-character ID for tokens */
  public static generateNewTokenId(): string {
    let id = "";
    for (let i = 0; i < 2; i++) {
      id +=
        Date.now().toString(36) +
        Math.random()
          .toString(36)
          .substr(2, 20);
    }
    return id.substr(0, 20);
  }

  /**
   * Generate a shortended URL for tokens
   * @param tokenUrl The long url to shorten
   * @returns A shortended url, or the long url if the url shortener API fails
   */
  public static async getShortTokenUrl(tokenUrl: string): Promise<string> {
    let shortUrl = "";

    const url = API.urlShortener.replace("{0}", tokenUrl);
    const headers = {
      "x-rapidapi-host": "shorturl-sfy-cx.p.rapidapi.com",
      "x-rapidapi-key": ApiKeys.rapidApi
    };

    try {
      const response = await baseService.get(url, { headers });

      if (response.status === 200) {
        const result = new DOMParser().parseFromString(
          response.data,
          "text/xml"
        );
        shortUrl = (result.firstChild as HTMLAnchorElement).innerHTML;
      }
    } catch {
      shortUrl = tokenUrl;
    }

    return shortUrl;
  }
}
