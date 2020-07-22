<template>
  <div class="dropdown">
    <div class="dropdown with-arrow">
      <button
        class="btn user-image"
        data-toggle="dropdown"
        type="button"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <img :src="userProfilePhoto" alt="avatar" />
      </button>
      <div class="dropdown-menu dropdown-menu-right">
        <h6 class="dropdown-header ">
          {{ userName }}
          <span class="font-size-14 font-weight-normal">{{ userEmail }}</span>
        </h6>
        <a :href="accountSettingsLink" class="dropdown-item"
          >Account settings</a
        >
        <div class="dropdown-divider"></div>
        <div class="dropdown-content">
          <button
            :class="`btn btn-block ${loading ? 'disabled' : null}`"
            @click="signOut"
            type="button"
          >
            Sign out <Spinner v-if="loading" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import UserModule from "@/store/modules/UserModule";
import { Hyperlinks } from "@/models/data/LinkDirectory";
import UserHelper from "@/helpers/UserHelper";
import Halfmoon, {
  HalfmoonAlertType,
  HalfmoonFillType
} from "@/helpers/Halfmoon";
import Spinner from "@/components/misc/spinner.vue";

@Component({ components: { Spinner } })
export default class UserInfoNavbar extends Vue {
  loading = false;
  defaultAvatar = "https://avatars.dicebear.com/api/jdenticon/.svg?r=50&m=17";

  /** Returns the user's profile photo url */
  get userProfilePhoto(): string {
    if (!UserModule.user || !UserModule.user.photoURL) {
      return this.defaultAvatar;
    }
    return UserModule.user.photoURL;
  }

  /** Returns the user's full name */
  get userName(): string {
    if (!UserModule.user || !UserModule.user.displayName) {
      return "";
    }
    return UserModule.user.displayName;
  }

  /** Returns the user's email */
  get userEmail(): string {
    if (!UserModule.user || !UserModule.user.email) {
      return "";
    }
    return UserModule.user.email;
  }

  /** Returns the hyperlink to account settings page */
  get accountSettingsLink(): string {
    return Hyperlinks.accountSettings;
  }

  /** Sign out the currently logged in user */
  async signOut() {
    if (this.loading) {
      return;
    }

    this.loading = true;
    const actionStatus = await UserHelper.signOut();
    if (actionStatus.isSuccessful) {
      // refresh the page if the user is signed out successfully
      this.$router.go(0);
    } else {
      Halfmoon.toast({
        content: "Couldn't sign you out. Please try again.",
        alertType: HalfmoonAlertType.danger,
        fillType: HalfmoonFillType.filled
      });
    }
    this.loading = false;
  }
}
</script>

<style lang="scss" scoped>
.user-image {
  border-radius: 100%;
  width: 40px;
  height: 40px;
  position: relative;
  padding: 0px;
  background: white !important;
  margin: 5px 0px 0px 10px;

  img {
    width: 100%;
    height: 100%;
  }
}
</style>
