<template>
  <div class="token-details-container">
    <div v-if="loading">
      <SkeletonLoader class="mb-10" height="40px" width="200px" />
      <br />
      <span class="d-inline-block mr-10">
        <SkeletonLoader class="mb-10" height="25px" width="50px" />
      </span>
      <span class="d-inline-block mr-10">
        <SkeletonLoader class="mb-10" height="25px" width="100px" />
      </span>
    </div>
    <div v-else class="top-controls">
      <div
        class="token-name-container d-inline-block"
        data-toggle="tooltip"
        data-title="Edit token name"
      >
        <h2 class="mt-0">
          <input
            type="text"
            spellcheck="false"
            contenteditable="true"
            ref="tokenNameInput"
            class="form-control form-control-lg"
            @blur="changeTokenName"
            v-on:keyup.enter="$refs.tokenNameInput.blur"
            v-on:keyup.esc="tokenName = token.name"
            :value="tokenName"
            :size="tokenName.length + 2"
            :maxlength="maxTokenNameSize"
            @input="evt => (tokenName = evt.target.value)"
          />
          <i @click="$refs.tokenNameInput.focus()" class="fa fa-edit" />
        </h2>
      </div>
      <div>
        <button
          @click="openEmbedModal"
          class="btn btn-sm float-left mr-10"
          role="button"
        >
          <i class="fa fa-code mr-5" aria-hidden="true" />
          Embed
        </button>
        <button
          @click="openOwnershipTransferModal"
          class="btn btn-sm float-left mr-10"
          role="button"
        >
          <i class="fa fa-user mr-5" aria-hidden="true" />
          Transfer ownership
        </button>
        <div class="dropdown float-right with-arrow" ref="deleteTokenDropdown">
          <button class="btn" data-toggle="dropdown" type="button">
            <i class="fa fa-trash" />
          </button>
          <div class="dropdown-menu dropdown-menu-right">
            <h6 class="dropdown-header text-center">
              This will delete the token permanently
            </h6>
            <div class="dropdown-content">
              <button
                class="btn btn-danger btn-sm btn-block mt-5"
                type="button"
                @click="deleteToken"
              >
                Confirm delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="analytics-container">
      <div class="w-lg-200 mw-full d-inline-block analytics-card">
        <div class="card">
          <span>
            Last 24 hours
          </span>
          <SkeletonLoader v-if="loading" height="35px" width="50px" />
          <div class="font-size-24" v-else>{{ viewsLastDay }}</div>
        </div>
      </div>
      <div class="w-lg-200 mw-full d-inline-block analytics-card">
        <div class="card">
          <span>
            Last 7 days
          </span>
          <SkeletonLoader v-if="loading" height="35px" width="50px" />
          <div class="font-size-24" v-else>{{ viewsLastWeek }}</div>
        </div>
      </div>
      <div class="w-lg-200 mw-full d-inline-block analytics-card">
        <div class="card">
          <span>
            All time total
          </span>
          <SkeletonLoader v-if="loading" height="35px" width="50px" />
          <div class="font-size-24" v-else>{{ viewsAllTime }}</div>
        </div>
      </div>
    </div>
    <div class="graph-container">
      <TokenGraph :token="token" />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from "vue-property-decorator";
import Token from "@/models/interfaces/Token";
import NumberHelper from "@/helpers/NumberHelper.ts";
import TokenHelper from "@/helpers/TokenHelper";
import TokenGraph from "@/components/token-graph/token-graph.vue";
import Halfmoon from "@/helpers/Halfmoon";
import TokenSpec from "@/models/data/TokenSpec";
import ModalID from "@/models/data/ModalID.ts";

@Component({ components: { TokenGraph } })
export default class TokenDetails extends Vue {
  @Prop({ required: true }) readonly token!: Token;

  loading = true;

  tokenName = "";

  /** Gets the total number of views for the last 24 hours */
  get viewsLastDay(): string {
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const timeLogsLastDay = TokenHelper.getTimeLogs(
      this.token,
      Date.now() - oneDayInMs,
      Date.now()
    );
    return NumberHelper.abbreviate(timeLogsLastDay.length);
  }

  /** Gets the total number of views for the last 7 days */
  get viewsLastWeek(): string {
    const oneWeekInMs = 24 * 60 * 60 * 1000 * 7;
    const timeLogsLastWeek = TokenHelper.getTimeLogs(
      this.token,
      Date.now() - oneWeekInMs,
      Date.now()
    );
    return NumberHelper.abbreviate(timeLogsLastWeek.length);
  }

