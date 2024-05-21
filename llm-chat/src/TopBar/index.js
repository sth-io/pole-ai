import React from "react";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import FilePresentRoundedIcon from "@mui/icons-material/FilePresentRounded";
import VideoFileRoundedIcon from "@mui/icons-material/VideoFileRounded";
import { ButtonIcon } from "../LayoutComponents/Button";
import { TopBarContent, TopBarStyled } from "./styled";
import { useChatStore, usePrompt } from "../Chat/chatContext";
import { Favourite } from "../Messages/Favourite";
import Person4OutlinedIcon from "@mui/icons-material/Person4Outlined";
import SourceOutlinedIcon from "@mui/icons-material/SourceOutlined";
import { Chip, Stack } from "@mui/material";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";

const ChatStatus = () => {
  const { file, setFile } = usePrompt(({ file, setFile }) => ({
    file,
    setFile,
  }));
  const {
    persona,
    personas,
    setPersona,
    collection,
    setCollection,
    options,
    setOptions,
  } = useChatStore(
    ({
      persona,
      personas,
      setPersona,
      collection,
      setCollection,
      options,
      setOptions,
    }) => ({
      persona,
      personas,
      setPersona,
      collection,
      setCollection,
      options,
      setOptions,
    })
  );
  const hasPersona = personas.find((p) => p.title === persona);

  const statuses = [];

  if (hasPersona) {
    statuses.push({
      name: "persona",
      icon: <Person4OutlinedIcon />,
      content: hasPersona.title,
      action: () => setPersona(""),
    });
  }
  if (collection) {
    statuses.push({
      name: "collection",
      icon: <SourceOutlinedIcon />,
      content: collection,
      action: () => setCollection(""),
    });
  }
  if (Object.keys(options).length > 0) {
    statuses.push({
      name: "options",
      icon: <TuneRoundedIcon />,
      content: "model tuned",
      action: () => setOptions(),
    });
  }
  if (Object.keys(file).length > 0) {
    statuses.push({
      name: "file",
      icon: file.images ? <VideoFileRoundedIcon /> : <FilePresentRoundedIcon />,
      content: `${file.images ? 'image' : 'text'}: ${file.name}`,
      action: () => setFile({}),
    });
  }

  return (
    <Stack direction="row" spacing={1}>
      {statuses.map((status) => (
        <Chip
          key={status.name}
          color="secondary"
          icon={status.icon}
          label={status.content}
          onDelete={() => status.action()}
        />
      ))}
    </Stack>
  );
};

export const TopBar = ({ setMenuOpen, menuOpen }) => {
  const { newChat } = useChatStore(({ newChat }) => ({
    newChat,
  }));

  return (
    <TopBarStyled>
      <TopBarContent>
        <div style={{ display: "flex" }}>
          <ButtonIcon
            sx={{ flex: 1, display: { md: "none" } }}
            color="secondary"
            transparent
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <MenuRoundedIcon />
          </ButtonIcon>

          <ChatStatus />
        </div>

        <div style={{ display: "flex" }}>
          <Favourite />

          <ButtonIcon
            transparent="true"
            onClick={() => newChat()}
            color="secondary"
          >
            <AddCircleOutlineRoundedIcon />
          </ButtonIcon>
        </div>
      </TopBarContent>
    </TopBarStyled>
  );
};
