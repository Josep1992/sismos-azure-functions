const fetch = require("isomorphic-unfetch");
const moment = require("moment")

const Logger = require("../infra/logger");
const earthquake = require("../common/earthquake")

const RSPR_ENDPOINT = 'http://redsismica.uprm.edu/Data/prsn/EarlyWarning/Catalogue.txt';

module.exports = async function (context, req) {
    const logger = new Logger(context);
    let locale = req.headers.locale || 'en-us';

    logger.event("initialize", "starting rspr function");

    let res = {
        status: 200,
        body: {
            data: { attributes: { rspr: { items: [], length: 0 } } },
            error: null,
        }
    };

    if (req.method === "GET") {
        try {
            logger.event("request", "getting rspr data");

            let request = await fetch(RSPR_ENDPOINT);
            let datasets = await request.text();

            if (datasets) {
                logger.event("generate", "creating rspr payload");

                let rspr = datasets.trim().split("\n").map((feature) => (
                    earthquake('rspr',feature)
                ));
                res.body.data.attributes.rspr = {
                    items: rspr,
                    length: rspr.length
                };
            }

        } catch (error) {
            // do some error logging here
            logger.event("error", error.message);

            res.body.error = error.message;
            res.body.status = 500;
        }
    }

    logger.event("response", "sending back rspr response");
    context.res = res;
}