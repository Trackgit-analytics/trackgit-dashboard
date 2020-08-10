<template>
  <div
    class="modal"
    :id="loginModalId"
    tabindex="-1"
    role="dialog"
    data-overlay-dismissal-disabled="true"
    data-esc-dismissal-disabled="true"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <h5 class="modal-title text-muted font-weight-bold font-size-16">
          Sign into your account
        </h5>
        <div class="text-center">
          <GithubSignin>
            Sign in with GitHub
          </GithubSignin>
          <br />
        </div>
        <form v-on:submit.prevent="login">
          <div class="form-group">
            <label for="login-email">Email</label>
            <input
              type="email"
              name="email"
              id="login-email"
              class="form-control"
              placeholder="Email"
              required="required"
              :disabled="loading"
              v-model="email"
            />
          </div>
          <div class="form-group">
            <label for="login-password">Password</label>
            <input
              type="password"
              name="current-password"
              id="login-password"
              class="form-control"
              placeholder="Password"
              required="required"
              :disabled="loading"
              v-model="password"
            />
          </div>
          <button
            :class="`btn btn-primary btn-block ${loading ? 'disabled' : null}`"
            type="submit"
          >
            Sign in <Spinner v-if="loading" />
          </button>
        </form>
        <div class="text-right mt-10 font-size-12">
          <a :href="!loading ? forgotPasswordLink : null">Forgot password?</a>
        </div>
        <div class="font-size-14 text-danger">
          {{ errorMessage }}
        </div>
        <br />
        <div class="text-center text-muted font-size-14">
          Don't have an account?
          <a :href="!loading ? registerLink : null">Sign up</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { Hyperlinks } from "@/models/data/LinkDirectory.ts";
import UserHelper from "@/helpers/UserHelper";
import ModalID from "@/models/data/ModalID";
import Halfmoon from "@/helpers/Halfmoon";
import GithubSignin from "@/components/forms/github-signin.vue";

@Component({ components: { GithubSignin } })
export default class LoginForm extends Vue {
  loading = false;
  redirectUrl = "/";

  email = "";
  password = "";
  errorMessage = "";

  /** Hyperlink to password recovery page */
  get forgotPasswordLink() {
    return Hyperlinks.forgotPassword;
  }

  /** Hyperlink to register page */
  get registerLink() {
    return Hyperlinks.register;
  }

  /** Get the login modal ID */
  get loginModalId(): string {
    return ModalID.login;
  }

  mounted() {
    Halfmoon.toggleModal(ModalID.login);
  }

  /** Attempt user login with email/password */
  async login() {
    if (this.loading) {
      return;
    }

    this.loading = true;
    const loginStatus = await UserHelper.signIn(this.email, this.password);
    if (!loginStatus.isSuccessful) {
      this.errorMessage = "\nLogin attempt failed. Please try again.";
    } else {
      if (this.$router.currentRoute.path !== this.redirectUrl) {
        this.$router.replace({ path: this.redirectUrl });
      }
    }
    this.loading = false;
  }
}
</script>

<style scoped></style>
