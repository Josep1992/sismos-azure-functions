const fetch = require("isomorphic-unfetch");
const regions = require("../utils/regions");

const RSPR_ENDPOINT = 'http://redsismica.uprm.edu/Data/prsn/EarlyWarning/Catalogue.txt'

function createDataPoint(point){
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
            },
            depth,
            region: !regions[code] ? null : regions[code]["name"]
        };
    }
}

module.exports = async function (context, req) {
    let body = {
        data: { attributes: { rspr: [] } },
        error: null,
    };

    if (req.method === "GET") {
        try {
            let response = await fetch(RSPR_ENDPOINT);
            let datasets = await response.text();

            if (datasets) {
                let rspr = datasets.trim().split("\n").map(createDataPoint);
                body.data.attributes.rspr = rspr;
            }

        } catch (error) {
            // do some error logging here
            body.error = error;
        }
    }

    context.res = {
        // status: 200, /* Defaults to 200 */
        body
    };
}