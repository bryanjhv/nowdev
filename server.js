const fs = require("fs");
const path = require("path");
const express = require("express");
const chokidar = require("chokidar");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// partial ESM support in API files
require = require("esm")(module, {});

let app;
let server;
let watcher;

let reload = false;

function isDir(path) {
  return fs.existsSync(path) && fs.statSync(path).isDirectory();
}

function configureServer() {
  app.disable("x-powered-by");
  app.enable("strict routing");
  app.enable("case sensitive routing");

  app.use(cookieParser());
  app.use(bodyParser.json({ strict: false }));
  app.use(bodyParser.urlencoded({ extended: true }));

  const paths = [];
  if (isDir("api")) {
    paths.push("api");
    serveApi("api");
  }
  if (isDir("public")) {
    paths.push("public");
    serveFiles("public");
  }
  if (paths.length) watchApi(paths);
  else serveFiles(".");
}

function serveFiles(dir) {
  app.use(express.static(dir, { dotfiles: "ignore" }));
}

function serveApi(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      serveApi(full);
    } else {
      try {
        let handler = require(path.resolve(full));
        if (handler.default) handler = handler.default;
        const route = full
          .slice(0, -3)
          .replace(/\/index$/, "")
          .replace(/\[([^\]]+)]/g, (_, p) => `:${p}`);
        app.all(`/${route}`, handler);
      } catch (err) {
        // ignore for now
      }
    }
  });
}

function watchApi(paths) {
  watcher = chokidar.watch(paths, { ignoreInitial: true });
  watcher.on("all", () => {
    console.log("Files changed, reloading...");
    watcher.close().then(() => {
      restartServer(paths.map((p) => path.resolve(p)));
    });
  });
}

function restartServer(paths) {
  reload = true;
  watcher = null;
  clearCache(paths);
  closeServer();
}

function clearCache(paths) {
  Object.keys(require.cache).forEach((id) => {
    for (const path of paths) {
      if (id.startsWith(path)) {
        delete require.cache[id];
      }
    }
  });
}

function startServer() {
  reload = false;
  app = express();
  configureServer();
  listenServer();
}

function bindEvents(remove) {
  const kind = remove ? "off" : "once";
  process[kind]("SIGINT", closeServer);
  process[kind]("SIGTERM", closeServer);
}

function closeServer() {
  bindEvents(true);

  server.close((err) => {
    app = server = null;
    if (reload) return startServer();
    if (err) console.error(err);
    process.exit(err ? 1 : 0);
  });
}

function listenServer() {
  const { PORT = 3333, HOST = "0.0.0.0" } = process.env;
  server = app.listen(PORT, HOST, () => {
    console.log(`Ready at http://${HOST}:${PORT}/`);
    bindEvents();
  });
}

startServer();
