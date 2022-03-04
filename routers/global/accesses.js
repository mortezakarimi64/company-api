const express = require("express");
const auth = require("../../middlewares/auth");
const router = express.Router();
const { selectQuery } = require("../../startup/db");

router.post("/", auth, async (req, res) => {
  const { MemberID } = req.user;
  const { pageName } = req.body;

  let result = await selectQuery(
    `EXEC AppAPI.GetPageAccess ${MemberID}, N'${pageName}'`
  );

  result = result.recordset[0];
  if (result.Error) return res.status(400).send(result);

  res.send(result);
});

router.post("/search-members", auth, async (req, res) => {
  const { MemberID } = req.user;
  const { pageName, searchText } = req.body;

  let result = await selectQuery(
    `EXEC OrgAPI.SearchMembersAsParams ${MemberID}, N'${pageName}', N'${searchText}'`
  );

  result = result.recordset;

  res.send(result);
});

router.post("/search-companies", auth, async (req, res) => {
  const { MemberID } = req.user;
  const { pageName, searchText } = req.body;

  let result = await selectQuery(
    `EXEC OrgAPI.SearchCompaniesAsParams ${MemberID}, N'${pageName}', N'${searchText}'`
  );

  result = result.recordset;

  res.send(result);
});

module.exports = router;
