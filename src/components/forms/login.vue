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
            <label for="email">Email</label>
            <input
              type="text"
              id="email"
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
            value="Sign in"
          />
        </form>
        <div class="text-right mt-10 font-size-12">
          <a :href="recoverPasswordLink">Forgot password?</a>
        </div>
        <br />
        <div class="text-center text-muted font-size-14">
          Don't have an account? <a href="#register">Sign up</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { Hyperlinks } from "@/models/data/LinkDirectory.ts";

@Component
export default class LoginForm extends Vue {
  /** Hyperlink to password recovery page */
  get recoverPasswordLink() {
    return Hyperlinks.recoverPassword;
  }
}
</script>

<style scoped></style>
