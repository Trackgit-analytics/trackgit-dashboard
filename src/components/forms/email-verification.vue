<template>
  <div class="modal" :id="verifyEmailModalId" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content text-center">
        <button @click="closeEmailVerificationModal" class="close">
          <span aria-hidden="true">&times;</span>
        </button>
        <span class="mt-10 mr-10 font-size-24">
          <Spinner v-if="loading" />
          <i v-else-if="isVerified" class="fa fa-check-circle text-success" />
          <i v-else class="fa fa-times-circle text-danger" />
        </span>
        <span class="font-size-20">
          {{ emailVerficationMessage }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import ModalID from "@/models/data/ModalID";
import Halfmoon from "@/helpers/Halfmoon";
import UserHelper from "@/helpers/UserHelper";
import UserModule from "@/store/modules/UserModule";
import EmailMode from "@/models/data/EmailMode";

@Component
export default class EmailVerificaitonForm extends Vue {
  emailVerficationMessage = "";
  loading = true;
  isVerified = false;

  /**  Gets the ID for email verification modal */
  get verifyEmailModalId(): string {
    return ModalID.verifyEmail;
  }

  /** Gets the current auth status of the user */
  get isUserAuthenticated() {
    return UserModule.isUserAuthenticated;
  }

  /** Verify user's email with code from url */
  @Watch("isUserAuthenticated")
  async verifyEmail() {
    const mode = this.$route.query.mode;
    if (mode !== EmailMode.verifyEmail || UserModule.user?.emailVerified) {
      return;
    }

    this.loading = true;

    this.emailVerficationMessage = "Verifying your email";

    const urlCode = this.$route.query.oobCode;
    if (typeof urlCode === "string") {
      const verificationStatus = await UserHelper.verifyUserEmail(urlCode);
      this.isVerified = verificationStatus.isSuccessful;
      if (this.isVerified) {
        this.emailVerficationMessage = "Your email has been verified!";
      } else {
        this.emailVerficationMessage = "Couldn't verify your email";
      }
    } else {
      this.emailVerficationMessage = "Couldn't find a verification code";
      this.isVerified = false;
    }

    this.loading = false;
  }

  /** Check for when email is verified and close the modal */
  @Watch("isVerified")
  closeModalOnVerified() {
    if (this.isVerified) {
      setTimeout(this.closeEmailVerificationModal, 1000);
    }
  }

  /** Closes the email verification modal */
  closeEmailVerificationModal() {
    Halfmoon.toggleModal(this.verifyEmailModalId);

    this.$router.push({ path: "/" });
    this.$router.go(0);
  }
}
</script>

<style scoped></style>
