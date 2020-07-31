import {
  VuexModule,
  Module,
  Mutation,
  Action,
  getModule
} from "vuex-module-decorators";
import store from "@/store";
import Halfmoon from "@/helpers/Halfmoon";

@Module({ dynamic: true, namespaced: true, store, name: "HalfmoonModule" })
class HalfmoonModule extends VuexModule {
  isDarkMode = false;

  @Mutation
  private setDarkMode(isDarkMode: boolean) {
    this.isDarkMode = isDarkMode;
  }

  @Action
  public updateDarkMode(isDarkMode: boolean) {
    if (isDarkMode !== Halfmoon.isDarkModeOn()) {
      Halfmoon.toggleDarkMode();
    }

    this.context.commit("setDarkMode", isDarkMode);
  }

  @Action toggleDarkMode() {
    Halfmoon.toggleDarkMode();
    this.context.commit("setDarkMode", !this.isDarkMode);
  }
}
export default getModule(HalfmoonModule);
