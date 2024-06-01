import React, { useRef, useState } from "react";
import FileUploadRoundedIcon from "@mui/icons-material/FileUploadRounded";
import FilePresentRoundedIcon from "@mui/icons-material/FilePresentRounded";
import VideoFileRoundedIcon from "@mui/icons-material/VideoFileRounded";
import { ButtonIcon } from "../LayoutComponents/Button";
import { ScrollToBottom } from "./styled";
import { usePrompt } from "../Chat/chatContext";

const parseImage = async (file) => {
  const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/bmp"];
  const isImage =
    typeof file.type === "string" && validImageTypes.includes(file.type);
  if (!isImage) {
    return null;
  }
  const contentPromise = new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = function () {
      if (reader.result) {
        resolve(reader.result.split(",")[1]);
      } else {
        reject("Failed to load the file content");
      }
    };

    reader.readAsDataURL(file); // Read the file as text
  });

  try {
    const content = await contentPromise;
    return content;
  } catch (error) {
    return null;
  }
};

const parseText = async (file) => {
  // Check if there's an uploaded file and it is a .txt or .md file
  if (!file || !/^.*\.(txt|md)$/.test(file.name)) {
    return null;
  }
  const contentPromise = new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = function () {
      if (reader.result) {
        resolve(reader.result);
      } else {
        reject("Failed to load the file content");
      }
    };

    reader.readAsText(file); // Read the file as text
  });

  try {
    const content = await contentPromise;
    return content;
  } catch (error) {
    return null;
  }
};

export const FileUploadComponent = () => {
  const ref = useRef(null);
  const { file, setFile } = usePrompt(({ file, setFile }) => ({
    file,
    setFile,
  }));

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const image = await parseImage(file);
      const text = await parseText(file);
      const result =
        (image && { images: [image], name: file.name }) ||
        (text && { context: text, name: file.name }) ||
        {};

      setFile(result);
    }
  };

  return (
    <>
      <ButtonIcon
        sx={{
          m: "0 0 22px 10px",
        }}
        onClick={() => ref.current?.click()}
        transparent
        size="small"
      >
        {file.context && <FilePresentRoundedIcon />}
        {file.images && <VideoFileRoundedIcon />}
        {!(file.context || file.images) && <FileUploadRoundedIcon />}
      </ButtonIcon>
      <input
        ref={ref}
        type="file"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </>
  );
};
