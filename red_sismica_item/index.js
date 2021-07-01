const fetch = require("isomorphic-unfetch");
const parse = require("node-html-parser").parse;
const Logger = require("../infra/logger");
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
        case "profundidad": return "depth";
        case "magnitud": return "magnitude";
        case "distancias": return "distances";
        case "intensidad_maxima_estimada": return "estimated_maximum_intensity";
        case "localización": return "location";
        case "fecha_y_hora_de_emisión":
        case 'issued_date_and_time_': return 'created_at';
        case 'nivel_de_alerta_de_tsunami':
        case 'tsunami_warning_level': return 'tsunami';
        case 'región':
        case 'region': return 'place';
        case "date":
        case 'fecha': return "date"
        default: return key
    }
}


module.exports = async function (context, req) {
    const logger = new Logger(context);

    let locale = req.headers.locale || 'en-us';
    let languages = { 'en-us': "English", 'es-us': "Spanish" };
    // default to English if no locale
    let language = !(locale in languages) ? languages["en-us"] : languages[locale];
    let { id } = req.query; //20210627025712

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

            if (!id) throw new Error('id is required');

            let request = await fetch(
                `http://redsismica.uprm.edu/${language}/Informe_Sismo/myinfoGeneral.php?id=${id}`
            );
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

            item = omit(item, ["distances", "estimated_maximum_intensity"]);
            let formattedItem = mapper(item, replacer);

            let expectedProperties = ["date", "magnitude", "location", "depth", "id", "place", "created_at"];
            let { isValid } = shape(formattedItem, expectedProperties)

            if (!isValid) {
                throw new Error("Data is not valid");
                // we could instead fetch all the earthquakes and filter to find @id
                // and return it maybe?
            }

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