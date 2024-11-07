<!-- eslint-disable vue/no-mutating-props -->
<template>
    <v-row>
      <v-col cols="12">
        <h3 class="required mb-1">
          1. Select a location where pictures were taken
        </h3>
        <v-btn class="mb-2" size="small" prepend-icon="mdi-magnify" @click="locationSelectorDialog = true">
          Find location
        </v-btn>
        <v-card-text v-if="location">
            <h4>{{ getLocationTitle(location, true, false, false) }}</h4>
            {{ getLocationTitle(location, false, true, true) }}<br>
            <LocationOSMTagChip :location="location" class="mr-1" />
        </v-card-text>
      </v-col>
    </v-row>
  
    <LocationSelectorDialog
      v-if="locationSelectorDialog"
      v-model="locationSelectorDialog"
      @location="setLocationData($event)"
      @close="locationSelectorDialog = false"
    />
  </template>
  
  <script>
  import { defineAsyncComponent } from 'vue'
  import utils from '../utils.js'
  
  export default {
    components: {
      LocationSelectorDialog: defineAsyncComponent(() => import('../components/LocationSelectorDialog.vue')),
      LocationOSMTagChip: defineAsyncComponent(() => import('../components/LocationOSMTagChip.vue')),
    },
    props: {
      locationForm: {
        type: Object,
        default: () => ({
          location_osm_id: null,
          location_osm_type: null
        })
      },
      maxRecentLocations: {
        type: Number,
        default: 3
      }
    },
    data() {
      return {
        locationSelectorDialog: false,
        loading: false,
        location: null,
      }
    },
    computed: {
      locationFormFilled() {
        let keys = ['location_osm_id', 'location_osm_type']
        return Object.keys(this.locationForm).filter(k => keys.includes(k)).every(k => !!this.locationForm[k])
      },
    },
    mounted() {
    },
    methods: {
      showLocationSelectorDialog() {
        this.locationSelectorDialog = true
      },
      getLocationTitle(location, withName=true, withRoad=false, withCity=true) {
        return utils.getLocationOSMTitle(location, withName, withRoad, withCity)
      },
      getLocationUniqueID(location) {
        return utils.getLocationUniqueID(location)
      },
      setLocationData(location) {
        // update locationForm
        this.locationForm.location_osm_id = utils.getLocationID(location)
        this.locationForm.location_osm_type = utils.getLocationType(location)
        this.location = location
      },
      isSelectedLocation(location) {
        return utils.buildLocationUniqueId(this.locationForm.location_osm_id, this.locationForm.location_osm_type) === utils.getLocationUniqueID(location)
      },
    }
  }
  </script>