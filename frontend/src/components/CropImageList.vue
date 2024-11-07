<template>
  <v-row v-if="croppedImages.length">
    <v-col
      v-for="(imageSrc, index) in croppedImages"
      :key="index"
      cols="12"
      md="3"
      >
      <v-card style="height: 200px;" class="pa-2">
        <v-btn density="compact" @click="removeCrop(index)" icon="mdi-delete" style="left:calc(100% - 30px); z-index: 3;" color="error">
        </v-btn>
        <v-img :src="imageSrc" class="cropped-image">
        </v-img>
      </v-card>
      
    </v-col>
  </v-row>
</template>

<script>
  export default {
    emits: ['removeCrop'],
    props: {
      croppedImages: {
        type: Array
      }
    },
    methods: {
      removeCrop(index) {
        this.$emit('removeCrop', index)
      }
    }
  }
</script>
