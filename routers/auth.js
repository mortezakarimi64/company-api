const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const express = require("express");

const router = express.Router();
const { selectQuery } = require("../startup/db");

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const result = await selectQuery(
    `EXEC API.AuthenticateMember N'${req.body.username}', N'${req.body.password}'`
  );

  if (result.recordset[0].Error)
    return res.status(400).send(result.recordset[0]);

  const member = result.recordset[0];

  const token = jwt.sign(
    {
      MemberID: member.MemberID,
      FirstName: member.FirstName,
      LastName: member.LastName,
    },
    config.get("jwtPrivateKey")
  );

  res.send(token);
});

function validate(req) {
  const schema = Joi.object({
    username: Joi.string().min(5).max(50).required(),
    password: Joi.string().min(5).max(50).required(),
  });

  return schema.validate(req);
}

module.exports = router;
