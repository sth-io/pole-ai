import fs from "fs-extra";
import { mkdir } from "node:fs";
import path, { resolve } from "path";
import { askOllama } from "./ollama";
import { prompts } from "./prompts";
import { Severity, log } from "../utils/logging";
import PQueue from "p-queue";
import eventBus from "./eventBus";
const __dirname = resolve(".");

const QueueMap = new Map();

const STORES_DEFAULT = {
  db: "../db",
  system: "../db/storage",
  messages: "../db/messages",
  tmp: "../db/tmp",
  uploads: "../db/uploads",
};

export const STORAGES = () => {
  return {
    db: "../db",
    system: "../db/storage",
    messages: "../db/messages",
    tmp: "../db/tmp",
    uploads: "../db/uploads",
    indexing: "../db/indexing",
  };
};

export const FILES = () => {
  return [
    { path: `${STORAGES().system}/history.json`, initValue: `[]` },
    { path: `${STORAGES().system}/personas.json`, initValue: `[]` },
    { path: `${STORAGES().system}/tags.json`, initValue: `[]` },
  ];
};

/**
 * Initialises required directories if they don't exist
 */
export const InitStore = async () => {
  const directories = Object.values(STORAGES());
  directories.forEach((dir, i) => {
    const fullPath = path.resolve(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
      mkdir(fullPath, { recursive: true }, (err) => {
        if (err) throw err;
      });
    }
  });

  FILES().forEach((file) => {
    const fullPath = path.resolve(__dirname, file.path);
    if (!fs.existsSync(fullPath)) {
      createFile(fullPath, file.initValue);
    }
  });
};

/**
 * Adds new element to array + if file doesn't exist call LLM for desription
 * @param filePath
 * @param data
 * @param model
 */
export function appendFile(filePath: string, data, model, cb?) {
  makeQueue(filePath);
  const queue = QueueMap.get(filePath);
  const write = () =>
    new Promise((res, rej) => {
      if (fs.existsSync(filePath)) {
        // existing chat conversation
        fs.readFile(filePath, "utf8", (err, dataFromFile) => {
          if (err) {
            log(Severity.error, "appendFile", `${JSON.stringify(err)}`);
          } else {
            const mergedData = [...JSON.parse(dataFromFile), data];
            if (cb) {
              cb(mergedData);
            }
            fs.writeFile(
              filePath,
              JSON.stringify(mergedData),
              "utf8",
              (err) => {
                if (err) {
                  log(Severity.error, "appendFile", `${JSON.stringify(err)}`);
                }

                res("ok");
              }
            );
          }
        });
      } else {
        // new chat convesation
        fs.writeFile(filePath, JSON.stringify([data]), async (err) => {
          if (err) {
            log(Severity.error, "appendFile", `${JSON.stringify(err)}`);
          } else {
            if (model) {
              await addDescription(data, data.chatId, model);
              res("ok");
            }
          }
        });
      }
    });

  queue.add(() => write());
  queue.onIdle().then(() => {
    QueueMap.delete(filePath); // Remove the queue from the map when idle
  });
}

export const AddMessage = async (message, model, cb = () => {}) => {
  const filePath = `${STORAGES().messages}/${message.chatId}.json`;
  const fullPath = path.resolve(__dirname, filePath);
  await appendFile(fullPath, message, model, cb);
};

