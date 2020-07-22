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

  public isUserAuthenticated = false;

  @Mutation
  private setUser(user: firebase.User | null) {
    this.user = user;
  }

  @Mutation
  private setAuthenticated(isAuthenticated: boolean) {
    this.isUserAuthenticated = isAuthenticated;
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
}
export default getModule(UserModule);
