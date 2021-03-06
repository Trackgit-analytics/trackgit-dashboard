<template>
  <div
    class="modal"
    :id="createTokenModalId"
    tabindex="-1"
    role="dialog"
    :data-overlay-dismissal-disabled="loading"
    :data-esc-dismissal-disabled="loading"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <h5 class="modal-title text-muted font-weight-bold font-size-16">
          Create new token
        </h5>
        <form v-on:submit.prevent="createToken">
          <div class="form-group">
            <label for="token-name" class="required">Token name</label>
            <input
              type="text"
              id="token-name"
              :value="tokenName"
              v-on:input="tokenName = $event.target.value"
              class="form-control"
              placeholder="My awesome repository"
              required="required"
              :disabled="loading"
              :maxlength="maxTokenNameSize"
            />
          </div>
          <button
            class="btn btn-primary float-right"
            type="submit"
            :disabled="loading"
          >
            Create
            <Spinner v-if="loading" />
          </button>
          <input
            @click="toggleCreateTokenModal"
            class="btn float-right mr-10"
            type="button"
            value="Cancel"
            :disabled="loading"
          />
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import Halfmoon from "@/helpers/Halfmoon";
import TokenModule from "@/store/modules/TokenModule";
import TokenSpec from "@/models/data/TokenSpec";
import ModalID from "@/models/data/ModalID";
import TokenHelper from "@/helpers/TokenHelper";

@Component
export default class CreateToken extends Vue {
  tokenName = "";
  loading = false;

  /** Close the create token modal */
  toggleCreateTokenModal() {
    Halfmoon.toggleModal(ModalID.createToken);
  }

  /** Maximum allowed length of token names */
  get maxTokenNameSize(): number {
    return TokenSpec.maxTokenNameSize;
  }

  /** Get the ID for create token modal */
  get createTokenModalId(): string {
    return ModalID.createToken;
  }

  /** Triggers event in TokenModule to create a new token */
  async createToken() {
    this.loading = true;
    const newTokenId = await TokenModule.createToken(this.tokenName);
    const newToken = TokenModule.tokens?.find(token => token.id === newTokenId);
    TokenModule.updateActiveToken(newToken);
    TokenHelper.updateTokenRoute(newToken);
    this.loading = false;

    this.tokenName = "";

    // close modal once process is complete
    this.toggleCreateTokenModal();

    // open embed token modal
    Halfmoon.toggleModal(ModalID.embedToken);
  }
}
</script>

<style scoped></style>
