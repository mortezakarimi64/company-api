const winston = require("winston");
const utils = require("./../tools/utils");

module.exports = (err, req, res, next) => {
  const { method, url, body } = req;
  const errorMessage = err.message || "Internal server error!";
  const currentTime = utils.getCurrentTime();
  const currentDate = utils.getCurrentPersianDateWithoutSlash();

  const errorObject = {
    logDate: currentDate,
    logTime: currentTime,
    method,
    url,
    body,
    error: errorMessage,
  };

  winston.error(errorObject);
  res.status(500).send(errorObject);
};
