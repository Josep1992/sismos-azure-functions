module.exports = async function (context, req) {

  logger.event("initialize", "downloading dataset");

  let res = {
    status: 200,
    body: {
      type: 'csv',
      file: 'here is a csv file',
      error: null,
    }
  };

  if (req.method === "POST") {
    try {
      logger.event("request", "getting csv data");

    } catch (error) {
      // do some error logging here
      logger.event("error", error.message);

      res.body.error = error.message;
      res.body.status = 500;
    }
  }

  logger.event("response", "sending back csv file");
  context.res = res;
}