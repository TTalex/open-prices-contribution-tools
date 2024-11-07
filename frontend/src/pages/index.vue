<template>
  <v-container>

    <v-tabs
      v-model="tab"
      align-tabs="center"
    >
      <v-tab value="Signin">1. Sign In</v-tab>
      <v-tab value="LocationDate" :disabled="!accessToken">2. Location & Date</v-tab>
      <v-tab value="Crop" :disabled="!locationForm.location_osm_id">3. Image crop</v-tab>
      <v-tab value="Cleanup" :disabled="!productPriceForms.length">4. Cleanup</v-tab>
    </v-tabs>
    <v-tabs-window v-model="tab">
      <v-tabs-window-item value="Signin">
        <v-container>
          <v-col cols="6">
            <h3 class="mb-4">1. Sign in with your OpenFoodFacts account</h3>
            <LoginForm @accessToken="setAccessToken($event)" />
          </v-col>
        </v-container>
      </v-tabs-window-item>
      <v-tabs-window-item value="LocationDate">
        <v-container>
          <v-col cols="6">
            <LocationInputRow :locationForm="locationForm" />
            <DateForm @date="setDate($event)" />
            <v-btn @click="() => tab = 'Crop'" class="mt-4" :disabled="!locationForm.location_osm_id">Next</v-btn>
          </v-col>
        </v-container>
      </v-tabs-window-item>
      <v-tabs-window-item value="Crop">
        <v-container>
          <v-row>
            <v-col cols="6">
              <h3 class="mb-4">1. Upload an image containing fruits and vegetables labels</h3>
              <ImageUploadForm @image="setImage($event)"/>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <h3 class="mb-4">2. Draw squares around the labels</h3>
              <DrawCanvas ref="drawCanvas" :image="image" @croppedImages="onCroppedImages($event)"/>
            </v-col>
            <v-col cols="6">
              <h3 class="mb-4">3. Check the readability of labels</h3>
              <CropImageList :croppedImages="croppedImages" @removeCrop="removeCrop($event)"/>
            </v-col>
          </v-row>
          
          <h3 class="mb-4">4. Send the cropped images for automatic processing</h3>
          <v-btn :disabled="!croppedImages.length" @click="processCroppedImages" :loading="processCroppedImagesLoading">Process Cropped Images</v-btn>
        </v-container>
      </v-tabs-window-item>
       <v-tabs-window-item value="Cleanup">
        <v-container>
          <v-row>
            <v-col
              v-for="(productPriceForm, index) in productPriceForms"
              :key="index"
              cols="12"
              md="3"
              >
              <PriceFormCard :productPriceForm="productPriceForm"></PriceFormCard>
            </v-col>
          </v-row>
          <v-btn class="mt-4" @click="addPrices" :loading="addPricesLoading">Add prices to open prices</v-btn>
        </v-container>
      </v-tabs-window-item>
    </v-tabs-window>

  </v-container>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import api from '../services/api'

export default {
  name: "IndexPage",
  components: {
    PriceFormCard: defineAsyncComponent(() => import('../components/PriceFormCard.vue')),
    LocationInputRow: defineAsyncComponent(() => import('../components/LocationInputRow.vue')),
    LoginForm: defineAsyncComponent(() => import('../components/LoginForm.vue')),
    ImageUploadForm: defineAsyncComponent(() => import('../components/ImageUploadForm.vue')),
    DrawCanvas: defineAsyncComponent(() => import('../components/DrawCanvas.vue')),
    CropImageList: defineAsyncComponent(() => import('../components/CropImageList.vue')),
    DateForm: defineAsyncComponent(() => import('../components/DateForm.vue')),
  },
  data() {
    return {
      tab: 'Signin',
      image: new Image(),
      croppedImages: [],
      croppedBlobs: [],
      productPriceForms : [],
      locationForm: {
        location_osm_id: null,
        location_osm_type: null
      },
      accessToken: null,
      date: new Date().toISOString().substring(0, 10),
      processCroppedImagesLoading: false,
      addPricesLoading: false
    }
  },
  methods: {
    setAccessToken(accessToken) {
      this.accessToken = accessToken
      this.tab = "LocationDate"
    },
    setDate(date) {
      this.date = date
    },
    setImage(image) {
      this.image = image
      this.croppedImages = []
      this.croppedBlobs = []
      this.productPriceForms = []
    },
    onCroppedImages(eventData) {
      this.croppedImages = eventData[0]
      this.croppedBlobs = eventData[1]
    },
    removeCrop(index) {
      this.$refs.drawCanvas.removeRectangle(index) // This will trigger onCroppedImages event to update the other lists
    },
    async processCroppedImages() {
      this.processCroppedImagesLoading = true
      const res = await api.processCroppedBlobs(this.croppedBlobs)
      if (res) {
        this.handleGeminiResponse(res)
      } else {
        console.error("TODO: handle error in image processing")
      }
      this.processCroppedImagesLoading = false
    },
    handleGeminiResponse(response) {
      console.log(response)
      this.productPriceForms = []
      for (let i = 0; i < response.labels.length; i++) {
        const label = response.labels[i]
        // TODO: some of these will be None if gemini did not give a proper reply, so detection and error handling is needed
        const productPriceForm = {
          category_tag: label.product,
          origins_tags: [label.origin],
          labels_tags: label.organic ? ["en:organic"] : [],
          price: label.price.toString(),
          price_per: label.unit,
          price_is_discounted: false,
          proofImage: this.croppedImages[i]
        }
        this.productPriceForms.push(productPriceForm)
      }
      this.tab = "Cleanup"
    },
    async addPrices() {
      this.addPricesLoading = true
      for (let i = 0; i < this.productPriceForms.length; i++) {
        const productPriceForm = this.productPriceForms[i]
        const proof = await api.createProof(this.accessToken, this.croppedBlobs[i], 'PRICE_TAG', this.locationForm.location_osm_id, this.locationForm.location_osm_type, this.date, "EUR")
        console.log(proof)
        let origins_tags = productPriceForm.origins_tags
        if (!Array.isArray(origins_tags)) {
          origins_tags = [origins_tags]
        }
        if (origins_tags[0] == null || origins_tags[0] == "unknown" || origins_tags[0] == "") {
          origins_tags = []
        }
        const priceData = {
          ...productPriceForm,
          origins_tags: origins_tags,
          currency: "EUR",
          date: proof.date,
          location_id: proof.location_id,
          location_osm_id: proof.location_osm_id,
          location_osm_type: proof.location_osm_type,
          proof_id: proof.id
        }
        const res = await api.createPrice(this.accessToken, priceData)
        console.log(res)
        this.productPriceForms[i].processed = true
      }
      this.addPricesLoading = false
    }
  }
}
</script>

