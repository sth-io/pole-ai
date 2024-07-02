import path, { resolve } from "path";
import { GetFile, STORAGES } from "../interfaces/filestore";
const __dirname = resolve(".");

const systemPath = () => {
  const filePath = `${STORAGES().system}/tags.json`;
  const fullPath = path.resolve(__dirname, filePath);
  return fullPath;
};

const getTags = async () => {
  const file = systemPath();
  const content = GetFile(file, "[]");
  return content;
};

export const Tags = () => {
  return {
    get: getTags,
  };
};
