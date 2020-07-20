import {
  VuexModule,
  Module,
  Mutation,
  Action,
  getModule
} from "vuex-module-decorators";
import store from "@/store";
import Token from "@/models/interfaces/Token";
import mockTokens from "@/models/mocks/mockTokens";

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
    const tokens = mockTokens;
    this.context.commit("setTokens", tokens);
  }

  @Action
  public updateActiveToken(token: Token) {
    this.context.commit("setActiveToken", token);
  }
}
export default getModule(TokenModule);
