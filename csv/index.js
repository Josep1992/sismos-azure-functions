const Logger = require("../infra/logger");
const { json2csvAsync } = require('json-2-csv');

module.exports = async function (context, req) {
  const { body } = req;
  const logger = new Logger(context);

  let res = {
    status: 200,
    success: true,
    error: null,
  };

  if (req.method === "POST") {
    try {
      if (!body.data || !Array.isArray(body.data)) {
        throw new Error("body.data is required")
      }

      logger.event("request", "generating csv file");

      const csv = await json2csvAsync(body.data)

      logger.event("response", "sending back csv file");

      context.res.header('Content-Type', 'text/csv');
      context.res.header('attachment; filename=earthquakes.csv')
      return context.res.send(csv);
    } catch (error) {
      // do some error logging here
      logger.event("error", error.message);

      res.error = error.message;
      res.success = false;
      res.status = 500;
      context.res = res;
    }
  }
  return context.res
}