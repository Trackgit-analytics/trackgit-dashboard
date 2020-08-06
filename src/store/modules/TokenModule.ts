import {
  VuexModule,
  Module,
  Mutation,
  Action,
  getModule
} from "vuex-module-decorators";
import store from "@/store";
import Token, { TokenFirestore } from "@/models/interfaces/Token";
import FirebaseModule from "./FirebaseModule";
import CollectionNames from "@/models/data/CollectionNames";
import UserModule from "./UserModule";
import TokenHelper from "@/helpers/TokenHelper";
import Halfmoon from "@/helpers/Halfmoon";
import { API } from "@/models/data/LinkDirectory";
import TokenRequest from "@/models/interfaces/TokenRequest";
import CookieNames from "@/models/data/CookieNames";
import Vue from "vue";
import TokenSpec from "@/models/data/TokenSpec";

@Module({ dynamic: true, namespaced: true, store, name: "TokenModule" })
class TokenModule extends VuexModule {
  public tokens: Token[] | null = null;

  /** realtime listener for token documents */
  public tokensObserver: null | (() => void) = null;

  public activeToken: Token | null = null;

  @Mutation
  private setTokens(tokens: Token[]) {
    this.tokens = tokens;
  }

  @Mutation
  private setTokensObserver(tokensObserver: () => void) {
    this.tokensObserver = tokensObserver;
  }

  @Mutation
  private setActiveToken(token: Token) {
    this.activeToken = token;
  }

  @Mutation
  private setTokenData(newTokenData: Token) {
    const existingToken = this.tokens?.find(
      token => token.id === newTokenData.id
    );
    if (existingToken != null) {
      const tokensToUpdate = [existingToken];
      if (newTokenData.id === this.activeToken?.id) {
        tokensToUpdate.push(this.activeToken);
      }
      tokensToUpdate.forEach(token => {
        token.name = newTokenData.name;
        token.owner = newTokenData.owner;
        token.shortUrl = newTokenData.shortUrl;
        token.url = newTokenData.url;
      });
    }
  }

  @Action
  public updateTokenList(tokens: Token[]) {
    this.context.commit("setTokens", tokens);
  }

  @Action
  public updateTokenRequests(updateInfo: {
    tokenId: string;
    tokenRequests: TokenRequest[];
  }) {
    if (!this.tokens) {
      return;
    }

    const newTokenList = this.tokens;
    newTokenList.filter(
      token => token.id === updateInfo.tokenId
    )[0].tokenRequests = updateInfo.tokenRequests;

    this.context.commit("setTokens", newTokenList);
  }

  @Action
  public fetchAllTokens() {
    const tokensObserver = TokenHelper.setTokensListener();
    this.context.commit("setTokensObserver", tokensObserver);
  }

  @Action
  public async createToken(tokenName: string): Promise<string> {
    if (
      !UserModule.user ||
      tokenName.length < TokenSpec.minTokenNameSize ||
      tokenName.length > TokenSpec.maxTokenNameSize
    ) {
      return "";
    }

    const tokenId = TokenHelper.generateNewTokenId();
    const tokenUrl = API.tokenPingApi.replace("{0}", tokenId);
    const tokenShortUrl = await TokenHelper.getShortTokenUrl(tokenUrl);

    const newToken: TokenFirestore = {
      name: tokenName,
      owner: UserModule.user.uid,
      url: tokenUrl,
      shortUrl: tokenShortUrl
    };

    await FirebaseModule.db
      ?.collection(CollectionNames.tokens)
      .doc(tokenId)
      .set(newToken)
      .then(() => {
        Halfmoon.toastSuccess({
          content: "Successfully created new token"
        });
      })
      .catch(error => {
        Halfmoon.toastError({
          content: "Couldn't create a new token"
        });
        console.error(error);
      });

    return tokenId;
  }

  @Action
  public updateActiveToken(token: Token | undefined) {
    if (token != null) {
      Vue.$cookies.set(CookieNames.activeTokenId, token.id);
    }
    this.context.commit("setActiveToken", token);
  }

  @Action
  public updateTokenData(newTokenData: Token | undefined) {
    this.context.commit("setTokenData", newTokenData);
  }
}
export default getModule(TokenModule);
