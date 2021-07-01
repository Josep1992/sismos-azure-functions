const fetch = require("isomorphic-unfetch");
const Logger = require("../infra/logger");
const earthquake = require("../common/earthquake")

// all_day, all_month, all_week
// have to implement this endpoints on the red_sismica azure function
const USGS_ENDPOINT = (endpoint) => (
  `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${endpoint}.geojson?minlongitude=15&maxlongitude=20`
);

function toPuertoRicoOnly(feature) {
  let puertoRicoRegex = /puerto rico/gi;
  let hasMagnitude = feature.properties.mag !== 0
  let hasPuertoRicoId = feature.id.startsWith('pr');

  return (
    (puertoRicoRegex.test(feature.properties.place) || hasPuertoRicoId) && hasMagnitude
  )
}

module.exports = async function (context, req) {
  const logger = new Logger(context);
  let locale = req.headers.locale || 'en';
  let { range = 'all_month' } = req.query // options are: all_day, all_month, all_week

  logger.event("initialize", "starting rspr function");

  let res = {
    status: 200,
    body: {
      data: { attributes: { usgs: { items: [], length: 0 } } },
      error: null,
    }
  };

  if (req.method === "GET") {
    try {
      logger.event("request", "getting usgs data");

      let request = await fetch(USGS_ENDPOINT(range));
      let json = await request.json();

      if (json.metadata.status === 500 || json.metadata.status === 404) {
        throw new Error("Server error") // placeholder
      }

      logger.event("generate", "creating usgs payload");

      let usgsFeature = (feature) => earthquake('usgs', feature);
      let usgs = json.features.filter(toPuertoRicoOnly).map(usgsFeature);

      res.body.data.attributes.usgs = {
        items: usgs,
        length: usgs.length
      };

    } catch (error) {
      // do some error logging here
      logger.event("error", error.message);

      res.body.error = error.message;
      res.body.status = 500;
    }
  }

  logger.event("response", "sending back usgs response");
  context.res = res;
}