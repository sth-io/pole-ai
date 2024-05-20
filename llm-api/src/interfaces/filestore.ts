import fs from "fs";
import { mkdir } from "node:fs";
import path from "path";
import { askOllama } from "./ollama";
import { prompts } from "./prompts";

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
  };
};

export const FILES = () => {
  return [
    { path: `${STORAGES().system}/history.json`, initValue: `[]` },
    { path: `${STORAGES().system}/personas.json`, initValue: `[]` },
  ];
};

/**
 * Initialises required directories if they don't exist
 */
export const InitStore = () => {
  const directories = Object.values(STORAGES());
  directories.forEach((dir) => {
    const fullPath = path.resolve(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
      mkdir(fullPath, { recursive: true }, (err) => {
        if (err) throw err;
      });
    }
  });

  FILES().forEach((file) => {
    const fullPath = path.resolve(__dirname, file.path) 
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
export function appendFile(filePath: string, data, model) {
  if (fs.existsSync(filePath)) {
    // existing chat conversation
    fs.readFile(filePath, "utf8", (err, dataFromFile) => {
      if (err) {
        console.log(err);
      } else {
        const mergedData = [...JSON.parse(dataFromFile), data];
        fs.writeFile(filePath, JSON.stringify(mergedData), "utf8", (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("msg saved");
          }
        });
      }
    });
  } else {
    // new chat convesation
    fs.writeFile(filePath, JSON.stringify([data]), async (err) => {
      if (err) {
        console.error(err);
      } else {
        if (model) {
          await addDescription(data, data.chatId, model);
        }
      }
    });
  }
}

export const AddMessage = async (message, model) => {
  const filePath = `${STORAGES().messages}/${message.chatId}.json`;
  const fullPath = path.resolve(__dirname, filePath);
  appendFile(fullPath, message, model);
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
    console.log(filePath);
    editElement(filePath, "chatId", chatId, "favourite", null, true);
  } catch (e) {
    console.log("error", e.message);
  }
};

export const addDescription = async (message, chatId, model) => {
  try {
    const filePath = `${STORAGES().system}/history.json`;
    const fullPath = path.resolve(__dirname, filePath);
    const data = fs.readFileSync(fullPath, "utf-8");
    const exists = JSON.parse(data).find((elem) => elem.chatId === chatId);
    if (exists) {
      console.log("chat exists");
      return;
    }
    console.log("[add description] files ready, asking for description");
    const prompt = prompts.ask_for_description(message.content);
    const title = await askOllama(prompt, model);
    console.log(`[add description] description generated: ${title}`);
    appendFile(fullPath, { title, chatId, timestamp: Date.now() }, false);
  } catch (e) {
    console.log("error", e.message);
  }
};

export const GetFile = (path: string, fallback: unknown = "") => {
  if (fs.existsSync(path)) {
    const contents = fs.readFileSync(path, "utf-8");
    return contents;
  } else {
    console.log(`[sys] file ${path} not found`);
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
  toggle?: boolean
) => {
  try {
    const fullPath = path.resolve(__dirname, filePath);
    const data = fs.readFileSync(fullPath, "utf-8");
    if (!data) {
      throw new Error(`[edit element] there's no data!`);
    }

    const parsedData = JSON.parse(data);
    const index = parsedData.findIndex((elem) => elem[matchKey] === matchValue);

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
            [changeKey]: toggle ? !parsedData[index][changeKey] : changeValue,
          };

    fs.writeFile(fullPath, JSON.stringify(parsedData), "utf8", (err) => {
      if (err) {
        throw new Error(`[edit element] failed. Trace: ${err.message}`);
      } else {
        console.log("[edit element] success");
      }
    });
  } catch (e) {
    console.log("error", e.message);
  }
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
  matchValue: unknown
) => {
  try {
    const fullPath = path.resolve(__dirname, filePath);
    const data = fs.readFileSync(fullPath, "utf-8");
    if (!data) {
      throw new Error(`[edit element] file does not exist`);
    }

    const filtered = JSON.parse(data).filter(
      (elem) => elem[matchKey] !== matchValue
    );
    fs.writeFile(fullPath, JSON.stringify(filtered), "utf8", (err) => {
      if (err) {
        throw new Error(`[remove element] failed. Trace: ${err.message}`);
      } else {
        console.log(`[remove element] [${matchKey}=${matchValue}] success`);
      }
    });
  } catch (e) {
    console.log("error", e.message);
  }
};

export const removeFile = (filePath: string) => {
  const fullPath = path.resolve(__dirname, filePath);
  fs.unlink(fullPath, (err) => {
    if (err) {
      console.error(`[delete file] error: ${err.message}`);
    } else {
      console.log(`[delete file] ${fullPath} removed successfully`);
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
        console.error(`[delete files] error: ${err.message}`);
      } else {
        console.log(`[delete files] in dir: "${path}" successfully`);
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
    fs.writeFileSync(filePath, data, "utf-8");

    console.log(`[create file] file created at: ${filePath}`);
  } catch (error) {
    console.error(`[create file] failed to create file: ${error.message}`);
  }
};
