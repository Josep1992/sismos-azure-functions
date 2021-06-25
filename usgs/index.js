const fetch = require("isomorphic-unfetch");
const moment = require("moment")

const Logger = require("../infra/logger");
const earthquake = require("../common/earthquake")

// all_day, all_month, all_week
// have to implement this endpoints on the rspr azure function
const USGS_ENDPOINT = (endpoint) => (
  `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${endpoint}.geojson?minlongitude=15&maxlongitude=20`
);

//USGS data structure
// {
//   "type": "Feature",
//   "properties": {
//     "mag": 1.24,
//     "place": "16km NNW of Westmorland, CA",
//     "time": 1624503048230,
//     "updated": 1624503264447,
//     "tz": null,
//     "url": "https://earthquake.usgs.gov/earthquakes/eventpage/ci39717031",
//     "detail": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/ci39717031.geojson",
//     "felt": null,
//     "cdi": null,
//     "mmi": null,
//     "alert": null,
//     "status": "automatic",
//     "tsunami": 0,
//     "sig": 24,
//     "net": "ci",
//     "code": "39717031",
//     "ids": ",ci39717031,",
//     "sources": ",ci,",
//     "types": ",nearby-cities,origin,phase-data,scitech-link,",
//     "nst": 15,
//     "dmin": 0.04,
//     "rms": 0.19,
//     "gap": 151,
//     "magType": "ml",
//     "type": "earthquake",
//     "title": "M 1.2 - 16km NNW of Westmorland, CA"
//   },
//   "geometry": {
//     "type": "Point",
//     "coordinates": [
//       -115.6845,
//       33.1666667,
//       9.58
//     ]
//   },
//   "id": "ci39717031"
// },

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