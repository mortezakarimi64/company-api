const express = require("express");
const auth = require("../../middlewares/auth");
const router = express.Router();
const { selectQuery } = require("../../startup/db");

router.get("/accessibleModuleCategories", auth, async (req, res) => {
  const { MemberID } = req.user;

  let result = await selectQuery(
    `EXEC AppAPI.GetMemberAccessibleModuleCategories ${MemberID}`
  );

  result = result.recordset;

  res.send(result);
});

router.get("/accessibleModules/:categoryID", auth, async (req, res) => {
  const { MemberID } = req.user;

  let result = await selectQuery(
    `EXEC AppAPI.GetMemberAccessibleModules ${MemberID}, ${req.params.categoryID}`
  );

  result = result.recordset;

  res.send(result);
});

router.get("/accessiblePages/:moduleID", auth, async (req, res) => {
  const { MemberID } = req.user;

  let result = await selectQuery(
    `EXEC AppAPI.GetMemberAccessiblePages ${MemberID}, ${req.params.moduleID}`
  );

  result = result.recordset;

  res.send(result);
});

module.exports = router;
