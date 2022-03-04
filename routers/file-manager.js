const _ = require("lodash");
const express = require("express");
const auth = require("./../middlewares/auth");
const router = express.Router();
// const { selectQuery } = require("../startup/db");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const utils = require("./../tools/utils");

var storage = (category) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      let subDir = `./uploaded-files/files/`;
      //   if (req.header("category")) {
      //     subDir = `./uploaded-files/${req.header("category")}/`;
      //   }

      if (category) {
        subDir = `./uploaded-files/${category}/`;
      }

      cb(null, subDir);
    },
    filename: function (req, file, callback) {
      callback(
        null,
        `${
          req.user.MemberID
        }_${utils.getCurrentPersianDateWithoutSlash()}_${utils.getCurrentTime()}_${utils.generateRandomPassword(
          10
        )}${path.extname(file.originalname)}`
        // req.user.MemberID +
        //   "_" +
        //   utils.getCurrentPersianDateWithoutSlash() +
        //   "_" +
        //   utils.getCurrentTime() +
        //   path.extname(file.originalname)
      );
    },
  });

var upload = (category, formats, maxFileSize) =>
  multer({
    storage: storage(category),
    fileFilter: function (req, file, callback) {
      const isValidExtension = file.originalname.toLowerCase().match(formats);

      // default regex: /\.(txt|doc|docx)$/

      if (!isValidExtension) {
        callback(
          { ErrorType: "InvalidFileFormat", Error: "فرمت فایل معتبر نمی باشد" },
          false
        );
      } else {
        callback(null, true);
      }
    },
    limits: {
      fileSize: maxFileSize, //512 * 1024
    },
  });

var uploadMiddleware = function (req, res, next) {
  if (req.header("category")) {
    const dir = `./uploaded-files/${req.header("category")}/`;

    if (!fs.existsSync(dir)) {
      return res.status(400).send({
        ErrorType: "InvalidFileGroup",
        Error: "گروه فایل معتبر نمی باشد",
      });
    }

    // delete last uploaded file if requested
    if (req.header("deleteFileName")) {
      const fileDir = `${dir}${req.header("deleteFileName")}`;

      if (fs.existsSync(fileDir)) {
        try {
          fs.unlinkSync(fileDir);
        } catch {}
      }
    }
  }

  let validFormats = new RegExp(`\.(txt|doc|docx|pdf|png|jpg)$`);
  if (req.header("extensions")) {
    validFormats = new RegExp(`\.(${req.header("extensions")})$`);
  }

  let maxFileSize = 512 * 1024;
  if (req.header("maxFileSize")) {
    maxFileSize = req.header("maxFileSize") * 1024 * 1024;
  }

  var handler = upload(
    req.header("category"),
    validFormats,
    maxFileSize
  ).single("dataFile"); //use whatever makes sense here

  handler(req, res, function (err) {
    //send error response if Multer threw an error

    if (err) {
      if (err.Error) {
        return res.status(400).send(_.pick(err, ["Error"]));
      } else {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).send({
            ErrorType: "InvalidFileSize",
            Error: "حجم فایل بیش از حد مجاز است",
          });
        } else
          return res
            .status(400)
            .send({ ErrorType: "Global", Error: err.message });
      }
    }

    //move to the next middleware, or to the route after no error was found
    next();
  });
};

router.post("/upload", [auth, uploadMiddleware], async function (req, res) {
  const dir = `./uploaded-files/${req.header("category")}/`;

  if (!fs.existsSync(dir)) {
    return res.status(400).send({
      ErrorType: "InvalidFileGroup",
      Error: "گروه فایل معتبر نمی باشد",
    });
  }

  const fileDir = `${dir}${req.file.filename}`;

  if (!fs.existsSync(fileDir)) {
    return res.status(400).send({
      ErrorType: "InvalidFile",
      Error: "آپلود فایل امکانپذیر نمی باشد",
    });
  }

  res.send({ uploaded: true, fileName: req.file.filename });
});

router.get("/download/:file(*)", [auth], (req, res) => {
  let file = req.params.file;

  let subDir = `./uploaded-files/files/`;
  if (req.header("category")) {
    subDir = `./uploaded-files/${req.header("category")}/`;
  }

  const fileLocation = path.join(subDir, file);

  res.download(fileLocation, file);
});

router.delete("/:file(*)", [auth], (req, res) => {
  let file = req.params.file;

  if (file && file.length > 0) {
    let dir = `./uploaded-files/files/`;
    if (req.header("category")) {
      dir = `./uploaded-files/${req.header("category")}/`;
    }

    const fileDir = `${dir}${file}`;

    if (fs.existsSync(fileDir)) {
      fs.unlinkSync(fileDir);
    }
  }

  res.send();
});

module.exports = router;
