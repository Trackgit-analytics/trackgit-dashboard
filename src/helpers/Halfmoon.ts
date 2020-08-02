// halfmoon doesn't support TS yet
// eslint-disable-next-line @typescript-eslint/no-var-requires
const halfmoon = require("halfmoon");

import Vue from "vue";
import HalmoonModule from "@/store/modules/HalmoonModule";

interface HalfmoonToastConfig {
  /** Required, main content of the alert, type: string (can contain HTML) */
  content: string;
  /** Optional, title of the alert, default: "", type: string */
  title?: string;
  /** Optional, type of the alert, default: "", must be "alert-primary" || "alert-success" || "alert-secondary" || "alert-danger" */
  alertType?: HalfmoonAlertType;
  /** Optional, fill type of the alert, default: "", must be "filled-lm" || "filled-dm" || "filled" */
  fillType?: HalfmoonFillType;
  /** Optional, the alert will contain the close button if true, default: true, type: boolean */
  hasDismissButton?: boolean;
  /** Optional, time the alert stays on the screen (in ms), default: 5000, type: number */
  timeShown?: number;
}

export enum HalfmoonAlertType {
  default = "",
  primary = "alert-primary",
  success = "alert-success",
  secondary = "alert-secondary",
  danger = "alert-danger"
}

export enum HalfmoonFillType {
  default = "",
  filled = "filled",
  filledLm = "filled-lm",
  filledDm = "filled-dm"
}

export default class Halfmoon {
  private static defaults = {
    /** Default time for halfmoon toast alerts in milliseconds */
    toastTime: 1500
  };

  /** Initialize halfmoon ui */
  public static init() {
    halfmoon.onDOMContentLoaded();
    HalmoonModule.updateDarkMode(this.isDarkModeOn());
  }

  /**
   * Toggle a modal
   * @param modalId The ID of the modal to toggle
   */
  public static toggleModal(modalId: string) {
    halfmoon.toggleModal(modalId);
  }

  /** Toggle dark mode for the application */
  public static toggleDarkMode() {
    halfmoon.toggleDarkMode();
  }

  /**
   * Display a toast message
   * @param toastConfig The toast configuration
   */
  public static toast(toastConfig: HalfmoonToastConfig) {
    if (halfmoon.stickyAlerts == null) {
      halfmoon.stickyAlerts = document.getElementsByClassName(
        "sticky-alerts"
      )[0];
    }
    if (toastConfig.timeShown == null) {
      toastConfig.timeShown = this.defaults.toastTime;
    }
    halfmoon.initStickyAlert(toastConfig);
  }

  /** Show an error toast */
  public static toastError(toastConfig: HalfmoonToastConfig) {
    toastConfig.alertType = HalfmoonAlertType.danger;
    this.toast(toastConfig);
  }

  /** Show a success toast */
  public static toastSuccess(toastConfig: HalfmoonToastConfig) {
    toastConfig.alertType = HalfmoonAlertType.success;
    this.toast(toastConfig);
  }

  /**
   * Display a critical error.
   * This will block the UI and prevent any further action from the user.
   * @param errorMessage The error message to show
   */
  public static showCriticalError(errorMessage: string) {
    const errorModal = `<div
    class="modal"
    id="criticalError"
    tabindex="-1"
    role="dialog"
    data-overlay-dismissal-disabled="true"
    data-esc-dismissal-disabled="true"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content text-center font-size-18">${errorMessage}</div>
    </div>
  </div>`;
    const htmlObject = document.createElement("div");
    htmlObject.innerHTML = errorModal;

    document.body.appendChild(htmlObject);
    this.toggleModal("criticalError");
  }

  /** Returns true if dark mode is on, false otherwise */
  public static isDarkModeOn(): boolean {
    const cookie = Vue.$cookies.get("darkModeOn");
    if (!cookie) {
      return false;
    }
    return cookie === "no" ? false : true;
  }
}
