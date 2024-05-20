import React, { useState } from "react";
import { Box, Modal, Tab, Tabs, Typography } from "@mui/material";
import { ButtonSth } from "../LayoutComponents/Button";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";
import PermMediaRoundedIcon from "@mui/icons-material/PermMediaRounded";
import HttpRoundedIcon from "@mui/icons-material/HttpRounded";
import { StorageSettings } from "./storage";
import { APISettings } from "./apiSettings";
import { colors } from "../LayoutComponents/theme";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  maxWidth: "90%",
  boxShadow: 24,
  borderRadius: 2,
  border: `4px solid ${colors.base}`
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export const SystemSettings = () => {
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);

  return (
    <>
      <ButtonSth
        sx={{ flex: 1, margin: "20px auto 0 auto" }}
        color="secondary"
        startIcon={<SettingsSuggestRoundedIcon />}
        onClick={() => setOpen(true)}
      >
        system settings
      </ButtonSth>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Box
            sx={{
              flexGrow: 1,
              bgcolor: "background.paper",
              display: "flex",
              borderRadius: 1,
              minHeight: 500
            }}
          >
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={tab}
              onChange={(e, value) => setTab(value)}
              aria-label="Vertical tabs example"
              sx={{
                borderRight: 1,
                borderColor: "divider",
                background: "#000",
              }}
            >
              <Tab
                icon={<PermMediaRoundedIcon />}
                iconPosition="start"
                label="Storage"
                sx={{ color: "#FFF" }}
                {...a11yProps(0)}
              />
              <Tab
                icon={<HttpRoundedIcon />}
                iconPosition="start"
                sx={{ color: "#FFF" }}
                label="APIs"
                {...a11yProps(1)}
              />
            </Tabs>
            <TabPanel value={tab} index={0}>
              <StorageSettings />
            </TabPanel>
            <TabPanel value={tab} index={1}>
              <APISettings />
            </TabPanel>
          </Box>
        </Box>
      </Modal>
    </>
  );
};
