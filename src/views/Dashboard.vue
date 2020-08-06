<template>
  <div id="dashboard">
    <TokenDetails :token.sync="activeToken" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import TokenModule from "@/store/modules/TokenModule.ts";
import TokenDetails from "@/components/token-details/token-details.vue";
import Token from "@/models/interfaces/Token";
import SidebarModule from "@/store/modules/SidebarModule";
import CookieNames from "@/models/data/CookieNames";
import TokenHelper from "@/helpers/TokenHelper";

@Component({
  components: {
    TokenDetails
  }
})
export default class Dashboard extends Vue {
  @Prop({ default: "" }) readonly activeTokenId!: string;

  /** Gets the currently selected token from TokenModule */
  get activeToken(): Token | null {
    return TokenModule.activeToken;
  }

  /** Gets the list of all tokens in TokenModule */
  get tokenList(): Token[] | null {
    return TokenModule.tokens;
  }

  /** Get the active token from param/cookie and activate the token in module */
  @Watch("tokenList")
  setActiveToken(tokenList: Token[] | null, oldTokenList: Token[] | null) {
    if (
      tokenList == null ||
      (oldTokenList != null && TokenModule.activeToken != null)
    ) {
      return;
    }

    // check token in url param
    let newActiveToken: Token | undefined = undefined;
    if (this.activeTokenId.length > 0) {
      const token = tokenList.find(token => token.id === this.activeTokenId);
      if (token != null) {
        newActiveToken = token;
      } else {
        newActiveToken = tokenList[0];
      }
      SidebarModule.updateSidebarVisibility(false);
    }
    // check for active token cookie
    else if (Vue.$cookies.isKey(CookieNames.activeTokenId)) {
      const token = tokenList.find(
        token => token.id === Vue.$cookies.get(CookieNames.activeTokenId)
      );
      if (token) {
        newActiveToken = token;
        SidebarModule.updateSidebarVisibility(false);
      }
    }
    if (newActiveToken != null) {
      TokenModule.updateActiveToken(newActiveToken);
      TokenHelper.updateTokenRoute(newActiveToken);
    }
  }

  /** Verifies whether the active token exists in the tokenList */
  @Watch("tokenList")
  verifyActiveToken() {
    if (this.activeToken != null && this.tokenList != null) {
      const tokenExists = this.tokenList
        .map(token => token.id)
        .includes(this.activeToken.id);

      if (!tokenExists) {
        const newActiveToken = this.tokenList[0];
        TokenModule.updateActiveToken(newActiveToken);
      } else {
        TokenModule.updateTokenData(
          this.tokenList.find(token => token.id === this.activeToken?.id)
        );
      }
    }
  }
}
</script>

<style></style>
