<!-- eslint-disable vue/no-mutating-props -->
<template>
    <v-row>
      <v-col :cols="priceForm.price_is_discounted ? '6' : '12'" sm="6">
        <v-text-field
          :model-value="priceForm.price"
          :label="priceForm.price_is_discounted ? 'Discounted price' : 'Price'"
          type="text"
          inputmode="decimal"
          :rules="priceRules"
          :suffix="priceForm.currency"
          @update:modelValue="newValue => priceForm.price = fixComma(newValue)"
        >
        </v-text-field>
      </v-col>
      <v-col v-if="priceForm.price_is_discounted" cols="6">
        <v-text-field
          :model-value="priceForm.price_without_discount"
          label="Full price"
          type="text"
          inputmode="decimal"
          :rules="priceRules"
          :suffix="priceForm.currency"
          persistent-hint
          @update:modelValue="newValue => priceForm.price_without_discount = fixComma(newValue)"
        />
      </v-col>
    </v-row>
    <div class="d-inline">
      <v-switch v-model="priceForm.price_is_discounted" label="Discount" color="success" hide-details="auto" />
    </div>
  
  </template>
  
  <script>
  export default {
    props: {
      priceForm: {
        type: Object,
        default: () => ({
          price: null,
          currency: null,
          price_is_discounted: false,
          price_without_discount: null
        })
      },
    },
    emits: ['filled'],
    data() {
      return {
        // currency selection
        changeCurrencyDialog: false,
      }
    },
    computed: {
      priceRules() {
        return [
          value => !!value && !!value.trim() || "AmountRequired",
          value => !value.trim().match(/ /) || "NoSpaces",
          value => !isNaN(value) || "Number",
          value => Number(value) >= 0 || "Positive",
          value => !value.match(/\.\d{3}/) || "TwoDecimals",
        ]
      },
      priceFormFilled() {
        let keys = ['price', 'currency']
        return Object.keys(this.priceForm).filter(k => keys.includes(k)).every(k => !!this.priceForm[k])
      },
    },
    watch: {
      priceFormFilled(newPriceFormFilled) {
        this.$emit('filled', newPriceFormFilled)
      }
    },
    methods: {
      fixComma(input) {
        return input.replace(/,/g, '.')
      },
    }
  }
  </script>
  
  <style scoped>
  .icon-info-currency {
    cursor: pointer;
    width: 24px;
    height: 24px;
  }
  </style>
  