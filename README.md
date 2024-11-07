# A contribution assistant for Open Prices

Interacts with Gemini for automatic detection, and Open Prices APIs for login and price / proof creation.

Only supports pictures of fruit and vegetable labels.

Made for unpackaged fruits and vegetables sold in France using euros, results will vary/fail in other contexts.

Warning: this is a powerful tool able to add a lot of prices at once, beware. 

Also, backend has CORS fully opened, and no API auth is configured, so do not use on a public server as is.

## Tech used

Fronted uses Vuejs and the vuetify framework.

Backend is a single file fastapi, see readme in backend folder.