export const ListMessages = () => {
  const filePath = `${STORAGES().system}/history.json`;
  const fullPath = path.resolve(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    return [];
  } else {
    const data = fs.readFileSync(fullPath, "utf-8");
    return JSON.parse(data).sort(
      (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
    );
  }
};

/**
 * Toggle chat as favourite
 * @param chatId
 */
export const toggleFav = async (chatId: string) => {
  try {
    const filePath = `${STORAGES().system}/history.json`;
    const cb = (data) => {
      eventBus.emit("update_history", { message: data });
    };
    await editElement(filePath, "chatId", chatId, "favourite", null, true, cb);
  } catch (e) {
    log(Severity.error, "toggleFav", e.message);
  }
};

export const addDescription = async (message, chatId, model) => {
  try {
    const filePath = `${STORAGES().system}/history.json`;
    const fullPath = path.resolve(__dirname, filePath);
    const data = fs.readFileSync(fullPath, "utf-8");
    const exists = JSON.parse(data).find((elem) => elem.chatId === chatId);
    if (exists) {
      return;
    }
    const prompt = prompts.ask_for_description(message.content);
    const title = await askOllama(prompt, model);
    appendFile(
      fullPath,
      { title, chatId, timestamp: Date.now() },
      false,
      () => {}
    );
  } catch (e) {
    log(Severity.error, "toggleFav", e.message);
  }
};

export const GetFile = (path: string, fallback: unknown = "") => {
  if (fs.existsSync(path)) {
    const contents = fs.readFileSync(path, "utf-8");
    return contents;
  } else {
    log(Severity.error, "GetFile", `file ${path} not found`);
    return fallback;
  }
};

export const RetrieveConversation = (hash) => {
  if (!hash) {
    throw new Error("Chat id is required");
  }
  const filePath = `${STORAGES().messages}/${hash}.json`;
  const fullPath = path.resolve(__dirname, filePath);
  return GetFile(fullPath, "[]") as string;
};

/**
 * Lists all files inside directory recursively
 * @param filePath
 * @param excludedDirs
 * @returns array of paths
 */
export const getAllFilesInDir = (
  filePath: string,
  excludedDirs: string[] = []
): string[] => {
  function listFilesSync(directoryPath, fileList = []) {
    const files = fs.readdirSync(directoryPath);

    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        if (!excludedDirs.includes(file)) {
          listFilesSync(filePath, fileList);
        }
      } else {
        const exts = ["md", "js", "jsx", "ts", "tsx", "txt"];
        const ext = path.extname(file);
        if (exts.includes(ext.replace(".", ""))) fileList.push(filePath);
      }
    }

    return fileList;
  }

  const files = listFilesSync(filePath);

  return files;
};

const makeQueue = (path) => {
  const queue = QueueMap.get(path);
  if (!queue) {
    const queue = new PQueue({ concurrency: 1 }); // Limit concurrency to 1 for each file
    QueueMap.set(path, queue);
  }
};
/**
 * Edit element in an array inside file
 * @param filePath
 * @param matchKey
 * @param matchValue
 * @param changeKey if this key is not provided, the whole object is replaced!
 * @param changeValue
 * @param toggle
 */
export const editElement = (
  filePath: string,
  matchKey: string,
  matchValue: unknown,
  changeKey: string,
  changeValue: unknown,
  toggle?: boolean,
  cb = (data: unknown) => {}
) => {
  makeQueue(filePath);
  const queue = QueueMap.get(filePath);
  const write = () =>
    new Promise((res, rej) => {
      try {
        const fullPath = path.resolve(__dirname, filePath);
        const data = fs.readFileSync(fullPath, "utf-8");
        if (!data) {
          throw new Error(`[edit element] there's no data!`);
        }

        const parsedData = JSON.parse(data);
        const index = parsedData.findIndex(
          (elem) => elem[matchKey] === matchValue
        );

        if (index < 0) {
          throw new Error(
            `[edit element] element matching [${matchKey}=${matchValue}] does not exist`
          );
        }

        // if key is not provided we'll replace whole object
        parsedData[index] =
          changeKey === null
            ? changeValue
            : {
                ...parsedData[index],
                [changeKey]: toggle
                  ? !parsedData[index][changeKey]
                  : changeValue,
              };
        if (cb) {
          cb(parsedData);
        }
        fs.writeFile(fullPath, JSON.stringify(parsedData), "utf8", (err) => {
          if (err) {
            throw new Error(`[edit element] failed. Trace: ${err.message}`);
          } else {
            log(Severity.debug, "editElement", `${filePath} success`);
          }
          res("ok");
        });
      } catch (e) {
        log(Severity.error, "editElement", e.message);
      }
    });

  queue.add(() => write());
  queue.onIdle().then(() => {
    QueueMap.delete(filePath); // Remove the queue from the map when idle
  });
};

