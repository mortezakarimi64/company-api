const sql = require("mssql/msnodesqlv8");

const config = {
  // database: "CompanyDB",
  // server: "...",
  // user: "...",
  // password: "...",
  // requestTimeout: 60000,
  // driver: "msnodesqlv8",
  connectionTimeout: 30000,
  requestTimeout: 30000,
  //------------------------------------------
  database: "CompanyDB",
  server: ".\\SQLEXPRESS",
  options: {
    trustedConnection: true,
  },
};

const selectQuery = async (query) => {
  const pool = new sql.ConnectionPool(config);

  pool.on("error", (err) => {
    // ... error handler
    // console.log("sql errors", err);
  });

  try {
    await pool.connect();

    let result = await pool.request().query(query);

    return result;
  } catch (err) {
    //console.log(err);
  } finally {
    // console.log("Finished on: ", getFormattedTime(new Date()));
    pool.close(); //closing connection after request is finished.
  }
};

module.exports = {
  selectQuery,
};
