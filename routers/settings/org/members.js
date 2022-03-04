const express = require("express");
const auth = require("../../../middlewares/auth");
const router = express.Router();
const { selectQuery } = require("../../../startup/db");
const fs = require("fs");
const path = require("path");

router.get("/", auth, async (req, res) => {
  const { MemberID } = req.user;

  let result = await selectQuery(`EXEC OrgAPI.GetAllMembers ${MemberID}`);

  result = result.recordset;

  if (result.length === 1 && result[0].Error)
    return res.status(400).send(result[0]);

  res.send(result);
});

router.get("/params", auth, async (req, res) => {
  const { MemberID } = req.user;

  let result = await selectQuery(`EXEC OrgAPI.GetMembersParams ${MemberID}`);

  result = result.recordset[0];

  if (result.Error) return res.status(400).send(result);

  for (const key in result) {
    result[key] = JSON.parse(result[key]);
  }

  res.send(result);
});

router.post("/search", auth, async (req, res) => {
  const { searchText } = req.body;
  const { MemberID } = req.user;

  let result = await selectQuery(
    `EXEC OrgAPI.SearchMembers ${MemberID}, N'${searchText}'`
  );

  result = result.recordset;

  if (result.length === 1 && result[0].Error)
    return res.status(400).send(result[0]);

  res.send(result);
});

router.post("/", auth, async (req, res) => {
  const { MemberID } = req.user;

  const { MemberID: save_member_id, PicFileName } = req.body;

  if (save_member_id !== 0) {
    const data = await selectQuery(
      `EXEC OrgAPI.GetMemberPicFileName ${MemberID}, ${save_member_id}`
    );

    const currentPicFileName = data.recordset[0].PicFileName;
    if (currentPicFileName.length > 0 && PicFileName.length === 0) {
      // Remove user profile image

      const fileDir = `./uploaded-files/member-profiles/${currentPicFileName}`;

      if (fs.existsSync(fileDir)) {
        try {
          fs.unlinkSync(fileDir);
        } catch {}
      }
    }
  }

  let result = await selectQuery(
    `EXEC OrgAPI.SaveMember ${MemberID}, N'${JSON.stringify(req.body)}'`
  );

  result = result.recordset[0];

  if (result.Error) return res.status(400).send(result);

  res.send(result);
});

router.delete("/:recordID", auth, async (req, res) => {
  const { MemberID } = req.user;

  let result = await selectQuery(
    `EXEC OrgAPI.DeleteMember ${MemberID}, ${req.params.recordID}`
  );

  result = result.recordset[0];

  if (result.Error) return res.status(400).send(result);

  if (result.PicFileName.length > 0) {
    // Remove user profile image

    const fileDir = `./uploaded-files/member-profiles/${result.PicFileName}`;

    if (fs.existsSync(fileDir)) {
      try {
        fs.unlinkSync(fileDir);
      } catch {}
    }
  }

  res.send(result);
});

module.exports = router;
