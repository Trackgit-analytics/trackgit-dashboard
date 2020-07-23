<template>
  <div
    class="modal"
    id="register"
    tabindex="-1"
    role="dialog"
    data-overlay-dismissal-disabled="true"
    data-esc-dismissal-disabled="true"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <h5 class="modal-title text-muted font-weight-bold font-size-16">
          Create a new account
        </h5>
        <form v-on:submit.prevent="register">
          <div class="form-group">
            <label for="register-name">Name</label>
            <input
              type="text"
              id="register-name"
              class="form-control"
              placeholder="Full name"
              required="required"
              :disabled="loading"
              v-model="name"
            />
          </div>
          <div class="form-group">
            <label for="register-email">Email</label>
            <input
              type="email"
              id="register-email"
              class="form-control"
              placeholder="Email"
              required="required"
              :disabled="loading"
              v-model="email"
            />
          </div>
          <div class="form-group">
            <label for="register-password">Password</label>
            <input
              type="password"
              id="register-password"
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
            Sign up for trackgit <Spinner v-if="loading" />
          </button>
        </form>
        <div class="text-muted font-size-12 mt-20">
          By clicking "Sign up for trackgit", you agree to our
          <a :href="termsLink">Terms of Service</a>.
        </div>
        <div class="font-size-12 text-danger">
          {{ errorMessage }}
        </div>
        <br />
        <div class="text-center text-muted font-size-14">
          Already have an account?
          <a :href="!loading ? loginLink : null">Sign in</a>
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
export default class RegisterForm extends Vue {
  loading = false;
  redirectUrl = "/";

  name = "";
  email = "";
  password = "";
  errorMessage = "";

  /** Hyperlink to terms of service page */
  get termsLink() {
    return Hyperlinks.tos;
  }

  /** Hyperlink to login page */
  get loginLink() {
    return Hyperlinks.login;
  }

  async register() {
    if (this.loading) {
      return;
    }

    this.loading = true;
    const loginStatus = await UserHelper.signUp(
      this.name,
      this.email,
      this.password
    );
    if (!loginStatus.isSuccessful) {
      this.errorMessage =
        "\nYour account couldn't be created. Please try again.";
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
