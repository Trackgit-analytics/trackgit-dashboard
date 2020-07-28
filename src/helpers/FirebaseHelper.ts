import Halfmoon from "./Halfmoon";
import firebase from "firebase";

export default class FirebaseHelper {
  /**
   * Set firestore cache to enable offline mode
   * @param firebaseDb The firestore db to enable cache on
   * @returns True if the operation was successful, false otherwise.
   * Displays a Toast error on UI if the operation fails.
   */
  public static async setFirestoreCache(
    firebaseDb: firebase.firestore.Firestore
  ): Promise<boolean> {
    firebaseDb.settings({
      cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
    });

    try {
      await firebaseDb.enablePersistence();
      return true;
    } catch (err) {
      let errorContent = "";
      if (err.code == "failed-precondition") {
        errorContent =
          "Multiple instances detected. Please use only a single tab to access this application.";
      } else if (err.code == "unimplemented") {
        errorContent = "This browser is not supported by the application.";
      }
      Halfmoon.showCriticalError(errorContent);
      return false;
    }
  }
}
