<template>
  <v-form v-if="!access_token" @submit.prevent="signIn">
    <v-text-field
      v-model="signinForm.username"
      label="Username"
      type="text"
      class="input-lowercase"
    />
    <v-text-field
      v-model="signinForm.password"
      label="Password"
      type="password"
    />
    <v-btn
      type="submit"
      class="mt-2"
    >
      Signin
    </v-btn>
  </v-form>
  <p v-if="access_token">Logged in as: {{access_token.split("_")[0]}}</p>
</template>
  
<script>
  import api from '../services/api'

  export default {
    emits: ['accessToken'],
    data() {
      return {
        signinForm: {
          username: "",
          password: "",
        },
        access_token: null
      }
    },
    methods: {
      signIn() {
        api
          .signIn(this.signinForm.username.toLowerCase().trim(), this.signinForm.password)
          .then((data) => {
            if (data['access_token']) {
              this.access_token = data['access_token']
              this.$emit('accessToken', this.access_token)
            } 
          })
      },
    }
  }
  </script>
  