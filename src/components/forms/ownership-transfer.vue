<template>
  <div
    class="modal"
    :id="ownershipTrasnferModalId"
    tabindex="-1"
    role="dialog"
    :data-overlay-dismissal-disabled="loading"
    :data-esc-dismissal-disabled="loading"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <h5 class="modal-title text-muted font-weight-bold font-size-16">
          Transfer ownership
          <button
            :disabled="loading"
            class="btn btn-sm float-right"
            @click="closeOwnershipTokenModal"
          >
            <i class="fa fa-times" />
          </button>
        </h5>
        <form v-on:submit.prevent="startOwnershipTransfer">
          <div class="form-group">
            <label for="new-owner-email">New owner's email address</label>
            <input
              autocomplete="off"
              type="email"
              name="email"
              id="new-owner-email"
              class="form-control"
              placeholder="Email"
              required="required"
              :disabled="loading"
              v-model="newOwnerEmail"
            />
          </div>
          <div class="form-group">
            <label for="token-name">
              Re-type token name (<b>{{ token ? token.name : "" }}</b
              >)
            </label>
            <input
              type="text"
              id="token-name"
              class="form-control"
              :placeholder="token.name"
              required="required"
              :disabled="loading"
              v-model="retypedTokenName"
              ref="tokenName"
            />
          </div>
          <div class="alert mb-20 alert-secondary" role="alert">
            <h4 class="alert-heading">Warning</h4>
            This will transfer the ownership of
            <b>{{ token ? token.name : "" }}</b> token to the user you specify.
            You will no longer be able to see or control this token once the
            transfer is complete.
          </div>
          <button class="btn btn-block btn-primary mt-10" :disabled="loading">
            Confirm transfer
            <Spinner v-if="loading" />
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import ModalID from "@/models/data/ModalID";
import Token from "@/models/interfaces/Token";
import Halfmoon from "@/helpers/Halfmoon";
import TokenHelper from "@/helpers/TokenHelper";

@Component
export default class OwnershipTransfer extends Vue {
  @Prop({ required: true }) readonly token!: Token;

  loading = false;

  retypedTokenName = "";

  newOwnerEmail = "";

  /** Get ID for ownership transfer modal */
  get ownershipTrasnferModalId(): string {
    return ModalID.ownershipTransfer;
  }

  /** Close ownership transfer modal */
  closeOwnershipTokenModal() {
    Halfmoon.toggleModal(ModalID.ownershipTransfer);
  }

  @Watch("token")
  onTokenChanged() {
    this.newOwnerEmail = "";
    this.retypedTokenName = "";
  }

  /** Initiate the process to transfer token ownership */
  async startOwnershipTransfer() {
    if (this.loading) {
      return;
    }

    this.loading = true;

    if (this.retypedTokenName !== this.token.name) {
      (this.$refs.tokenName as HTMLInputElement).classList.add("is-invalid");
      (this.$refs.tokenName as HTMLInputElement).focus();
      this.loading = false;
      return;
    } else {
      (this.$refs.tokenName as HTMLInputElement).classList.remove("is-invalid");
    }

    const actionStatus = await TokenHelper.transferOwnership(
      this.token.id,
      this.newOwnerEmail
    );

    if (actionStatus.isSuccessful) {
      Halfmoon.toastSuccess({
        content:
          actionStatus.message || "The token was transferred successfully"
      });

      this.closeOwnershipTokenModal();
    } else {
      Halfmoon.toastError({
        content: actionStatus.message || "The transfer could not be completed."
      });
    }

    this.loading = false;
  }
}
</script>

<style scoped></style>