export const AddTag = async (tag) => {
  const filePath = `${STORAGES().system}/tags.json`;
  const fullPath = path.resolve(__dirname, filePath);
  const cb = (data) => {
    eventBus.emit("tags", { message: data });
  };
  await appendFile(fullPath, tag, undefined, cb);
};

export const RemoveTag = async (tag) => {
  const filePath = `${STORAGES().system}/tags.json`;
  const fullPath = path.resolve(__dirname, filePath);
  const cb = (data) => {
    eventBus.emit("tags", { message: data });
  };
  await removeElement(fullPath, "tag", tag, cb);
};

/**
 * Removes element that matches the criteria
 * @param path file path to look for element
 * @param elementKey key in object for matching criteria
 * @param elementValue value for elementKey for matching criteria
 */
export const removeElement = (
  filePath: string,
  matchKey: string,
  matchValue: unknown,
  cb?: (data: unknown) => void
) => {
  makeQueue(filePath);
  const queue = QueueMap.get(filePath);
  const write = () => {
    return new Promise((res, rej) => {
      try {
        const fullPath = path.resolve(__dirname, filePath);
        const data = fs.readFileSync(fullPath, "utf-8");
        if (!data) {
          throw new Error(`[edit element] file does not exist`);
        }

        const filtered = JSON.parse(data).filter(
          (elem) => elem[matchKey] !== matchValue
        );
        if (cb) {
          cb(filtered);
        }
        fs.writeFile(fullPath, JSON.stringify(filtered), "utf8", (err) => {
          res("done");
          if (err) {
            log(Severity.error, "removeElement", err.message);
          } else {
            log(
              Severity.info,
              "removeElement",
              `${filePath} [${matchKey}=${matchValue}] removed`
            );
          }
        });
      } catch (e) {
        res("done");
        log(Severity.error, "removeElement", e.message);
      }
    });
  };

  queue.add(() => write());
  queue.onIdle().then(() => {
    QueueMap.delete(filePath); // Remove the queue from the map when idle
  });
};

export const removeFile = (filePath: string) => {
  const fullPath = path.resolve(__dirname, filePath);
  fs.unlink(fullPath, (err) => {
    if (err) {
      log(Severity.error, "removeFile", err.message);
    } else {
      log(Severity.info, "removeFile", `${fullPath} removed`);
    }
  });
};

/**
 * Removes all files in path
 * @param path
 */
export const cleanDir = (path: string) => {
  const files = fs.readdirSync(path);
  files.forEach((file) => {
    fs.unlink(`${path}/${file}`, (err) => {
      if (err) {
        log(Severity.error, "cleanDir", err.message);
      } else {
        log(Severity.info, "cleanDir", `${path}/${file} removed`);
      }
    });
  });
};

/**
 * Create or overwrite a file at the given path.
 *
 * @param   {string} filePath - Path to the file you want to create
 * @param   {string|Buffer} data - Data to write to the file
 * @param   {string} encoding - Encoding of the data (defaults to 'utf8')
 */
export const createFile = (filePath: string, data: string) => {
  // Validation for filePath
  if (typeof filePath !== "string" || !filePath.length) {
    throw new Error("Invalid file path provided!");
  }

  try {
    fs.ensureFileSync(filePath);
    fs.writeFileSync(filePath, data, "utf-8");

    log(Severity.info, "createFile", filePath);
  } catch (error) {
    log(Severity.error, "createFile", error.message);
  }
};

export const copyFiles = async (sourceDir, destinationDir) => {
  try {
    await fs.copy(sourceDir, destinationDir);
    log(
      Severity.info,
      "copyFiles",
      `${sourceDir} -> ${destinationDir} success`
    );
  } catch (err) {
    log(Severity.error, "copyFiles", err.message);
  }
};
