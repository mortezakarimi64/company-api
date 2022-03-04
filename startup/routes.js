const express = require("express");
const auth = require("../routers/auth");
const filemanager = require("../routers/file-manager");
const modules = require("../routers/global/modules");
const accesses = require("../routers/global/accesses");
//------
const officialRoutes = require("./official-routes");
const settingsRoutes = require("./settings-routes");
//------

module.exports = function (app) {
  app.use(express.json());

  //------
  app.use("/api/auth", auth);
  app.use("/api/filemanager", filemanager);
  app.use("/api/global/modules", modules);
  app.use("/api/global/accesses", accesses);
  //------
  officialRoutes(app);
  settingsRoutes(app);
  //------
  let dir = "./uploaded-files/";
  app.use("/static/", express.static(dir));
};
