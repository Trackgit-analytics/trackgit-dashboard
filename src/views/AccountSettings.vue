<template>
  <div class="account-settings">
    <h2>Account settings</h2>
    <form v-on:submit.prevent="changeUserName">
      <div class="form-group">
        <label for="user-email">Email</label>
        <input
          type="email"
          name="current-email"
          id="user-email"
          class="form-control"
          placeholder="Email"
          required="required"
          :value="userEmail"
          disabled
        />
        <span class="mt-10 d-block" v-if="showEmailVerification">
          <span v-if="isEmailVerified">
            <i class="fa fa-check-circle text-success" />
            Email verified
          </span>
          <span v-else>
            <i class="fa fa-exclamation-triangle text-secondary" />
            &nbsp;<a @click="sendVerificationEmail">Verify email</a>
          </span>
        </span>
      </div>
      <div class="form-group">
        <label for="user-email">Name</label>
        <input
          type="text"
          name="name"
          id="user-name"
          class="form-control"
          placeholder="Full name"
          required="required"
          v-model="userName"
          :disabled="loadingNameChange"
        />
      </div>
      <div class="form-group">
        <button
          class="btn btn-primary"
          type="submit"
          :disabled="loadingNameChange"
        >
          Save
          <Spinner v-if="loadingNameChange" />
        </button>
      </div>
    </form>

    <br />

    <form v-on:submit.prevent="changeUserPassword">
      <h5>Change account password</h5>
      <div class="form-group">
        <label for="current-password">Current password</label>
        <input
          autocomplete="off"
          type="password"
          name="current-password"
          id="current-password"
          class="form-control"
          placeholder="Current password"
          v-model="currentPassword"
          required="required"
          :disabled="loadingPasswordChange"
        />
      </div>
      <div class="form-group">
        <label for="new-password">New password</label>
        <input
          autocomplete="new-password"
          type="password"
          name="new-password"
          id="new-password"
          class="form-control"
          placeholder="New password"
          required="required"
          v-model="newPassword"
          :disabled="loadingPasswordChange"
        />
      </div>
      <div class="form-group">
        <button
          class="btn btn-primary"
          type="submit"
          :disabled="loadingPasswordChange"
        >
          Change password
          <Spinner v-if="loadingPasswordChange" />
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import TokenModule from "@/store/modules/TokenModule";
import UserModule from "@/store/modules/UserModule";
import UserHelper from "@/helpers/UserHelper";
import Halfmoon from "@/helpers/Halfmoon";
import ActionStatus from "@/models/interfaces/ActionStatus";

@Component
export default class AccountSettings extends Vue {
  showEmailVerification = true;
  // indicates whether a send email verification is already in progress
  sendingEmailVerification = false;

  // indicates whether a username change is in progress
  loadingNameChange = false;

  // indicates whether a password change is in progress
  loadingPasswordChange = false;

  // new username for the user
  userName = "";

  currentPassword = "";

  newPassword = "";

  /** Get the current user's email */
  get userEmail(): string {
    if (UserModule.user) {
      return UserModule.user.email as string;
    }
    return "";
  }

  /** Gets whether the user's email is verified */
  get isEmailVerified(): boolean {
    if (UserModule.user) {
      return UserModule.user.emailVerified;
    }
    return false;
  }

  /** Get the currently saved user name */
  get currentUserName(): string {
    if (UserModule.user) {
      return UserModule.user.displayName as string;
    }
    return "";
  }

  @Watch("currentUserName")
  onCurrentNameUpdated() {
    this.userName = this.currentUserName;
  }

  mounted() {
    this.userName = this.currentUserName;

    TokenModule.updateActiveToken(undefined);
  }

  /** Send email verification message to user */
  async sendVerificationEmail() {
    if (this.sendingEmailVerification) {
      return;
    }

    this.sendingEmailVerification = true;
    const actionStatus = await UserHelper.sendEmailVerification();
    if (actionStatus.isSuccessful) {
      this.showEmailVerification = false;
      Halfmoon.toastSuccess({
        content:
          "We've just sent you instructions to verify your email address. Please check your email inbox.",
        timeShown: 5000
      });
    } else {
      Halfmoon.toastError({
        content: `We couldn't send you a verification email. Please try again.\n${actionStatus.message}`,
        timeShown: 5000
      });
    }
    this.sendingEmailVerification = false;
  }

  /** Update the current user's username */
  async changeUserName() {
    if (
      this.loadingNameChange ||
      this.userName == null ||
      this.userName.trim().length === 0 ||
      this.userName === this.currentUserName
    ) {
      return;
    }

    this.loadingNameChange = true;
    const actionStatus = await UserHelper.updateName(this.userName);
    if (actionStatus.isSuccessful) {
      Halfmoon.toastSuccess({ content: "Successfully changed your username!" });
    } else {
      Halfmoon.toastError({
        content: `There was an error when changing your username.\n${actionStatus.message}`
      });
    }

    this.loadingNameChange = false;
  }

  /** Update the current user's password */
  async changeUserPassword() {
    if (
      this.loadingPasswordChange ||
      this.currentPassword.trim().length === 0 ||
      this.newPassword.trim().length === 0
    ) {
      return;
    }

    this.loadingPasswordChange = true;

    let actionStatus: ActionStatus = {
      isSuccessful: true
    };

    if (this.currentPassword !== this.newPassword) {
      actionStatus = await UserHelper.updatePassword(
        this.currentPassword,
        this.newPassword
      );
    }

    if (actionStatus.isSuccessful) {
      Halfmoon.toastSuccess({ content: "Password updated successfully!" });
      this.currentPassword = "";
      this.newPassword = "";
    } else {
      Halfmoon.toastError({
        content: `There was an error when updating your password.\n${actionStatus.message}`,
        timeShown: 5000
      });
    }
    this.loadingPasswordChange = false;
  }
}
</script>

<style lang="scss" scoped>
.account-settings {
  padding: 0px 6vw;
}

form {
  max-width: 300px;
}
</style>
