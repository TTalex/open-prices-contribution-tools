
function getLocationName(locationObject) {
  // Photon
  if (locationObject.properties) {
    return locationObject.properties.name
  }
  // Nominatim or OP
  return locationObject.name || locationObject.osm_name || ''
}

function getLocationRoad(locationObject) {
  // Nominatim
  if (locationObject.address) {
    let locationRoad = locationObject.address.house_number ? `${locationObject.address.house_number}, ` : ''
    locationRoad += locationObject.address.road || ''
    return locationRoad
  }
  // Photon
  else if (locationObject.properties) {
    let locationRoad = locationObject.properties.housenumber ? `${locationObject.properties.housenumber}, ` : ''
    locationRoad += locationObject.properties.street || ''
    return locationRoad
  }
  // OP
  return ''
}

function getLocationCity(locationObject) {
  // Nominatim
  if (locationObject.address) {
    return locationObject.address.village || locationObject.address.town || locationObject.address.city || locationObject.address.municipality
  }
  // Photon
  else if (locationObject.properties) {
    return locationObject.properties.village || locationObject.properties.town || locationObject.properties.city || locationObject.properties.municipality
  }
  // OP
  return locationObject.osm_address_city || ''
}

/**
 * input: {"geometry":{"coordinates":[2.3548062,48.8301752],"type":"Point"},"type":"Feature","properties":{"osm_id":11112946989,"country":"France","city":"Paris","countrycode":"FR","postcode":"75013","locality":"Quartier de la Maison-Blanche","type":"house","osm_type":"N","osm_key":"shop","housenumber":"30","street":"Avenue d'Italie","district":"Paris","osm_value":"department_store","name":"HEMA","state":"Ile-de-France"}}
 * output: HEMA ; 30, Avenue d'Italie, Paris
 */
function getLocationOSMTitle(locationObject, withName=true, withRoad=false, withCity=true) {
  let locationTitle = ''
  if (withName) {
    locationTitle += `${getLocationName(locationObject)}`
  }
  if (withRoad && (locationObject.address || locationObject.properties)) {
    locationTitle += locationTitle ? ', ' : ''
    locationTitle += getLocationRoad(locationObject)
  }
  if (withCity) {
    locationTitle += locationTitle ? ', ' : ''
    locationTitle += getLocationCity(locationObject)
  }
  if (!locationTitle) {
    locationTitle = locationObject.id
  }
  return locationTitle
}

function getLocationID(locationObject) {
  // Photon
  if (locationObject.properties) {
    return locationObject.properties.osm_id
  }
  // Nominatim or OP
  return locationObject.osm_id
}

function getLocationType(locationObject) {
  if (locationObject.properties) {
    const OSM_TYPE_MAPPING = {"N": "Node", "W": "Way", "R": "Relation"}
    return OSM_TYPE_MAPPING[locationObject.properties.osm_type].toUpperCase()
  }
  // Nominatim or OP
  return locationObject.osm_type.toUpperCase()
}

function buildLocationUniqueId(locationId, locationType) {
  // examples: N12345, W12345, R12345
  if (locationId && locationType) {
    return `${locationType[0]}${locationId.toString()}`
  }
  return null
}

function getLocationUniqueID(locationObject) {
  return buildLocationUniqueId(getLocationID(locationObject), getLocationType(locationObject))
}

function getLocationTag(locationObject) {
  // examples: shop:supermarket, shop:convenience, shop:bakery, shop:doityourself
  // Photon
  if (locationObject.properties) {
    return `${locationObject.properties.osm_key}:${locationObject.properties.osm_value}`
  }
  // Nominatim
  else if (locationObject.address) {
    return `${locationObject.class}:${locationObject.type}`
  }
  // OP
  return `${locationObject.osm_tag_key}:${locationObject.osm_tag_value}`
}

function getLocationLatLng(locationObject) {
  // Nominatim
  if (locationObject.lat && locationObject.lon) {
    return [locationObject.lat, locationObject.lon]
  }
  // Photon
  else if (locationObject.geometry && locationObject.geometry.coordinates) {
    return [locationObject.geometry.coordinates[1], locationObject.geometry.coordinates[0]]
  }
  // OP
  return [locationObject.osm_lat, locationObject.osm_lon]
}


// OP location
function getLocationONLINETitle(locationObject) {
  return locationObject.website_url
}

// OP location
function getLocationIcon() {
    return 'mdi-map-marker-outline'
}

function isNumber(value) {
    // return /^\d+$/.test(value)
    return !isNaN(parseFloat(value)) && isFinite(value)
  }
export default {
  getLocationOSMTitle,
  getLocationID,
  getLocationType,
  buildLocationUniqueId,
  getLocationUniqueID,
  getLocationTag,
  getLocationLatLng,
  getLocationONLINETitle,
  getLocationIcon,
  isNumber
}