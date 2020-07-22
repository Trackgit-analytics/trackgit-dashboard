<template>
  <div
    class="modal"
    id="login"
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
        <form id="login-form">
          <div class="form-group">
            <label for="login-email">Email</label>
            <input
              type="email"
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
              id="login-password"
              class="form-control"
              placeholder="Password"
              required="required"
              :disabled="loading"
              v-model="password"
            />
          </div>
          <div
            :class="`btn btn-primary btn-block ${loading ? 'disabled' : null}`"
            type="submit"
            @click="login"
          >
            Sign in <Spinner v-if="loading" />
          </div>
        </form>
        <div class="text-right mt-10 font-size-12">
          <a :href="!loading ? recoverPasswordLink : null">Forgot password?</a>
        </div>
        <div class="font-size-12 text-danger">
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
import Spinner from "@/components/misc/spinner.vue";
import UserHelper from "@/helpers/UserHelper";

@Component({ components: { Spinner } })
export default class LoginForm extends Vue {
  loading = false;
  redirectUrl = "/";

  email = "";
  password = "";
  errorMessage = "";

  /** Hyperlink to password recovery page */
  get recoverPasswordLink() {
    return Hyperlinks.recoverPassword;
  }

  /** Hyperlink to register page */
  get registerLink() {
    return Hyperlinks.register;
  }

  async login() {
    if (this.loading) {
      return;
    }

    const form = document.getElementById("login-form") as HTMLFormElement;
    if (!form.reportValidity()) {
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
