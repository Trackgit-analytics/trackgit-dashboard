<template>
  <div
    class="modal"
    :id="resetPasswordModalId"
    tabindex="-1"
    role="dialog"
    data-overlay-dismissal-disabled="true"
    data-esc-dismissal-disabled="true"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <h5 class="modal-title text-muted font-weight-bold font-size-16">
          Reset password
        </h5>
        <form v-on:submit.prevent="resetPassword">
          <div class="form-group">
            <label for="login-email">Email</label>
            <input
              type="email"
              name="email"
              id="login-email"
              class="form-control"
              placeholder="Email"
              required="required"
              :disabled="true"
              v-model="userEmail"
            />
          </div>
          <div class="form-group">
            <label for="login-email">New password</label>
            <input
              type="password"
              name="new-password"
              id="reset-new-password"
              class="form-control"
              placeholder="Strong password"
              required="required"
              :disabled="loading"
              v-model="newPassword"
            />
          </div>
          <button
            :class="`btn btn-primary btn-block ${loading ? 'disabled' : null}`"
            :disabled="recoveryCode.length === 0"
            type="submit"
          >
            <span v-if="!passwordResetSuccessful">Reset password</span>
            <span v-else>Done! Redirecting to sign in</span>
            <Spinner v-if="loading" />
          </button>
        </form>
        <br />
        <div
          class="font-size-14 text-danger mb-10"
          v-if="errorMessage.length > 0"
        >
          {{ errorMessage }}
          <br />
          <a :href="forgotPasswordLink">
            Send password recovery link again
          </a>
        </div>
        <div class="text-center text-muted font-size-14">
          <a :href="!loading ? loginLink : null">Sign in</a
          >&nbsp;&nbsp;.&nbsp;&nbsp;
          <a :href="!loading ? registerLink : null">Register</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import ModalID from "@/models/data/ModalID";
import UserHelper from "@/helpers/UserHelper";
import { Hyperlinks } from "@/models/data/LinkDirectory";
import UserModule from "@/store/modules/UserModule";
import EmailMode from "@/models/data/EmailMode.ts";
import BodyMetaHelper from "@/helpers/BodyMetaHelper.ts";
import PageMeta from "@/models/data/PageMeta";

@Component
export default class ResetPasswordForm extends Vue {
  loading = true;

  userEmail = "";
  recoveryCode = "";
  newPassword = "";

  errorMessage = "";

  passwordResetSuccessful = false;

  /** Gets the current auth status of the user */
  get isUserAuthenticated() {
    return UserModule.isUserAuthenticated;
  }

  /** Get the reset password modal's ID */
  get resetPasswordModalId(): string {
    return ModalID.resetPassword;
  }

  /** Get hyperlink to login page */
  get loginLink(): string {
    return Hyperlinks.login;
  }

  /** Get hyperlink to register page */
  get registerLink(): string {
    return Hyperlinks.register;
  }

  /** Hyperlink to password recovery page */
  get forgotPasswordLink() {
    return Hyperlinks.forgotPassword;
  }

  /** Verify recovery code and initialize component with data */
  @Watch("isUserAuthenticated")
  async verifyUrlCode() {
    const mode = this.$route.query.mode;
    if (mode !== EmailMode.resetPassword) {
      return;
    }

    BodyMetaHelper.setDocumentTitle(PageMeta.ResetPassword.title);
    BodyMetaHelper.addMetaInfo(PageMeta.ResetPassword.metaTags);

    this.loading = true;

    let isCodeValid = false;
    const urlCode = this.$route.query.oobCode;
    if (typeof urlCode === "string") {
      const userEmail = await UserHelper.verifyRecoveryCode(urlCode);
      if (userEmail != null) {
        this.userEmail = userEmail;
        isCodeValid = true;
        this.recoveryCode = urlCode;
      }
    }

    if (!isCodeValid) {
      this.errorMessage = "The reset code has expired or is invalid. ";
    }

    this.loading = false;
  }

  /** Assign new password to user and redirect to login */
  async resetPassword() {
    if (!this.loading && this.recoveryCode.length > 0) {
      this.loading = true;

      const actionStatus = await UserHelper.confirmPasswordReset(
        this.recoveryCode,
        this.newPassword
      );
      this.passwordResetSuccessful = actionStatus.isSuccessful;

      if (actionStatus.isSuccessful) {
        this.$router.replace({ path: Hyperlinks.login });
        this.$router.go(0);
      } else {
        this.errorMessage = actionStatus.message as string;
      }
      this.loading = false;
    }
  }
}
</script>

<style scoped></style>
