<template>
  <v-file-input
    label="Upload an Image"
    accept="image/*"
    @change="onImageUpload"
    outlined
  ></v-file-input>
</template>

<script>
export default {
  emits: ['image'],
  methods: {
    onImageUpload(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const image = new Image()
        image.src = e.target.result;
        this.$emit('image', image)
      };
      reader.readAsDataURL(file);
    },
  }
}
</script>
