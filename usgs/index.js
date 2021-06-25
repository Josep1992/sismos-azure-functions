const fetch = require("isomorphic-unfetch");
const moment = require("moment")

const Logger = require("../infra/logger");
const earthquake = require("../common/earthquake")

// all_day, all_month, all_week
// have to implement this endpoints on the rspr azure function
const USGS_ENDPOINT = (endpoint) => (
  `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${endpoint}.geojson?minlongitude=15&maxlongitude=20`
);

function toPuertoRicoOnly(feature) {
  let regex = /puerto rico/gi;
  return (
    regex.test(feature.properties.place) &&
    feature.properties.mag !== 0
  )
}

module.exports = async function (context, req) {
  const logger = new Logger(context);
  let locale = req.headers.locale || 'en-us';

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

      let request = await fetch(USGS_ENDPOINT("all_month"));
      let json = await request.json();

      if (json.metadata.status === 500 || json.metadata.status === 404) {
        throw new Error("Server error") // placeholder
      }

      logger.event("generate", "creating usgs payload");

      let usgs = json.features.filter(toPuertoRicoOnly).map((feature) => (
        earthquake('usgs',feature)
      ));

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