const express = require("express");
const auth = require("../../../middlewares/auth");
const router = express.Router();
const { selectQuery } = require("../../../startup/db");
const fs = require("fs");

router.get("/", auth, async (req, res) => {
  const { MemberID } = req.user;

  let result = await selectQuery(`EXEC TaskAPI.GetAllTasks ${MemberID}`);

  result = result.recordset;

  if (result.length === 1 && result[0].Error)
    return res.status(400).send(result[0]);

  res.send(result);
});

router.post("/search", auth, async (req, res) => {
  const { searchText } = req.body;
  const { MemberID } = req.user;

  let result = await selectQuery(`EXEC TaskAPI.SearchTasks ${MemberID}, N'${searchText}'`);

  result = result.recordset;

  if (result.length === 1 && result[0].Error)
    return res.status(400).send(result[0]);

  res.send(result);
});

router.get("/params", auth, async (req, res) => {
  const { MemberID } = req.user;

  let result = await selectQuery(`EXEC TaskAPI.GetTasksParams ${MemberID}`);

  result = result.recordset[0];

  if (result.Error) return res.status(400).send(result);

  for (const key in result) {
    result[key] = JSON.parse(result[key]);
  }

  res.send(result);
});

router.post("/", auth, async (req, res) => {
  const { MemberID } = req.user;
  let result = await selectQuery(`EXEC TaskAPI.SaveTask ${MemberID}, N'${JSON.stringify(req.body)}'`);

  result = result.recordset[0];

  if (result.Error) return res.status(400).send(result);

  res.send(result);
});

router.delete("/:recordID", auth, async (req, res) => {
  const { MemberID } = req.user;

  let result = await selectQuery(`EXEC TaskAPI.DeleteTask ${MemberID}, ${req.params.recordID}`);

  result = result.recordset[0];
  if (result.Error) return res.status(400).send(result);

  if (result.Files) {
    JSON.parse(result.Files).forEach(element => {
      const fileDir = `./uploaded-files/tasks/${element.FileName}`;
      if (fs.existsSync(fileDir)) {
        try {
          fs.unlinkSync(fileDir);
        } catch {}
      }
    });
  }

  res.send(result);
});

module.exports = router;
