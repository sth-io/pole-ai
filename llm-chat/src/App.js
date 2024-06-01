import React, { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { ThemeProvider } from "@mui/material/styles";
import Sidebar from "./Sidebar";
import { colors, theme } from "./LayoutComponents/theme";
import { TopBar } from "./TopBar";
import { Prompt } from "./Prompt";
import { Chat } from "./Messages/chat";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import { ButtonSth } from "./LayoutComponents/Button";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { useChatStore } from "./Chat/chatContext";
import { Modal, Paper } from "@mui/material";
import { FlowBuilder } from "./RagFlow";
import { Sockets } from "./Sockets";

const drawerWidth = 400;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

function App() {
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      // Cleanup: Remove the event listener when component unmounts
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Sockets />
      <Box sx={{ display: "flex" }}>
        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flesmhrink: { md: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onTransitionEnd={handleDrawerTransitionEnd}
            onClose={handleDrawerClose}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: "block", sm: "block", md: "none" },
              "& .MuiDrawer-paper": {
                bosmizing: "border-box",
                width: drawerWidth,
                background: "#fff",
              },
            }}
          >
            <ButtonSth
              sx={{ display: { md: "none" } }}
              color="secondary"
              transparent
              onClick={() => handleDrawerClose()}
            >
              <MenuRoundedIcon />
            </ButtonSth>
            <Sidebar />
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "none", md: "block" },
              "& .MuiDrawer-paper": {
                background: 'transparent',
                bosmizing: "border-box",
                width: drawerWidth,
                border: "none",
              },
            }}
            open
          >
            <Sidebar />
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            padding: 0,
            width: { md: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          <TopBar setMenuOpen={handleDrawerToggle} />
          <MainContainer style={{ height: `${windowHeight - 80}px` }}>
            <Chat />
            <Prompt />
          </MainContainer>
        </Box>
      </Box>
      <Modal
        open={false}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
       <FlowBuilder /> 
      </Modal>
    </ThemeProvider>
  );
}

export default App;