  /** Gets the all time total number of views */
  get viewsAllTime(): string {
    const timeLogsAllTime = TokenHelper.getTimeLogs(
      this.token,
      -Infinity,
      Date.now()
    );
    return NumberHelper.abbreviate(timeLogsAllTime.length);
  }

  /** Maximum allowed length of token names */
  get maxTokenNameSize(): number {
    return TokenSpec.maxTokenNameSize;
  }

  /** Minimum allowed length of token names */
  get minTokenNameSize(): number {
    return TokenSpec.minTokenNameSize;
  }

  @Watch("token", { immediate: true, deep: true })
  ontokenChanged() {
    if (this.token != null) {
      document.title = `Dashboard - ${this.token.name}`;
      this.tokenName = this.token.name;
      this.loading = false;
    } else {
      this.loading = true;
    }
  }

  /** Change the token name in firestore. Updates token with this.tokenName  */
  async changeTokenName() {
    const tokenNameInput = this.$refs.tokenNameInput as HTMLImageElement;
    this.tokenName = this.tokenName.trim();

    if (
      this.tokenName.length === 0 ||
      this.token == null ||
      this.tokenName === this.token.name
    ) {
      this.tokenName = this.token?.name as string;
      return;
    }

    if (
      this.tokenName.length >= this.minTokenNameSize &&
      this.tokenName.length <= this.maxTokenNameSize
    ) {
      tokenNameInput.classList.remove("is-invalid");
      await TokenHelper.changeTokenName(this.token, this.tokenName);

      Halfmoon.toastSuccess({ content: "Token name changed successfully!" });
    } else {
      tokenNameInput.classList.add("is-invalid");
    }
  }

  /** Delete the current token */
  async deleteToken() {
    if (this.token != null) {
      // this closes the delete button's "confirm" dropdown
      (this.$refs.deleteTokenDropdown as HTMLButtonElement).classList.remove(
        "show"
      );

      this.loading = true;
      await TokenHelper.deleteToken(this.token);
      Halfmoon.toastSuccess({ content: "Token deleted successfully" });
      this.loading = false;
    }
  }

  /** Open the embed token modal */
  openEmbedModal() {
    Halfmoon.toggleModal(ModalID.embedToken);
  }

  /** Open ownership transfer modal */
  openOwnershipTransferModal() {
    Halfmoon.toggleModal(ModalID.ownershipTransfer);
  }
}
</script>

<style lang="scss" scoped>
.token-details-container {
  padding: 0px 6vw;
  display: flex;
  flex-direction: column;
  height: 100%;

  .analytics-container {
    .analytics-card > .card {
      margin-left: 0px;
      margin-right: 10px;
      margin-bottom: 0px;
      min-width: 100px;
    }
  }

  .graph-container {
    overflow: hidden;
    min-height: 350px;
    flex-grow: 1;
    box-sizing: border-box;
    padding-bottom: 30px;
  }
}

.top-controls {
  padding-top: 5px;

  .token-name-container {
    * {
      display: inline-block;
    }

    input {
      font-size: 3.4rem;
      height: 6rem;
      background: rgba(0, 0, 0, 0);
      border: 0px;
      margin-left: -10px;
      padding-left: 10px;
      transition: all 120ms ease;
      font-family: "Roboto Mono", monospace;

      &.is-invalid {
        box-shadow: 0 0 0 2px #ff4d50a2 !important;
      }
    }

    i {
      cursor: text;
      margin-top: -5px;
      margin-left: calc((2ch + 1.9rem - 5px) * (-1));
      font-size: 1.9rem;
      opacity: 0.3;
      vertical-align: middle;
      transition: opacity 120ms ease;
    }

    &:hover,
    &:focus-within {
      i {
        opacity: 1;
      }
      input {
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.3);
      }
    }
  }
}

@media (max-width: 768px) {
  .token-details-container {
    padding-bottom: 10px;

    .graph-container {
      padding-bottom: 40px;
    }
  }

  .analytics-container {
    .analytics-card {
      display: block !important;

      .card {
        margin-right: 0px !important;
      }
    }
    margin-bottom: 20px;
  }

  .top-controls {
    .token-name-container {
      input {
        font-size: 2.6rem;
      }
      i {
        font-size: 1.4rem;
        margin-top: 2px;
        margin-left: calc((2ch + 1.6rem - 5px) * (-1));
      }
    }
  }
}
</style>
