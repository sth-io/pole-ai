import fs from "fs";
import { ChromaModel } from "../interfaces/chroma";
import path from "path";
import axios from "axios";
import * as splitter from "langchain/text_splitter";
import {
  AddMessage,
  STORAGES,
  cleanDir,
  copyFiles,
  getAllFilesInDir,
} from "../interfaces/filestore";

const defaultExtensions = ["md", "js", "txt", "ts"].map((elem) => `.${elem}`);

/**
 * Checks if a given file path corresponds to a supported file format based on the provided extensions list.
 * @param {string} filePath - The absolute or relative file path to be checked.
 * @param {Array.<string>} supportedExtensions - An array containing file extension strings that are considered supported.
 * @returns boolean value indicating whether the provided file path matches an entry in the list of supported extensions.
 */
const isSupportedFile = (filePath, supportedExtensions) => {
  const exists = fs.existsSync(filePath);
  const isFile = exists && fs.statSync(filePath).isFile();
  const isSupported =
    isFile && supportedExtensions.includes(path.extname(filePath));

  return isSupported;
};

const excluded_dirs = [
  "node_modules",
  ".git",
  "dist",
  "cypress",
  ".vscode",
  ".husky",
  "coverage",
  "jest",
];

/**
 * Asynchronously vectorizes all supported files in a given directory, processing them with the specified collection, model, and extensions.
 *
 * @param {string} pathUrl - The URL to the target directory for file extraction.
 * @param {string} [collection="llm-chat"] - Optional collection name used during vectorization (default: "llm-chat").
 * @param {Function} model - Model function responsible for processing files (should be an async function).
 * @param {Object.<string, any>} [extensions={}] - Extension object containing file extensions and their supported formats.
 * @returns {Promise<void>|string> A Promise resolving to a string indicating completion ("done"), or logs "all files processed" upon successful processing of all files.
 */
export const vectorizeDirectory = async (
  pathUrl,
  collection = "llm-chat",
  model,
  extensions = defaultExtensions
) => {
  const files = getAllFilesInDir(pathUrl, excluded_dirs).filter((elem) =>
    isSupportedFile(elem, extensions)
  );
  console.log(`[vectorize] found ${files.length} files`);
  const fileCalls = files.map(
    (path) => async () =>
      await vectorizeFile(path, collection, model, extensions)
  );
  let idx = 1;
  for (const fileCall of fileCalls) {
    await fileCall();
    console.log(`[vectorize] file ${idx} of ${files.length} done`);
  }
  console.info("[vectorize] all files processed");
  return "done";
};

/** * Exports a `vectorizeFile` that takes in parameters related to file path processing using machine learning vectorization techniques.
 * This function performs vectorization of a given text file by splitting it into smaller chunks, processing each chunk using a specified model,
 * and adding the processed data back into the collection with unique identifiers for each.
 */
export const vectorizeFile = async (
  pathUrl,
  collection = "llm-chat",
  model,
  extensions = defaultExtensions
) => {
  const Model = ChromaModel(collection, model);
  const fileread = fs.readFileSync(pathUrl, "utf8");

  console.info(`[vectorize] getting metadata for ${pathUrl}`);

  // split file into chunks
  const split = new splitter.RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const documents = await split.createDocuments([fileread]);
  const toChunks = (a, size) => {
    const arrays = [];

    for (let i = 0; i < a.length; i += size) {
      arrays.push(a.slice(i, i + size));
    }
    return arrays;
  };

  const length = documents.length;
  const chunks = length > 10 ? toChunks(documents, 10) : [documents];

  const maped = chunks.map((documentSet, idx) => async () => {
    await Model.addToCollection(
      documentSet.map((doc, i) => {
        console.log(`${pathUrl}:${idx}-${i}`);
        return {
          content: doc.pageContent,
          id: `${pathUrl}:${idx}-${i}`,
          uris: pathUrl,
          metadata: { name: pathUrl },
        };
      })
    );
  });

  const sequence = async (promiseFns) => {
    for (let promiseFn of promiseFns) {
      await promiseFn();
      console.log("chunk done");
    }
  };

  sequence(maped);
};

/**
 * Downloads a file (or website) from the specified URL and saves it with the given filename to a temporary directory.
 *
 * @param {string} url - The URL of the file to be downloaded.
 * @param {string} filename - The desired name for the saved file.
 * @param {() => void} cb - Callback function executed after successful download and saving.
 * @returns {Promise<void>} A promise that resolves when download is complete or rejects on error during process.
 */
const downloadFile = async (
  url: string,
  filename: string,
  cb
): Promise<void> => {
  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream" as "stream",
    });

    if (!fs.existsSync(STORAGES().tmp)) {
      fs.mkdirSync(STORAGES().tmp);
    }
    const writeStream = fs.createWriteStream(`${STORAGES().tmp}/${filename}`);

    response.data.pipe(writeStream);

    response.data.on("end", () => {
      console.log(`File downloaded and saved as ${filename}`);
      writeStream.close();
      cb();
    });
  } catch (error) {
    console.error(`Error during file download: ${error}`);
  }
};

/**
 * Handles file and directory operations based on given path.
 * @param {string} path - The input file or URL path to process.
 * @param {Object} meta - Meta information related to the file/directory.
 * @param {Function} model - Model name for vectorization of files or directories.
 * @param {Response} res - HTTP response object used to send a status update after processing.
 * @returns {Promise} A promise that resolves upon successful handling of the given path.
 */
export const handleIndexPath = async (userPath, meta, model, res) => {
  if (userPath.indexOf("http:") === 0 || userPath.indexOf("https:") === 0) {
    const url = new URL(userPath);
    const fileName = url.pathname.split("/").pop();
    const hasExt = fileName.indexOf(".") > 0;

    console.info(`[index] download ${fileName || meta} from ${path}`);
    await downloadFile(
      userPath,
      `${fileName || meta}${hasExt ? "" : ".txt"}`,
      async () => {
        const tmp = path.resolve(__dirname, `${STORAGES().tmp}/`);
        await vectorizeDirectory(tmp, meta, model);
        cleanDir(tmp);
      }
    );
  } else {
    const target = `${STORAGES().indexing}/${meta}`;
    const fullTarget = path.resolve(__dirname, target);
    await copyFiles(userPath, fullTarget);
    if (fs.lstatSync(userPath).isDirectory()) {
      console.info(`[index] initialising directory`);
      await vectorizeDirectory(fullTarget, meta, model);
    } else {
      console.info("[index] initialising file");
      await vectorizeFile(fullTarget, meta, model);
    }
  }
  res.send("done");
};

/**
 * Create a conversation with given ID, history of messages, and chat model.
 * this function appends your messages to the message store
 */
export const createConversation = (id, history, model) => {
  const messages = history.map(
    (elem) => () => AddMessage({ ...elem, chatId: id }, model)
  );
  messages.reduce((p, fn) => p.then(fn), Promise.resolve());
};
