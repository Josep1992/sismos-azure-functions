const fetch = require("isomorphic-unfetch"); //replace for undici
const Logger = require("../infra/logger");
const earthquake = require("../common/earthquake")

const USGS_ITEM_ENDPOINT = (id) => (
  `https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/${id}.geojson`
);

module.exports = async function (context, req) {
  const logger = new Logger(context);
  let locale = req.headers.locale || 'en';
  let { id = 'pr2021194002' } = req.query; //

  logger.event("initialize", "starting rspr function");

  let res = {
    status: 200,
    body: {
      type: 'usgs',
      data: { attributes: { usgs: { item: {} } } },
      error: null,
    }
  };

  if (req.method === "GET") {
    try {
      logger.event("request", "getting usgs data");

      let request = await fetch(USGS_ITEM_ENDPOINT(id));
      let json = await request.json();

      logger.event("generate", "creating usgs payload");

      res.body.data.attributes.usgs = { item: earthquake('usgs',json) };

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