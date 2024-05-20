import path from "path";
import {
  GetFile,
  STORAGES,
  appendFile,
  editElement,
  removeElement,
} from "../interfaces/filestore";

const systemPath = () => {
  const filePath = `${STORAGES().system}/personas.json`;
  const fullPath = path.resolve(__dirname, filePath);
  return fullPath;
};

const addPersona = async (persona) => {
  const file = systemPath();
  await appendFile(file, persona, "");
};

const getPersonas = async () => {
  const file = systemPath();
  const content = GetFile(file, "[]");
  return content;
};

const editPersona = async (name, change: object) => {
  const file = systemPath();

  editElement(file, "title", name, null, change);
};

const deletePersona = async (name) => {
  const file = systemPath();
  removeElement(file, "title", name);
};

export const Persona = () => {
  return {
    add: addPersona,
    get: getPersonas,
    edit: editPersona,
    delete: deletePersona,
  };
};
