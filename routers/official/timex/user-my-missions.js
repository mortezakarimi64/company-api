const express = require("express");
const auth = require("../../../middlewares/auth");
const router = express.Router();
const { selectQuery } = require("../../../startup/db");

router.get("/params", auth, async (req, res) => {
  const { MemberID } = req.user;

  let result = await selectQuery(
    `EXEC TimexAPI.GetMyMissionsParams ${MemberID}`
  );

  result = result.recordset[0];

  if (result.Error) return res.status(400).send(result);

  for (const key in result) {
    result[key] = JSON.parse(result[key]);
  }

  res.send(result);
});

router.post("/note/seen/:recordID", auth, async (req, res) => {
  const { MemberID } = req.user;

  let result = await selectQuery(
    `EXEC TimexAPI.SaveMyMissionNoteSeenDateTime ${MemberID}, ${req.params.recordID}`
  );

  result = result.recordset[0];

  if (result.Error) return res.status(400).send(result);

  //------

  if (result.VehicleInfo.length > 0)
    result.VehicleInfo = JSON.parse(result.VehicleInfo);

  result.ReportInfo = JSON.parse(result.ReportInfo);
  result.Notes = JSON.parse(result.Notes);

  //------

  res.send(result);
});

router.post("/search", auth, async (req, res) => {
  const { MemberID } = req.user;

  let result = await selectQuery(
    `EXEC TimexAPI.SearchMyMissions ${MemberID}, N'${JSON.stringify(req.body)}'`
  );

  result = result.recordset;

  result.forEach((mission) => {
    if (mission.VehicleInfo.length > 0)
      mission.VehicleInfo = JSON.parse(mission.VehicleInfo);

    mission.ReportInfo = JSON.parse(mission.ReportInfo);
    mission.Notes = JSON.parse(mission.Notes);
  });

  res.send(result);
});

router.post("/report", auth, async (req, res) => {
  const { MemberID } = req.user;

  let result = await selectQuery(
    `EXEC TimexAPI.SaveMyMissionReport ${MemberID}, N'${JSON.stringify(
      req.body
    )}'`
  );

  result = result.recordset[0];

  if (result.Error) return res.status(400).send(result);

  result.ReportInfo = JSON.parse(result.ReportInfo);

  res.send(result);
});

router.post("/", auth, async (req, res) => {
  const { MemberID } = req.user;

  let result = await selectQuery(
    `EXEC TimexAPI.SaveMyMission ${MemberID}, N'${JSON.stringify(req.body)}'`
  );

  result = result.recordset[0];

  if (result.Error) return res.status(400).send(result);

  res.send(result);
});

router.delete("/report/:recordID", auth, async (req, res) => {
  const { MemberID } = req.user;

  let result = await selectQuery(
    `EXEC TimexAPI.DeleteMyMissionReport ${MemberID}, ${req.params.recordID}`
  );

  result = result.recordset[0];

  if (result.Error) return res.status(400).send(result);

  result.ReportInfo = JSON.parse(result.ReportInfo);

  res.send(result);
});

router.delete("/:recordID", auth, async (req, res) => {
  const { MemberID } = req.user;

  let result = await selectQuery(
    `EXEC TimexAPI.DeleteMyMission ${MemberID}, ${req.params.recordID}`
  );

  result = result.recordset[0];

  if (result.Error) return res.status(400).send(result);

  res.send(result);
});

module.exports = router;
