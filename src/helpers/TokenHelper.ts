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
import router from "@/router";
import ActionStatus from "@/models/interfaces/ActionStatus";
import UserHelper from "@/helpers/UserHelper";

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
   * @param timeToPast The maximum time, in milliseconds, between startDate and the last time log
   * @param token The token whose time logs to get. Returns [] if null token is given
   * @param startDate The UTC date to start getting data from
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
      } else {
        for (let j = 0; j < tokenRequest.timeLogs.length; j++) {
          const timeLog = tokenRequest.timeLogs[j];
          if (timeLog >= startDate && timeLog <= endDate) {
            timeLogsForPeriod.push(timeLog);
          }
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

    await FirebaseModule.db
      ?.doc(`${CollectionNames.tokens}/${token.id}`)
      .delete();
  }

  /**
   * Updates the browser URL route with the token ID
   * @param token The token whose route to show
   */
  public static updateTokenRoute(token: Token | undefined) {
    let newRoute;
    if (token != null) {
      newRoute = `/token/${token.id}`;
    } else {
      newRoute = "/";
    }
    if (router.currentRoute.path !== newRoute) {
      router.push({ path: newRoute });
    }
  }

  /** Reset all token data in TokenModule */
  public static resetData() {
    // unsubscribe token request listeners
    TokenModule.tokens?.forEach(token => {
      if (token.requestObserver) {
        token.requestObserver();
      }
    });

    // unsubscribe token listeners
    if (TokenModule.tokensObserver) {
      TokenModule.tokensObserver();
    }

    // update token lists
    TokenModule.updateActiveToken(undefined);
    TokenModule.updateTokenList(undefined);
  }

  /**
   * Transfer ownership of token to another user
   * @param tokenId The token Id of the token to transfer
   * @param newUserEmail  The firebase email of the user to transfer the token to
   * @returns An ActionStatus object which indicates whether the action succeeded
   */
  public static async transferOwnership(
    tokenId: string,
    newUserEmail: string
  ): Promise<ActionStatus> {
    const actionStatus: ActionStatus = {
      isSuccessful: true
    };

    const tokenExists = TokenModule.tokens?.find(token => token.id === tokenId);
    if (!tokenExists) {
      actionStatus.isSuccessful = false;
      actionStatus.message = "The token does not exist";
      return actionStatus;
    }

    const apiData = {
      tokenId,
      newUserEmail
    };

    const apiHeader = {
      usertoken: await UserHelper.getIdToken()
    };
    await baseService
      .post(API.tokenOwershipTransfer, apiData, {
        headers: apiHeader
      })
      .then(response => {
        actionStatus.isSuccessful = true;
        actionStatus.message = response.data;
      })
      .catch(error => {
        actionStatus.isSuccessful = false;
        if (error.response) {
          actionStatus.message = error.response.data;
        }
      });

    return actionStatus;
  }
}
