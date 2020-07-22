import {
  VuexModule,
  Module,
  Mutation,
  Action,
  getModule
} from "vuex-module-decorators";
import store from "@/store";
import firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";
import FirebaseConfig from "@/models/data/FirebaseConfig";
import UserHelper from "@/helpers/UserHelper";

@Module({ dynamic: true, namespaced: true, store, name: "FirebaseModule" })
class FirebaseModule extends VuexModule {
  public app: firebase.app.App | null = null;

  public db: firebase.firestore.Firestore | null = null;

  public auth: firebase.auth.Auth | null = null;

  public analytics: firebase.analytics.Analytics | null = null;

  @Mutation
  private setFirebaseApp(firebaseApp: firebase.app.App) {
    this.app = firebaseApp;
  }

  @Mutation
  private setFirebaseDb(firebaseDb: firebase.firestore.Firestore) {
    this.db = firebaseDb;
  }

  @Mutation
  private setFirebaseAuth(firebaseAuth: firebase.auth.Auth) {
    this.auth = firebaseAuth;
  }

  @Mutation
  private setFirebaseAnalytics(
    firebaseAnalytics: firebase.analytics.Analytics
  ) {
    this.analytics = firebaseAnalytics;
  }

  @Action
  public async initializeApp() {
    if (this.app == null) {
      const firebaseApp = firebase.initializeApp(FirebaseConfig);
      this.context.commit("setFirebaseApp", firebaseApp);
    }

    if (this.db == null) {
      const firebaseDb = firebase.firestore();
      this.context.commit("setFirebaseDb", firebaseDb);
    }

    if (this.auth == null) {
      const firebaseAuth = firebase.auth();
      this.context.commit("setFirebaseAuth", firebaseAuth);
    }

    if (this.analytics == null) {
      const firebaseAnalytics = firebase.analytics();
      this.context.commit("setFirebaseAnalytics", firebaseAnalytics);
    }

    UserHelper.setAuthCallback();
  }
}
export default getModule(FirebaseModule);
