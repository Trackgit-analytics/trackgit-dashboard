<template>
  <section>
    Accounts
    <LoginForm v-if="formType === FormTypes.login" />
    <RegisterForm v-else-if="formType === FormTypes.register" />
  </section>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import LoginForm from "@/components/forms/login.vue";
import RegisterForm from "@/components/forms/register.vue";
import FormTypes from "@/models/data/FormTypes.ts";

@Component({ components: { LoginForm, RegisterForm } })
export default class Accounts extends Vue {
  @Prop({ default: FormTypes.login }) readonly formType!: string;
  @Prop({ default: "" }) readonly redirectUrl!: string;

  /** Get all the different form types available */
  get FormTypes() {
    return FormTypes;
  }
}
</script>

<style scoped></style>
