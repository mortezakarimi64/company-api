require("express-async-errors");
const winston = require("winston");
const express = require("express");
const error = require("./middlewares/error");

const app = express();

require("./startup/config")();
require("./startup/secure")(app);
require("./startup/routes")(app);

app.get("/", (req, res) => {
  res.send("Hello API!");
});

// ERROR Middleware
app.use(error);

const port = process.env.PORT || 3031;
app.listen(port, () => winston.info(`Listening on port ${port}`));
