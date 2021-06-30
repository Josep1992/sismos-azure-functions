const fetch = require("isomorphic-unfetch");
const moment = require("moment");
const parse = require("node-html-parser").parse;
const { omit, mapper, shape } = require("../lib/object");

const parser = (html) => parse(html, {
    blockTextElements: {
        script: false,
        noscript: false,
        style: false,
        pre: true
    }
})

function replacer(key) {
    switch (key) {
        case 'issued_date_and_time_': return 'created_at'
        case 'tsunami_warning_level': return 'tsunami'
        case 'region': return 'place'
        default: return key
    }
}

const Logger = require("../infra/logger");
// const earthquake = require("../common/earthquake");

// id:earthquake endpoint
// http://redsismica.uprm.edu/English/Informe_Sismo/myinfoGeneral.php?id=20210627025712&lat=17.9448&lon=-67.1053&prof=11&mag=3.20_Md

module.exports = async function (context, req) {
    const logger = new Logger(context);
    let locale = req.headers.locale || 'en-us';

    logger.event("initialize", "starting rspr:id function");

    let res = {
        status: 200,
        body: {
            data: { attributes: { rspr: { item: {} } } },
            error: null,
        }
    };

    if (req.method === "GET") {
        try {
            logger.event("request", "getting rspr:id data");

            // locale = Spanish || English
            // let { id } = req.query;
            // if(!id) throw new Error('id is required')
            let request = await fetch(`http://redsismica.uprm.edu/English/Informe_Sismo/myinfoGeneral.php?id=20210627025712`);
            let response = await request.text();
            let html = parser(response);

            let table = html.querySelectorAll('table')[3];
            let cells = table.querySelectorAll("td");
            let keys = [];
            let values = [];
            let item = {};

            cells.forEach((element, index, array) => {
                let isValue = index % 2 !== 0;
                if (isValue) {
                    values.push(element.text.trim())
                } else {
                    keys.push(element.text.toLowerCase().trim().replace(/ /g, "_").replace(":", ""))
                }
            });
            // add key:value to item
            keys.forEach((key, index) => (item[key] = values[index]))

            let formattedItem = mapper(
                omit(item, ["distances", "estimated_maximum_intensity"]),
                replacer
            );

            let expectedProperties = ["date", "magnitude", "location", "depth", "id", "place", "created_at"];
            let { isValid } = shape(formattedItem, expectedProperties)

            if(!isValid){
                throw new Error("Data is not valid");
            }

            // TODO make sure properties stay the same regardless of language change
            res.body.data.attributes.rspr.item = formattedItem;

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