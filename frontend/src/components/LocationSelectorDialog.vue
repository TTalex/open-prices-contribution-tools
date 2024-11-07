<template>
    <v-dialog scrollable max-height="80%" min-width="50%" width="auto">
      <v-card>
        <v-card-title>
            Find your shop location <v-btn style="float:right;" variant="text" density="compact" icon="mdi-close" @click="close" />
        </v-card-title>
  
        <v-divider />
  
        <v-card-text>
          <v-form @submit.prevent="search">
            <v-text-field
              ref="locationInput"
              v-model="locationSearchForm.q"
              label="SearchByName"
              type="text"
              append-inner-icon="mdi-magnify"
              :rules="[fieldRequired]"
              :loading="loading"
              required
              persistent-hint
              @click:append-inner="search"
            />
          </v-form>
  
          <p v-if="searchProvider === 'nominatim'" class="text-caption text-warning mt-2">
            <br>
          </p>
  
          <v-sheet v-if="results">
            <h3 class="mt-4 mb-1">
                <small>{{ Array.isArray(results) ? results.length : 0 }}</small>
            </h3>
            <v-row v-if="Array.isArray(results)">
              <v-col cols="12" sm="6">
                <v-card
                  v-for="location in results"
                  :key="getLocationUniqueID(location)"
                  class="mb-2"
                  width="100%"
                  elevation="1"
                  @click="selectLocation(location)"
                >
                  <v-card-text>
                    <h4>{{ getLocationTitle(location, true, false, false) }}</h4>
                    {{ getLocationTitle(location, false, true, true) }}<br>
                    <LocationOSMTagChip :location="location" class="mr-1" />
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
  
            <p v-else-if="typeof results === 'string'">
              {{ results }}
            </p>
          </v-sheet>
  
        </v-card-text>
  
        <v-divider />
  
        <v-card-actions class="justify-end">
          <div>
            <a v-if="searchProvider === 'nominatim'" href="https://nominatim.openstreetmap.org" target="_blank">Nominatim (OpenStreetMap)</a>
            <a v-if="searchProvider === 'photon'" href="https://photon.komoot.io" target="_blank">Komoot Photon (OpenStreetMap)</a>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script>
  import { defineAsyncComponent } from 'vue'
  import api from '../services/api'
  import utils from '../utils.js'
  
  export default {
    components: {
      LocationOSMTagChip: defineAsyncComponent(() => import('../components/LocationOSMTagChip.vue')),
    },
    emits: ['location', 'close'],
    data() {
      return {
        // location form
        locationSearchForm: {
          q: ''
        },
        loading: false,
        results: null,
        // search
        searchProvider: 'photon',  // 'nominatim', 'photon'
      }
    },
    computed: {
      formFilled() {
        return Object.values(this.locationSearchForm).every(x => !!x)
      },
    },
    mounted() {
      this.$refs.locationInput.focus()
    },
    methods: {
      fieldRequired(v) {
        return !!v
      },
      search() {
        this.$refs.locationInput.blur()
        this.results = null
        this.loading = true
        // search by id (N12208020359, 12208020359)
        if (utils.isNumber(this.locationSearchForm.q.substring(1))) {
          const id = utils.isNumber(this.locationSearchForm.q.substring(0, 1)) ? this.locationSearchForm.q : this.locationSearchForm.q.substring(1) 
          api.openstreetmapNominatimLookup(id)
          .then((data) => {
            this.loading = false
            if (data.length) {
              this.results = data
            } else {
              this.results = "No Result"
            }
          })
        // search by name
        } else {
          api.openstreetmapSearch(this.locationSearchForm.q, this.searchProvider)
          .then((data) => {
            this.loading = false
            if (data.length) {
              this.results = data
            } else {
              this.results = "No Result"
            }
          })
        }
      },
      getLocationTitle(location, withName=true, withRoad=false, withCity=true) {
        return utils.getLocationOSMTitle(location, withName, withRoad, withCity)
      },
      getLocationUniqueID(location) {
        return utils.getLocationUniqueID(location)
      },
      selectLocation(location) {
        this.$emit('location', location)
        this.close()
      },
      close() {
        this.$emit('close')
      },
    },
  }
  </script>