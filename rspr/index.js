const fetch = require("isomorphic-unfetch");
const regions = require("../utils/regions");
const Logger = require("../lib/index");

const RSPR_ENDPOINT = 'http://redsismica.uprm.edu/Data/prsn/EarlyWarning/Catalogue.txt';
const GOOGLE_MAPS_EMBED_API_KEY = 'AIzaSyCLHcH6_I0oUWlE3XAiXw2sPAKdbhbzqBc';

function map({ latitude, longitude }) {
    const url = [
        `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_EMBED_API_KEY}`,
        `&center=${longitude},${latitude}`,
        `&q=${longitude},${latitude}`,
        `&zoom=7`
    ];
    return url.join("");
}

function earthquake(point) {
    let [
        id, magnitude, ,
        source, date, time, latitude,
        longitude, depth, , code
    ] = point.split(" ");

    if (id) {
        return {
            id,
            magnitude,
            source: source.toLowerCase(),
            created_at: new Date(date),
            time,
            coords: {
                latitude,
                longitude,
                depth,
            },
            region: !regions[code] ? null : regions[code]["name"],
            // authorize api
            map: map({ latitude, longitude })
        };
    }
}

module.exports = async function (context, req) {
    const logger = new Logger(context);

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

            let http = await fetch(RSPR_ENDPOINT);
            let datasets = await http.text();

            if (datasets) {
                logger.event("generate", "creating rspr payload");

                let rspr = datasets.trim().split("\n").map(earthquake);
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