import {
  VuexModule,
  Module,
  Mutation,
  Action,
  getModule
} from "vuex-module-decorators";
import store from "@/store";
import Token, { TokenFields, TokenFirestore } from "@/models/interfaces/Token";
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
  public activeToken: Token | null = null;

  @Mutation
  private setTokens(tokens: Token[]) {
    this.tokens = tokens;
  }

  @Mutation
  private setActiveToken(token: Token) {
    this.activeToken = token;
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
    FirebaseModule.db
      ?.collection(CollectionNames.tokens)
      .where(TokenFields.owner, "==", UserModule.user?.uid)
      .onSnapshot(
        tokenSnapshot => {
          const tokens: Token[] = [];

          tokenSnapshot.forEach(doc => {
            const { name, owner, url, shortUrl } = doc.data();
            TokenHelper.setTokenRequestListener(doc.id, name);

            const token: Token = {
              id: doc.id,
              name,
              owner,
              url,
              shortUrl,
              tokenRequests: []
            };
            tokens.push(token);
          });

          this.context.commit("setTokens", tokens);
        },
        () => {
          Halfmoon.toastError({
            content: "Couldn't fetch token list"
          });
        }
      );
  }

  @Action
  public async createToken(tokenName: string) {
    if (
      !UserModule.user ||
      tokenName.length < TokenSpec.minTokenNameSize ||
      tokenName.length > TokenSpec.maxTokenNameSize
    ) {
      return;
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

        // on success, set the new token as the selected token
        const addedToken: Token = {
          id: tokenId,
          tokenRequests: [],
          ...newToken
        };
        this.context.commit("setActiveToken", addedToken);
      })
      .catch(error => {
        Halfmoon.toastError({
          content: "Couldn't create a new token"
        });
        console.error(error);
      });
  }

  @Action
  public updateActiveToken(token: Token) {
    Vue.$cookies.set(CookieNames.activeTokenId, token.id);
    this.context.commit("setActiveToken", token);
  }
}
export default getModule(TokenModule);
