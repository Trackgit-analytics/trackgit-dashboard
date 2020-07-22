import FirebaseModule from "@/store/modules/FirebaseModule";
import firebase from "firebase";
import EventTypes from "@/models/data/EventTypes";
import ActionStatus from "@/models/interfaces/ActionStatus";
import LogCategories from "@/models/data/LogCategories";
import ActionTypes from "@/models/data/ActionTypes";
import Vue from "vue";
import UserModule from "@/store/modules/UserModule";
import LogTypes from "@/models/data/LogTypes";

export default class UserHelper {
  private static avatarUrl =
    "https://avatars.dicebear.com/api/jdenticon/{0}.svg?r=50&m=17";

  /**
   * Sign in a user with firebase authentication
   * @param email The email for the account
   * @param password The password for the account
   * @returns An ActionStatus object which indicates whether the action succeeded
   */
  public static async signIn(
    email: string,
    password: string
  ): Promise<ActionStatus> {
    const actionStatus: ActionStatus = {
      isSuccessful: true
    };

    await FirebaseModule.auth
      ?.signInWithEmailAndPassword(email, password)
      .catch(error => {
        actionStatus.isSuccessful = false;
        actionStatus.message = error.message;

        FirebaseModule.analytics?.logEvent(LogTypes.error, {
          category: LogCategories.auth,
          user: email,
          event: EventTypes.login,
          error
        });
      });

    if (actionStatus.isSuccessful) {
      FirebaseModule.analytics?.logEvent(LogTypes.success, {
        event: EventTypes.login,
        category: LogCategories.auth
      });
    }

    return actionStatus;
  }

  /**
   * Create a new user into firebase
   * @param name The user's full name
   * @param email The user's email
   * @param password The user's password
   * @returns An ActionStatus object which indicates whether the action succeeded
   */
  public static async signUp(
    name: string,
    email: string,
    password: string
  ): Promise<ActionStatus> {
    let actionStatus: ActionStatus = {
      isSuccessful: true
    };

    await FirebaseModule.auth
      ?.createUserWithEmailAndPassword(email, password)
      .catch(error => {
        actionStatus.isSuccessful = false;
        actionStatus.message = error.message;
        FirebaseModule.analytics?.logEvent(LogTypes.error, {
          category: LogCategories.auth,
          user: email,
          event: EventTypes.signUp,
          error
        });
      });

    if (actionStatus.isSuccessful === true) {
      await FirebaseModule.auth?.setPersistence(
        firebase.auth.Auth.Persistence.LOCAL
      );

      FirebaseModule.analytics?.logEvent(LogTypes.success, {
        action: ActionTypes.add,
        category: LogCategories.auth,
        user: FirebaseModule.auth?.currentUser?.uid
      });

      actionStatus = await this.updateName(name);

      this.sendEmailVerification();
    }

    return actionStatus;
  }

  /**
   * Update a user's full name into firebase
   * @param name The user's full name
   * @returns An ActionStatus object which indicates whether the action succeeded
   */
  public static async updateName(newName: string): Promise<ActionStatus> {
    const userId = FirebaseModule.auth?.currentUser?.uid as string;
    const actionStatus: ActionStatus = {
      isSuccessful: true
    };

    await FirebaseModule.auth?.currentUser
      ?.updateProfile({
        displayName: newName,
        photoURL: this.avatarUrl.replace("{0}", userId)
      })
      .catch(error => {
        actionStatus.isSuccessful = false;
        actionStatus.message = error.message;
        FirebaseModule.analytics?.logEvent(LogTypes.error, {
          category: LogCategories.auth,
          user: userId,
          event: EventTypes.updateProfile,
          error
        });
      });

    if (actionStatus.isSuccessful) {
      FirebaseModule.analytics?.logEvent(LogTypes.success, {
        action: ActionTypes.update,
        category: LogCategories.auth,
        user: userId,
        property: "name"
      });
    }

    return actionStatus;
  }

  /**
   * Update a user's password into firebase
   * @param password The user's password
   * @returns An ActionStatus object which indicates whether the action succeeded
   */
  public static async updatePassword(
    newPassword: string
  ): Promise<ActionStatus> {
    const actionStatus: ActionStatus = {
      isSuccessful: true
    };
    const userId = FirebaseModule.auth?.currentUser?.uid;

    await FirebaseModule.auth?.currentUser
      ?.updatePassword(newPassword)
      .catch(error => {
        actionStatus.isSuccessful = false;
        actionStatus.message = error.message;
        FirebaseModule.analytics?.logEvent(LogTypes.error, {
          category: LogCategories.auth,
          user: userId,
          event: EventTypes.updatePassword,
          error
        });
      });

    if (actionStatus.isSuccessful) {
      FirebaseModule.analytics?.logEvent(LogTypes.success, {
        action: ActionTypes.update,
        category: LogCategories.auth,
        user: userId,
        property: "password"
      });
    }

    return actionStatus;
  }

  /**
   * Send verification email out from firebase
   * @returns An ActionStatus object which indicates whether the action succeeded
   */
  public static async sendEmailVerification(): Promise<ActionStatus> {
    const actionStatus: ActionStatus = {
      isSuccessful: true
    };

    await FirebaseModule.auth?.currentUser
      ?.sendEmailVerification()
      .catch(error => {
        actionStatus.isSuccessful = false;
        actionStatus.message = error.message;
      });

    return actionStatus;
  }

  /**
   * Send password recovery information out from firebase
   * @returns An ActionStatus object which indicates whether the action succeeded
   */
  public static async sendPasswordRecovery(
    email: string
  ): Promise<ActionStatus> {
    const actionStatus: ActionStatus = {
      isSuccessful: true
    };

    await FirebaseModule.auth?.sendPasswordResetEmail(email).catch(error => {
      actionStatus.isSuccessful = false;
      actionStatus.message = error.message;
      FirebaseModule.analytics?.logEvent(LogTypes.error, {
        category: LogCategories.auth,
        user: FirebaseModule.auth?.currentUser?.uid,
        event: EventTypes.passwordReset,
        error
      });
    });

    return actionStatus;
  }

  /**
   * Delete the logged in user from firebase
   * @returns An ActionStatus object which indicates whether the action succeeded
   */
  public static async deactivate(): Promise<ActionStatus> {
    const actionStatus: ActionStatus = {
      isSuccessful: true
    };

    await FirebaseModule.auth?.currentUser?.delete().catch(error => {
      actionStatus.isSuccessful = false;
      actionStatus.message = error.message;
      FirebaseModule.analytics?.logEvent(LogTypes.error, {
        category: LogCategories.auth,
        user: FirebaseModule.auth?.currentUser?.uid,
        event: EventTypes.userDelete,
        error
      });
    });

    if (actionStatus) {
      FirebaseModule.analytics?.logEvent(LogTypes.success, {
        category: LogCategories.auth,
        action: ActionTypes.delete
      });
    }

    return actionStatus;
  }

  /** Used to indicate whether the user is a first time user */
  public static isFirstTime(): boolean {
    return !Vue.$cookies.isKey("lastSignIn");
  }

  /** Set callback for when an authentication event occurs */
  public static setAuthCallback() {
    if (!FirebaseModule.auth) {
      FirebaseModule.initializeApp();
    } else {
      FirebaseModule.auth.onAuthStateChanged(user =>
        UserModule.updateUser(user)
      );
    }
  }
}
