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
import Token, { TokenFields } from "@/models/interfaces/Token";
import TokenSpec from "@/models/data/TokenSpec";
import UserModule from "@/store/modules/UserModule";

export default class TokenHelper {
  /**
   * Set up a realtime listener for changes in tokens belonging to user.
   * This listener updates TokenModule tokens as data updates in firestore.
   * @returns The firestore observer for token updates
   */
  public static setTokensListener() {
    return FirebaseModule.db
      ?.collection(CollectionNames.tokens)
      .where(TokenFields.owner, "==", UserModule.user?.uid)
      .onSnapshot(
        tokenSnapshot => {
          const tokens: Token[] = [];

          tokenSnapshot.forEach(doc => {
            const { name, owner, url, shortUrl } = doc.data();
            const requestObserver = TokenHelper.setTokenRequestListener(doc.id);

            const token: Token = {
              id: doc.id,
              name,
              owner,
              url,
              shortUrl,
              tokenRequests: [],
              requestObserver
            };
            tokens.push(token);
          });

          TokenModule.updateTokenList(tokens);

          /** If a new document was added, toggle that as the active token */
          const addedDocs = tokenSnapshot
            .docChanges()
            .filter(change => change.type === "added");
          if (addedDocs.length === 1) {
            const activeToken = tokens.find(
              token => token.id === addedDocs[0].doc.id
            );
            TokenModule.updateActiveToken(activeToken);
          }
        },
        () => {
          Halfmoon.toastError({
            content: "Couldn't fetch token list"
          });
        }
      );
  }

  /**
   * Sets up a realtime listener for requests on the token.
   * The listener updates TokenModule as data updates in firestore.
   * @param tokenId The token Id whose requests to listen to
   * @returns The firestore observer for request updates
   */
  public static setTokenRequestListener(tokenId: string) {
    return FirebaseModule.db
      ?.doc(`${CollectionNames.tokens}/${tokenId}`)
      .collection(CollectionNames.requests)
      .where(TokenRequestFileds.tokenId, "==", tokenId)
      .onSnapshot(tokenRequestsSnapShot => {
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
      });
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
        tokenRequest.groupId <= endDate &&
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

  /**
   * Update the token name
   * @param token The token to change
   * @param newName The new name to assign
   */
  public static async changeTokenName(token: Token, newName: string) {
    if (
      newName != null &&
      newName.length >= TokenSpec.minTokenNameSize &&
      newName.length <= TokenSpec.maxTokenNameSize
    ) {
      await FirebaseModule.db
        ?.doc(`${CollectionNames.tokens}/${token.id}`)
        .update({ name: newName });
    }
  }

  /**
   * Delete a token from firestore
   * @param token The token to delete
   */
  public static async deleteToken(token: Token) {
    // unsubscribe the token requests observer
    if (token.requestObserver != null) {
      token.requestObserver();
    }

    TokenModule.updateActiveToken(undefined);

    await FirebaseModule.db
      ?.doc(`${CollectionNames.tokens}/${token.id}`)
      .delete();
  }
}
