import {
  VuexModule,
  Module,
  Mutation,
  Action,
  getModule
} from "vuex-module-decorators";
import store from "@/store";
import CookieNames from "@/models/data/CookieNames";
import Vue from "vue";
import FirebaseModule from "./FirebaseModule";

@Module({ dynamic: true, namespaced: true, store, name: "UserModule" })
class UserModule extends VuexModule {
  public user: firebase.User | null = null;

  // Github access token for user, only initialized when user signs in with Github
  public userGithubToken: string | null = null;

  /**
   * If the user is logged in returns true, false if the user isn't logged in.
   * A null status indicates that firebase hasn't initialized yet.
   */
  public isUserAuthenticated: boolean | null = null;

  @Mutation
  private setUser(user: firebase.User | null) {
    this.user = user;
  }

  @Mutation
  private setAuthenticated(isAuthenticated: boolean) {
    this.isUserAuthenticated = isAuthenticated;
  }

  @Mutation
  private setGithubToken(githubToken: string) {
    this.userGithubToken = githubToken;
  }

  @Action
  public updateUser(user: firebase.User | null) {
    if (user != null) {
      Vue.$cookies.set(CookieNames.lastSignIn, user.metadata.lastSignInTime);
      this.context.commit("setAuthenticated", true);
      FirebaseModule.analytics?.setUserId(user.uid);
    } else {
      this.context.commit("setAuthenticated", false);
    }
    this.context.commit("setUser", user);
  }

  @Action
  public updateUserGithubToken(githubToken: string) {
    this.context.commit("setGithubToken", githubToken);
  }
}
export default getModule(UserModule);
