const OPEN_PRICES_API_URL = import.meta.env.VITE_OPEN_PRICES_API_URL
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL
const PRICE_UPDATE_FIELDS = ['price', 'price_is_discounted', 'price_without_discount', 'price_per', 'currency', 'date']
const PRICE_CREATE_FIELDS = PRICE_UPDATE_FIELDS.concat(['product_code', 'product_name', 'category_tag', 'labels_tags', 'origins_tags', 'location_id', 'location_osm_id', 'location_osm_type', 'proof_id'])

const LOCATION_SEARCH_LIMIT = 10
const OP_DEFAULT_HEADERS = {
  'Content-Type': 'application/json'
}
const constants = {
  OSM_URL: 'https://www.openstreetmap.org',
  OSM_NOMINATIM_SEARCH_URL: 'https://nominatim.openstreetmap.org/search',
  OSM_NOMINATIM_LOOKUP_URL: 'https://nominatim.openstreetmap.org/lookup',
  OSM_PHOTON_SEARCH_URL: 'https://photon.komoot.io/api/',
  // https://wiki.openstreetmap.org/wiki/Key:place
  // https://wiki.openstreetmap.org/wiki/Key:highway
  // https://wiki.openstreetmap.org/wiki/Buildings
  NOMINATIM_RESULT_TYPE_EXCLUDE_LIST: [
    'country', 'state', 'region', 'province', 'district', 'county', 'municipality', 'city', 'borough', 'suburb', 'quarter', 'neighbourhood', 'block', 'city_block', 'plot', 'town', 'village', 'hamlet', 'isolated_dwelling', 'allotments',
    'continent', 'archipelago', 'island', 'islet', 'square', 'locality', 'polder', 'sea', 'ocean',
    'administrative', 'state_district',
    'motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'unclassified', 'residential', 'living_street', 'service', 'pedestrian', 'track', 'road', 'footway',
    'apartments', 'barracks', 'bungalow', 'cabin', 'detached', 'dormitory', 'ger', 'house', 'houseboat', 'residential',  // 'farm', 'hotel'
    'fuel', 'gas', 'casino', 'parking', 'parking_space', 'charging_station', 'atm',
    'car_sharing',
    'yes',
  ],
}
function buildURLParams(params = {}) {
  return new URLSearchParams({...params})
}
function filterBodyWithAllowedKeys(data, allowedKeys) {
  const filteredData = {}
  for (const key in data) {
    if (allowedKeys.includes(key)) {
      filteredData[key] = data[key]
    }
  }
  return filteredData
}

export default {
  signIn(username, password) {
    let formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    const url = `${OPEN_PRICES_API_URL}/api/v1/auth?${buildURLParams()}`
    return fetch(url, {
      method: 'POST',
      body: formData,
      headers: {}
    })
    .then((response) => response.json())
  },
  createProof(access_token, proofImage, type='PRICE_TAG', location_osm_id=null, location_osm_type=null, date=null, currency=null) {
    let formData = new FormData()
    formData.append('file', proofImage)
    const params = {
      'type': type,
      'location_osm_id': location_osm_id ? location_osm_id : '',
      'location_osm_type': location_osm_type ? location_osm_type : '',
      'date': date ? date : '',
      'currency': currency ? currency : '',
      'access_token': access_token,
    }
    const url = `${BACKEND_API_URL}/proofs/upload?${buildURLParams(params)}`
    return fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`
      },
      body: formData,
    })
    .then((response) => response.json())
  },
  createPrice(access_token, data) {
    const url = `${BACKEND_API_URL}/prices`
    let body = filterBodyWithAllowedKeys(data, PRICE_CREATE_FIELDS)
    body.access_token = access_token
    return fetch(url, {
      method: 'POST',
      headers: Object.assign({}, OP_DEFAULT_HEADERS, {
        'Authorization': `Bearer ${access_token}`,
      }),
      body: JSON.stringify(body),
    })
    .then((response) => response.json())
  },
  openstreetmapNominatimSearch(q) {
    const url = `${constants.OSM_NOMINATIM_SEARCH_URL}?q=${q}&addressdetails=1&format=json&limit=${LOCATION_SEARCH_LIMIT}`
    return fetch(url, {
      method: 'GET',
      headers: OP_DEFAULT_HEADERS
    })
    .then((response) => response.json())
    .then((data) => data.filter(l => !constants.NOMINATIM_RESULT_TYPE_EXCLUDE_LIST.includes(l.type)))
  },
  openstreetmapNominatimLookup(id) {
    const url = `${constants.OSM_NOMINATIM_LOOKUP_URL}?osm_ids=N${id},W${id},R${id}&addressdetails=1&format=json`
    return fetch(url, {
      method: 'GET',
      headers: OP_DEFAULT_HEADERS
    })
    .then((response) => response.json())
    .then((data) => data.filter(l => !constants.NOMINATIM_RESULT_TYPE_EXCLUDE_LIST.includes(l.type)))
  },
  // Photon: restrict the search to shop & amenity
  openstreetmapPhotonSearch(q, restrictToShop=true) {
    let url = `${constants.OSM_PHOTON_SEARCH_URL}?q=${q}&limit=${LOCATION_SEARCH_LIMIT}`
    if (restrictToShop) {
      url += '&osm_tag=shop&osm_tag=amenity'
    }
    return fetch(url, {
      method: 'GET',
      headers: OP_DEFAULT_HEADERS
    })
    .then((response) => response.json())
    .then(data => data.features)
    .then((data) => data.filter(l => !constants.NOMINATIM_RESULT_TYPE_EXCLUDE_LIST.includes(l.properties.osm_value)))
  },
  openstreetmapSearch(q, source='nominatim') {
    if (source === 'photon') {
      return this.openstreetmapPhotonSearch(q)
    } else {
      // default to nominatim
      return this.openstreetmapNominatimSearch(q)
    }
  },
  async processCroppedBlobs(croppedBlobs) {
    const apiUrl = `${BACKEND_API_URL}/upload`
    const formData = new FormData()
    
    croppedBlobs.forEach((blob) => {
      formData.append('files', blob)
    });
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        return await response.json()
      } else {
        return null
      }
    } catch (error) {
      return null
    }
  }
}