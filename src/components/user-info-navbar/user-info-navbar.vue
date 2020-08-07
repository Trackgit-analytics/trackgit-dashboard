<template>
  <div class="dropdown">
    <div class="dropdown with-arrow">
      <SkeletonLoader
        class="loading-avatar-margins"
        :circle="true"
        v-if="!isUserAuthenticated"
        width="40px"
        height="40px"
      />
      <button
        v-else
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
          <SkeletonLoader v-if="!isUserAuthenticated" width="100px" />
          <span class="d-block" v-else>{{ user.displayName }}</span>

          <SkeletonLoader v-if="!isUserAuthenticated" width="130px" />
          <span v-else class="font-size-14 font-weight-normal">{{
            user.email
          }}</span>
        </h6>
        <a :href="accountSettingsLink" class="dropdown-item">
          Account settings
        </a>
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

  /** Checks whether the user is logged in */
  get isUserAuthenticated(): boolean {
    return UserModule.isUserAuthenticated ? true : false;
  }

  /** Returns the current user */
  get user(): firebase.User | null {
    return UserModule.user;
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
      this.$router.replace({ path: Hyperlinks.login });
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

.loading-avatar-margins {
  margin: 0px 0px 0px 10px;
}
</style>
