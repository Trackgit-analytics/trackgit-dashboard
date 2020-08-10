import FirebaseModule from "@/store/modules/FirebaseModule";
import firebase from "firebase/app";
import EventTypes from "@/models/data/EventTypes";
import ActionStatus from "@/models/interfaces/ActionStatus";
import LogCategories from "@/models/data/LogCategories";
import ActionTypes from "@/models/data/ActionTypes";
import Vue from "vue";
import UserModule from "@/store/modules/UserModule";
import LogTypes from "@/models/data/LogTypes";
import DeviceHelper from "@/helpers/DeviceHelper";

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
   * Initiates a login/signup process with GitHub
   * @returns An ActionStatus object which indicates whether the action succeeded
   */
  public static async signInWithGithub(): Promise<ActionStatus> {
    const actionStatus: ActionStatus = {
      isSuccessful: true
    };
    const provider = new firebase.auth.GithubAuthProvider();
    provider.addScope("read:user,user:email");

    // callback when github authentication succeeds
    function authSuccess(result: firebase.auth.UserCredential) {
      const githubToken = (result.credential as firebase.auth.OAuthCredential)
        .accessToken;
      if (githubToken != null) {
        UserModule.updateUserGithubToken(githubToken);
      }
    }
    // callback when github authentication fails
    function authFailure(error: string) {
      actionStatus.isSuccessful = false;
      actionStatus.message = error;
    }

    // use popup auth in desktop, use redirect auth in mobile
    if (DeviceHelper.isPhone()) {
      await FirebaseModule.auth?.signInWithRedirect(provider);
      await FirebaseModule.auth
        ?.getRedirectResult()
        .then(result => authSuccess(result))
        .catch(error => authFailure(error));
    } else {
      await FirebaseModule.auth
        ?.signInWithPopup(provider)
        .then(result => authSuccess(result))
        .catch(error => authFailure(error));
    }

    return actionStatus;
  }

  /**
   * Sign out the currently logged in user
   * @returns An ActionStatus object which indicates whether the action succeeded
   */
  public static async signOut(): Promise<ActionStatus> {
    const actionStatus: ActionStatus = {
      isSuccessful: true
    };

    await FirebaseModule.auth?.signOut().catch(error => {
      actionStatus.isSuccessful = false;
      actionStatus.message = error.message;
      FirebaseModule.analytics?.logEvent(LogTypes.error, {
        category: LogCategories.auth,
        user: FirebaseModule.auth?.currentUser?.uid,
        event: EventTypes.logout,
        error
      });
    });

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
    const actionStatus: ActionStatus = {
      isSuccessful: true
    };
    if (UserModule.user == null) {
      actionStatus.isSuccessful = false;
      actionStatus.message = "Please log in to continue.";
      return actionStatus;
    }
    const userId = UserModule.user.uid;

    await UserModule.user
      .updateProfile({
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
   * @param currentPassword The user's current password
   * @param newPassword The user's new password
   * @returns An ActionStatus object which indicates whether the action succeeded
   */
  public static async updatePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ActionStatus> {
    const actionStatus: ActionStatus = {
      isSuccessful: true
    };

    if (UserModule.user == null) {
      actionStatus.isSuccessful = false;
      actionStatus.message = "Please log in to continue.";
      return actionStatus;
    }

    const userId = UserModule.user.uid;

    const credential = firebase.auth.EmailAuthProvider.credential(
      UserModule.user.email as string,
      currentPassword
    );

    await UserModule.user
      .reauthenticateWithCredential(credential)
      .catch(error => {
        actionStatus.isSuccessful = false;
        actionStatus.message = error;
      });

    if (!actionStatus.isSuccessful) {
      return actionStatus;
    }

    await UserModule.user.updatePassword(newPassword).catch(error => {
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

    if (UserModule.user == null) {
      actionStatus.isSuccessful = false;
      actionStatus.message = "Please log in to continue.";
      return actionStatus;
    }

    await UserModule.user.sendEmailVerification().catch(error => {
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
   * Verify a password recovery code
   * @param code The password recovery code
   * @returns The user's email, if code is valid. Returns undefined otherwise
   */
  public static async verifyRecoveryCode(
    code: string
  ): Promise<string | undefined> {
    let userEmail: string | undefined = undefined;
    try {
      userEmail = await FirebaseModule.auth?.verifyPasswordResetCode(code);
    } catch (error) {
      console.error(error);
    }
    return userEmail;
  }

  /**
   * Confirm password reset of account
   * @param code The password recovery code
   * @param newPassword The new password
   * @returns An ActionStatus object which indicates whether the action succeeded
   */
  public static async confirmPasswordReset(
    code: string,
    newPassword: string
  ): Promise<ActionStatus> {
    const actionStatus: ActionStatus = {
      isSuccessful: true
    };

    await FirebaseModule.auth
      ?.confirmPasswordReset(code, newPassword)
      .catch(error => {
        actionStatus.isSuccessful = false;
        actionStatus.message = error;
      });

    return actionStatus;
  }

  /**
   * Verify user's email
   * @param code The verification code sent to user
   * @returns An ActionStatus object which indicates whether the action succeeded
   */
  public static async verifyUserEmail(code: string): Promise<ActionStatus> {
    const actionStatus: ActionStatus = {
      isSuccessful: true
    };
    try {
      await FirebaseModule.auth?.applyActionCode(code);
    } catch (error) {
      actionStatus.message = error;
      actionStatus.isSuccessful = false;
    }
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

    if (UserModule.user == null) {
      actionStatus.isSuccessful = false;
      actionStatus.message = "Please log in to continue.";
      return actionStatus;
    }

    await UserModule.user.delete().catch(error => {
      actionStatus.isSuccessful = false;
      actionStatus.message = error.message;
      FirebaseModule.analytics?.logEvent(LogTypes.error, {
        category: LogCategories.auth,
        user: UserModule.user?.uid,
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

  /**
   * Get the current user's firebase ID token
   * @returns a string ID token, or null if fails
   */
  public static async getIdToken(): Promise<string | null> {
    let idToken: string | null = null;

    await FirebaseModule.auth?.currentUser
      ?.getIdToken(true)
      .then(authToken => {
        idToken = authToken;
      })
      .catch(() => {
        idToken = null;
      });

    return idToken;
  }
}
