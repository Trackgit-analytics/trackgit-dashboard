import FirebaseModule from "@/store/modules/FirebaseModule";
import CollectionNames from "@/models/data/CollectionNames";
import TokenRequest, {
  TokenRequestFileds
} from "@/models/interfaces/TokenRequest";
import Halfmoon from "./Halfmoon";
import baseService from "@/services/baseService";
import { API } from "@/models/data/LinkDirectory";
import ApiKeys from "@/models/data/ApiKeys";
import TokenModule from "@/store/modules/TokenModule";
import Token from "@/models/interfaces/Token";

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
        Halfmoon.toastError({
          content: "Couldn't fetch token request list"
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
  public static setTokenRequestListener(tokenId: string, tokenName: string) {
    FirebaseModule.db
      ?.collection(CollectionNames.tokens)
      .doc(tokenId)
      .collection(CollectionNames.requests)
      .where(TokenRequestFileds.tokenId, "==", tokenId)
      .onSnapshot(
        tokenRequestsSnapShot => {
          const tokenRequests: TokenRequest[] = [];

          tokenRequestsSnapShot.forEach(doc => {
            const tokenRequest = doc.data() as TokenRequest;

            // add the date timestamps to each timelog (ie. decode the timelogs)
            for (let i = 0; i < tokenRequest.timeLogs.length; i++) {
              tokenRequest.timeLogs[i] += tokenRequest.groupId;
            }

            tokenRequests.push(tokenRequest);
          });

          TokenModule.updateTokenRequests({ tokenId, tokenRequests });
        },
        () => {
          Halfmoon.toastError({
            content: `Couldn't fetch requests for token: ${tokenName}`
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

  /**
   * Get the time logs for the given token for a specific period of time
   * @param timeToPast The maximum time, in milliseconds, between now and the last time log
   * @param token The token whose time logs to get. Returns [] if null token is given
   * @param startDate (optional - default date.now) The dat to start getting data from
   */
  public static getTimeLogs(
    token: Token | null,
    startDate: number,
    endDate: number
  ): number[] {
    if (!token) {
      return [];
    }
    const timeLogsForPeriod: number[] = [];

    for (let i = 0; i < token.tokenRequests.length; i++) {
      const tokenRequest = token.tokenRequests[i];
      if (!tokenRequest) {
        continue;
      } else if (
        endDate >= tokenRequest.groupId &&
        tokenRequest.groupId >= startDate
      ) {
        for (let j = 0; j < tokenRequest.timeLogs.length; j++) {
          const timeLog = tokenRequest.timeLogs[j];
          timeLogsForPeriod.push(timeLog);
        }
      }
    }
    return timeLogsForPeriod;
  }
}
