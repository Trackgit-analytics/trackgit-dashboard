<template>
  <div
    class="modal"
    :id="forgotPasswordModalId"
    tabindex="-1"
    role="dialog"
    data-overlay-dismissal-disabled="true"
    data-esc-dismissal-disabled="true"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <h5 class="modal-title text-muted font-weight-bold font-size-16">
          Forgot password
        </h5>
        <form v-on:submit.prevent="sendPasswordRecoveryLink">
          <div class="form-group">
            <label for="login-email">Your email with trackgit</label>
            <input
              type="email"
              name="email"
              id="forgot-password-email"
              class="form-control"
              placeholder="Email"
              required="required"
              :disabled="loading"
              v-model="email"
            />
          </div>
          <button
            :class="`btn btn-primary btn-block ${loading ? 'disabled' : null}`"
            type="submit"
          >
            <span v-if="!recoverySent">Send password recovery link</span>
            <span v-else>Done! Please check your email</span>
            <Spinner v-if="loading" />
          </button>
        </form>
        <br />
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
import { Vue, Component } from "vue-property-decorator";
import ModalID from "@/models/data/ModalID";
import { Hyperlinks } from "@/models/data/LinkDirectory";
import UserHelper from "@/helpers/UserHelper";
import Halfmoon from "@/helpers/Halfmoon";

@Component
export default class ForgotPasswordForm extends Vue {
  loading = false;
  email = "";
  recoverySent = false;

  /** Gets the modal ID for forgot password modal */
  get forgotPasswordModalId(): string {
    return ModalID.forgotPassword;
  }

  /** Get hyperlink to login page */
  get loginLink(): string {
    return Hyperlinks.login;
  }

  /** Get hyperlink to register page */
  get registerLink(): string {
    return Hyperlinks.register;
  }

  mounted() {
    Halfmoon.toggleModal(ModalID.forgotPassword);
  }

  /** Sends out password recovery link to email */
  async sendPasswordRecoveryLink() {
    if (!this.recoverySent && !this.loading) {
      this.loading = true;
      await UserHelper.sendPasswordRecovery(this.email);
      this.loading = false;
      this.recoverySent = true;
      this.email = "";
    }
  }
}
</script>

<style scoped></style>
