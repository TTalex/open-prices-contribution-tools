<!-- eslint-disable vue/no-mutating-props -->
<template>
    <v-row>
      <v-col>
        <h3 class="required mb-1">
          Product
        </h3>
        <v-row>
          <v-col cols="6">
            <v-autocomplete
              v-model="productForm.category_tag"
              :prepend-inner-icon="productCategoryFormFilled ? 'mdi-basket-check-outline' : 'mdi-basket-outline'"
              label="Category"
              :items="categoryTags"
              :item-title="item => item.name"
              :item-value="item => item.id"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="productForm.origins_tags"
              label="Origin"
              :items="originTags"
              :item-title="item => item.name"
              :item-value="item => item.id"
              hide-details="auto"
            />
          </v-col>
        </v-row>
        <div class="d-inline">
          <v-checkbox
            v-for="lt in labelsTags"
            :key="lt.id"
            v-model="productForm.labels_tags"
            :label="lt.name"
            :value="lt.id"
            hide-details="auto"
          />
        </div>
      </v-col>
    </v-row>
 
  </template>
  
  <script>
  import LabelsTags from '../data/labels-tags.json'
  import CategoryTags from '../data/categories.json'
  import OriginTags from '../data/origins.json'
  
  export default {
    props: {
      productForm: {
        type: Object,
        default: () => ({ category_tag: null, origins_tags: '', labels_tags: [] })
      }
    },
    emits: ['filled'],
    data() {
      return {
        categoryTags: CategoryTags,
        originTags: OriginTags,
        labelsTags: LabelsTags,
      }
    },
    computed: {

      productCategoryFormFilled() {
        let keys = ['category_tag']  // 'origins_tags'
        return Object.keys(this.productForm).filter(k => keys.includes(k)).every(k => !!this.productForm[k])
      },
      productFormFilled() {
        return this.productCategoryFormFilled
      },
    },
    watch: {
      productFormFilled: {
        handler(newProductFormFilled) {
          this.$emit('filled', newProductFormFilled)
        },
        immediate: true
      }
    },
    mounted() {
    },
    methods: {
      
    }
  }
  </script>
  