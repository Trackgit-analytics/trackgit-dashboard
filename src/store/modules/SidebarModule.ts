import {
  VuexModule,
  Module,
  Mutation,
  Action,
  getModule
} from "vuex-module-decorators";
import store from "@/store";

@Module({ dynamic: true, namespaced: true, store, name: "SidebarModule" })
class SidebarModule extends VuexModule {
  public isOpen = false;

  @Mutation
  private setIsOpen(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  @Action
  public updateSidebarVisibility(isOpen: boolean) {
    this.context.commit("setIsOpen", isOpen);
  }
}
export default getModule(SidebarModule);
