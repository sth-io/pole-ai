import { Server } from "socket.io";
import express from "express";
import bodyParser from "body-parser";
import http from "http";
import helmet from "helmet";
import cors from "cors";
import path, { resolve } from "path";
import multer from "multer";
import { createServer } from "http";
import { handleIndexPath } from "./src/api/files";
import { config } from "./src/config";
import { ChromaModel } from "./src/interfaces/chroma";
import {
  AddTag,
  GetFile,
  InitStore,
  ListMessages,
  RemoveTag,
  RetrieveConversation,
  STORAGES,
  cleanDir,
  editElement,
  removeElement,
  toggleFav,
} from "./src/interfaces/filestore";
import {
  getMeta,
  getModels,
  getUrlData,
  streamingChat,
} from "./src/interfaces/ollama";
import { Persona } from "./src/api/Personas";
import { Messages } from "./src/api/Messages";
import eventBus from "./src/interfaces/eventBus";
import { SearchXng } from "./src/interfaces/searchxng";
import { proxyTTS } from "./src/api/tts";
import { Severity, log } from "./src/utils/logging";
import { Tags } from "./src/api/Tags";

const __dirname = resolve(".");

log(Severity.info, "sys", "initialising directories");
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

const app = express();
const server = new http.Server(app);
const port = config.server.port;
const socketPort = config.server.socketPort;

app.use(cors());

app.use(helmet());
app.use(bodyParser.json({ limit: "50mb" }));
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

app.get("/api/tts", proxyTTS);

app.post("/api/meta", async (req, res) => {
  res.header("Cache-Control", "no-cache");
  res.status(200);
  try {
    const response = await getMeta(req.body, res);
    res.send(response.res);
  } catch (e) {
    log(Severity.error, "api/meta", e.message);
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
    await streamingChat(req.body);
  } catch (e) {
    log(Severity.error, "api/chat", e.message);
  }
});

app.post("/api/index/upload", upload.any(), async (req, res) => {
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

app.post("/api/webcontent", async (req, res) => {
  const resp = await getUrlData(req.body.url, "");
  res.send(resp);
});

app.post("/api/index/path", async (req, res) => {
  if (req.body.path && req.body.model && req.body.meta) {
    handleIndexPath(req.body.path, req.body.meta, req.body.model, res);
  } else {
    res.status(500);
    res.end();
  }
});

app.get("/api/search/:query", async (req, res) => {
  const data = await SearchXng().search("rich");
  res.send(data);
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
    const collections = await model.query(req.body.query);
    res.send(collections);
  } catch (e) {
    log(Severity.error, "/api/index/query", e.message);
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

app.get("/api/tags/list", async (req, res) => {
  const tags = await Tags().get();
  res.send(tags);
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
    await toggleFav(chatId);
    res.send("OK");
  } catch (e) {
    log(Severity.error, "/api/messages/fav", e.message);
    res.send({ error: e.message });
  }
});

app.delete("/api/messages/:id", async (req, res) => {
  try {
    Messages().delete(req.params.id);
  } catch (e) {
    log(Severity.error, `/api/messages/${req.params.id}`, e.message);
    res.send({ error: e.message });
  }
});

app.get("/api/messages/:id", async (req, res) => {
  try {
    const messages = RetrieveConversation(req.params.id);
    res.send(messages);
  } catch (e) {
    log(Severity.error, `/api/messages/${req.params.id}`, e.message);
    res.send({ error: e.message });
  }
});

app.get("/api/status", (req, res) => {
  res.status(200);
  res.send({
    availableServices: {
      ollama: !!process.env.OLLAMA_SERVER,
      web_search: !!process.env.SEARCHXNG_URL,
      chroma: !!process.env.CHROMA_SERVER,
      coqui: !!process.env.COQUI_URL,
    },
  });
});

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, "./frontend")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./frontend", "index.html"));
});

server.listen(port, () => {
  log(Severity.info, "pole", "server working");
  log(Severity.info, "port", `${port}`);
});

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let controllers = {};
eventBus.on("controller", (message) => {
  controllers[message.chatId] = message.controller;
});

eventBus.on("chat:answer", (message) => {
  io.to(message.chatId).emit("chat:answer", message.message);
});

eventBus.on("chat:streaming", (message) => {
  io.to(message.chatId).emit("chat:streaming", message.message);
});

eventBus.on("chat:status", (message) => {
  console.log({ message });
  io.to(message.chatId).emit("chat:status", message.msg);
});

eventBus.on("chat:new", (message) => {
  io.emit("chat:new", message.message);
});

eventBus.on("update_history", (message) => {
  io.emit("update_history", message.message);
});

eventBus.on("error", (message) => {
  if (message.chat) {
    io.to(message.chatId).emit("snack", message.msg);
  } else {
    io.emit("snack", message.msg);
  }
});

eventBus.on("tags", (message) => {
  io.emit("tags", message);
});

io.on("connection", (ws) => {
  ws.emit("snack", { msg: "connected" });
  ws.on("chat:q", (message) => {
    log(Severity.debug, "socket-chat:q", message);
    streamingChat(message);
  });

  ws.on("chat:cancel", (chatId) => {
    const controller = controllers[chatId];
    if (controller) {
      io.to(chatId).emit("chat:streaming", { isStreaming: false });
      controller.abort();
      delete controller[chatId];
    } else {
      log(Severity.error, "socket-chat:cancel", "no chat to cancel");
    }
  });

  ws.on("tags:add", async (tag) => {
    await AddTag(tag);
  });

  ws.on("tags:remove", async (tag) => {
    await RemoveTag(tag.tag);
  });

  ws.on("chat:change", ({ chatId, key, value }) => {
    const filePath = `${STORAGES().system}/history.json`;
    const cb = (data) => {
      eventBus.emit("update_history", { message: data });
    };
    editElement(filePath, "chatId", chatId, key, value, undefined, cb);
  });

  ws.on("join", (chatId) => {
    log(Severity.info, "socket-join", chatId);
    ws.join(chatId);
  });
  ws.on("leave", (chatId) => {
    log(Severity.info, "socket-leave", chatId);
    ws.leave(chatId);
  });

  ws.on("message:toggle", ({ chatId, element, value }) => {
    const filePath = `${STORAGES().messages}/${chatId}.json`;
    const cb = (data) => {
      eventBus.emit("update_history", { message: data });
    };
    editElement(filePath, "stamp", element, "filtered", value, undefined, cb);
  });
});

io.listen(socketPort as number);
log(Severity.info, "socket port", `${socketPort}`);

// emit("message:toggle", {
//   chatId: get().chatId,
//   element: msg.timestamp,
//   value: !msg.filtered,
// })
