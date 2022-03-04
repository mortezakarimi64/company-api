const express = require("express");
const auth = require("../../../middlewares/auth");
const router = express.Router();
const { selectQuery } = require("../../../startup/db");

router.get("/pages/:employee_memberID", auth, async (req, res) => {
  const { MemberID } = req.user;

  let result = await selectQuery(
    `EXEC AppAPI.GetMemberPageAccesses ${MemberID}, ${req.params.employee_memberID}`
  );

  result = result.recordset[0];

  if (result.Error) return res.status(400).send(result);

  for (const key in result) {
    result[key] = JSON.parse(result[key]);

    if (key === "Pages") {
      result[key].forEach((category) => {
        category.Modules = JSON.parse(category.Modules);

        category.Modules.forEach((module) => {
          module.Pages = JSON.parse(module.Pages);
        });
      });
    }
  }

  res.send(result);
});

router.post("/", auth, async (req, res) => {
  const { MemberID } = req.user;
  const { employee_memberID, records } = req.body;

  let result = await selectQuery(
    `EXEC AppAPI.SaveChangedAccesses ${MemberID}, ${employee_memberID}, N'${JSON.stringify(
      records
    )}'`
  );

  result = result.recordset[0];

  if (result.Error) return res.status(400).send(result);

  res.send(result);
});

module.exports = router;
