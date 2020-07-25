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
import Halfmoon, { HalfmoonAlertType } from "@/helpers/Halfmoon";
import { API } from "@/models/data/LinkDirectory";
import TokenRequest from "@/models/interfaces/TokenRequest";

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
  public async fetchAllTokens() {
    await FirebaseModule.db
      ?.collection(CollectionNames.tokens)
      .where(TokenFields.owner, "==", UserModule.user?.uid)
      .onSnapshot(
        tokenSnapshot => {
          const tokens = new Array<Token>();

          tokenSnapshot?.forEach(async doc => {
            const { name, owner, url, shortUrl } = doc.data();
            await TokenHelper.setTokenRequestListener(doc.id, name);

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
          Halfmoon.toast({
            content: "Couldn't fetch token list",
            alertType: HalfmoonAlertType.danger
          });
        }
      );
  }

  @Action
  public async createToken(tokenName: string) {
    if (!UserModule.user) {
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
        Halfmoon.toast({
          content: "Successfully created new token",
          alertType: HalfmoonAlertType.success
        });
        this.context.commit("setActiveToken", tokenId);
      })
      .catch(error => {
        Halfmoon.toast({
          content: "Couldn't create a new token",
          alertType: HalfmoonAlertType.danger
        });
        console.error(error);
      });
  }

  @Action
  public updateActiveToken(token: Token) {
    this.context.commit("setActiveToken", token);
  }
}
export default getModule(TokenModule);
