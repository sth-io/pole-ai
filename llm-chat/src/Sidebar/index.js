import React, { useState } from "react";
import FileList from "../Files";
import { MessageList } from "../Messages/list";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TuneIcon from "@mui/icons-material/Tune";
import Person4OutlinedIcon from "@mui/icons-material/Person4Outlined";
import SourceOutlinedIcon from "@mui/icons-material/SourceOutlined";
import MessageOutlinedIcon from "@mui/icons-material/MessageOutlined";

import { Box } from "@mui/material";
import { ModelPicker } from "../ModelPicker";
import { ModelTuner } from "../ModelTuner";
import { useChatStore } from "../Chat/chatContext";
import Personas from "../Personas";
import { trimText } from "../utils/text";
import { colors } from "../LayoutComponents/theme";
import packagejson from "../../package.json";
import { SystemSettings } from "../System/systemSettings";

const Sidebar = () => {
  const {
    model,
    setModel,
    models,
    getModels,
    collection,
    options,
    setOptions,
  } = useChatStore(
    ({
      model,
      setModel,
      models,
      getModels,
      collection,
      options,
      setOptions,
    }) => ({
      model,
      setModel,
      models,
      getModels,
      collection,
      options,
      setOptions,
    })
  );
  const [panels, setPanels] = useState({
    model: false,
    files: false,
    history: false,
    tuner: false,
  });

  const panelSetter = (name) => {
    const newPanels = { ...panels };
    newPanels[name] = !panels[name];
    setPanels(newPanels);
  };

  return (
    <Box
      gap={4}
      sx={{
        boxSizing: "border-box",
        padding: "40px 5px 40px 10px",
        width: "385px",
      }}
    >
      <p style={{ fontSize: 18, color: colors.base, margin: "0" }}>
        <span style={{ fontWeight: "bold" }}>pole</span>{" "}
        <span style={{ color: colors.secondary }}>assistant</span>
      </p>
      <p style={{ color: colors.secondary, margin: "0 0 20px", fontSize: 12 }}>
        v{packagejson.version}
      </p>
      <Accordion onChange={() => panelSetter("model")} sx={{ p: "10px" }}>
        <ModelPicker
          getModels={getModels}
          models={models}
          setModel={setModel}
          model={model}
          trigger={true}
          options={options}
          setOptions={setOptions}
        />
      </Accordion>
      <Accordion onChange={() => panelSetter("tuner")}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <TuneIcon sx={{ m: "0 10px 0 0" }} fontSize="small" />
          {`Model tune`}
        </AccordionSummary>
        <AccordionDetails>
          <ModelTuner
            model={model}
            trigger={panels.tuner}
            options={options}
            setOptions={setOptions}
          />
        </AccordionDetails>
      </Accordion>
      <Accordion onChange={() => panelSetter("tuner")}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Person4OutlinedIcon sx={{ m: "0 10px 0 0" }} fontSize="small" />
          {`Manage Personas`}
        </AccordionSummary>
        <AccordionDetails>
          <Personas />
        </AccordionDetails>
      </Accordion>
      <Accordion onChange={() => panelSetter("files")}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <SourceOutlinedIcon sx={{ m: "0 10px 0 0" }} fontSize="small" />
          {collection ? `Files: ` : `Select files`}
          <b>{trimText(collection, 30)}</b>
        </AccordionSummary>
        <AccordionDetails>
          <FileList trigger={panels.files} />
        </AccordionDetails>
      </Accordion>
      <Accordion onChange={() => panelSetter("history")}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <MessageOutlinedIcon sx={{ m: "0 10px 0 0" }} fontSize="small" />
          Chat history
        </AccordionSummary>
        <AccordionDetails>
          <MessageList trigger={panels.history} />
        </AccordionDetails>
      </Accordion>
      {/* <SystemSettings /> */}
    </Box>
  );
};

export default Sidebar;
