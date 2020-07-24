import {
  VuexModule,
  Module,
  Mutation,
  Action,
  getModule
} from "vuex-module-decorators";
import store from "@/store";
import Token, { TokenFields } from "@/models/interfaces/Token";
import FirebaseModule from "./FirebaseModule";
import CollectionNames from "@/models/data/CollectionNames";
import UserModule from "./UserModule";
import TokenHelper from "@/helpers/TokenHelper";
import Halfmoon, { HalfmoonAlertType } from "@/helpers/Halfmoon";

@Module({ dynamic: true, namespaced: true, store, name: "TokenModule" })
class TokenModule extends VuexModule {
  public tokens: Token[] = [];
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
  public async fetchAllTokens() {
    const tokens = new Array<Token>();

    const tokenSnapshot = await FirebaseModule.db
      ?.collection(CollectionNames.tokens)
      .where(TokenFields.owner, "==", UserModule.user?.uid)
      .get()
      .catch(() => {
        Halfmoon.toast({
          content: "Couldn't fetch token list",
          alertType: HalfmoonAlertType.danger
        });
      });

    if (tokenSnapshot) {
      tokenSnapshot?.forEach(async doc => {
        const { name, owner, url, shortUrl } = doc.data();
        const tokenRequests = await TokenHelper.getTokenRequests(doc.id);

        const token: Token = {
          id: doc.id,
          name,
          owner,
          url,
          shortUrl,
          tokenRequests
        };
        tokens.push(token);
      });
    }

    this.context.commit("setTokens", tokens);
  }

  @Action
  public updateActiveToken(token: Token) {
    this.context.commit("setActiveToken", token);
  }
}
export default getModule(TokenModule);
