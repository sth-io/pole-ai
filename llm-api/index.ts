import { createConversation, handleIndexPath } from "./src/api/files";
import { config } from "./src/config";
import { ChromaModel } from "./src/interfaces/chroma";
import {
  InitStore,
  ListMessages,
  RetrieveConversation,
  STORAGES,
  cleanDir,
  toggleFav,
} from "./src/interfaces/filestore";
import { getMeta, getModels, streamingChat } from "./src/interfaces/ollama";
import cors from "cors";
import path from "path";
import multer from "multer";
import { Persona } from "./src/api/Personas";
import { Messages } from "./src/api/Messages";

console.log("[sys] initialising directories");
InitStore();

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.resolve(__dirname, STORAGES().uploads)); // Specify the upload folder here
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + "-" + file.originalname); // Use a unique filename
  },
});

const upload = multer({ storage: storage });

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const server = require("http").Server(app);
const port = config.server.port;
const helmet = require("helmet");

app.use(cors());

app.use(helmet());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

// //pre-flight requests
// app.options("*", function (req, res) {
//   res.send(200);
// });

app.post("/api/meta", async (req, res) => {
  res.header("Cache-Control", "no-cache");
  res.status(200);
  try {
    const response = await getMeta(req.body, res);
    res.send(response.res);
  } catch (e) {
    console.log("failed", e.message);
  }
});

app.post("/api/personas", async (req, res) => {
  if (req.body.title && req.body.content) {
    await Persona().add({ title: req.body.title, content: req.body.content });
    res.status(201);
    res.end();
  } else {
    res.status(500);
    res.end();
  }
});

app.put("/api/personas/:title", async (req, res) => {
  await Persona().edit(req.params.title, req.body);
  res.status(201);
  res.end();
});

app.delete("/api/personas/:title", async (req, res) => {
  await Persona().delete(req.params.title);
  res.status(201);
  res.end();
});

app.get("/api/personas", async (req, res) => {
  const Personas = await Persona().get();
  res.send(Personas);
});

app.post("/api/chat", async (req, res) => {
  res.header("Cache-Control", "no-cache");
  res.header("Content-Type", "text/event-stream");

  res.status(200);
  try {
    await streamingChat(req.body, res);
  } catch (e) {
    console.log("failed", e.message);
  }
});

app.post("/api/index/upload", upload.any(), async (req, res) => {
  console.log(req.files); // Here are your uploaded files
  const filesData = [];

  // req.files contains all the uploaded files
  req.files.forEach((file) => {
    filesData.push({
      fieldname: file.fieldname,
      filename: file.filename,
    });
  });
  const filePath = path.resolve(__dirname, STORAGES().uploads);

  await handleIndexPath(filePath, req.body.meta, req.body.model, res);
  await cleanDir(filePath);
});

app.post("/api/index/path", async (req, res) => {
  if (req.body.path && req.body.model && req.body.meta) {
    handleIndexPath(req.body.path, req.body.meta, req.body.model, res);
  } else {
    res.status(500);
    res.end();
  }
});

app.get("/api/index/list", async (req, res) => {
  const model = ChromaModel();
  const collections = await model.listCollections();
  res.send(collections);
});

// { collection: 'chroma collection name', model: 'embed model name', query: 'user query' }
app.post("/api/index/query", async (req, res) => {
  try {
    res.header("Cache-Control", "no-cache");
    const model = ChromaModel(req.body.collection, req.body.model);
    console.log("query start");
    const collections = await model.query(req.body.query);
    console.log("query end");
    res.send(collections);
  } catch (e) {
    console.log(e);
  }
});

app.delete("/api/index/:name", async (req, res) => {
  try {
    const model = ChromaModel(req.params.name);
    await model.remove();
    res.status(200);
    res.send({ status: "done" });
  } catch (e) {
    res.status(409);
    res.send({ status: "error", error: e });
  }
});

app.get("/api/model/list", async (req, res) => {
  await getModels(res);
});

app.post("/api/messages/create/:id", async (req, res) => {
  try {
    await Messages().createHistory(
      req.params.id,
      req.body.messages,
      req.body.model
    );
    res.status(201);
    res.send({ status: "done" });
  } catch (e) {
    res.status(409);
    res.send({ status: "error", error: e });
  }
});

app.get("/api/messages/list", async (req, res) => {
  const messages = ListMessages();
  res.send(messages);
});

app.post("/api/messages/fav", async (req, res) => {
  const chatId = req.body.chatId;
  try {
    toggleFav(chatId);
    res.send("OK");
  } catch (e) {
    console.log("e", e.message);
    res.send({ error: e.message });
  }
});

app.delete("/api/messages/:id", async (req, res) => {
  try {
    Messages().delete(req.params.id);
    res.status(200);
    res.send("OK");
  } catch (e) {
    console.log("e", e.message);
    res.send({ error: e.message });
  }
});

app.get("/api/messages/:id", async (req, res) => {
  try {
    console.log(req.params);
    const messages = RetrieveConversation(req.params.id);
    res.send(messages);
  } catch (e) {
    console.log("e", e.message);
    res.send({ error: e.message });
  }
});

app.get("/api/status", (req, res) => {
  res.status(200);
  res.send("ok");
});

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, "./frontend")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./frontend", "index.html"));
});

server.listen(port, (err) => {
  if (err) {
    throw err;
  }
  /* eslint-disable no-console */
  console.log(`
  [sthai] server working
  [port] ${port}
`);
});

module.exports = server;
