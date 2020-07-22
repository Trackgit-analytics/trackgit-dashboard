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
        <form id="register-form">
          <div class="form-group">
            <label for="name">Name</label>
            <input
              type="text"
              id="name"
              class="form-control"
              placeholder="Full name"
              required="required"
            />
          </div>
          <div class="form-group">
            <label for="username">Email</label>
            <input
              type="text"
              id="username"
              class="form-control"
              placeholder="Email"
              required="required"
            />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              class="form-control"
              placeholder="Password"
              required="required"
            />
          </div>
          <input
            class="btn btn-primary btn-block"
            type="submit"
            value="Sign up for trackgit"
          />
        </form>
        <div class="text-muted font-size-12 mt-20">
          By clicking "Sign up for trackgit", you agree to our
          <a :href="termsLink">Terms of Service</a>.
        </div>
        <br />
        <div class="text-center text-muted font-size-14">
          Already have an account? <a :href="loginLink">Sign in</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { Hyperlinks } from "@/models/data/LinkDirectory.ts";

@Component
export default class RegisterForm extends Vue {
  /** Hyperlink to terms of service page */
  get termsLink() {
    return Hyperlinks.tos;
  }

  /** Hyperlink to login page */
  get loginLink() {
    return Hyperlinks.login;
  }
}
</script>

<style scoped></style>
