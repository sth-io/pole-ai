const { default: axios } = require("axios");
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
let { fork } = require('child_process')
let serverProcess = fork(__dirname + '/build/bundle.js')
serverProcess()

let splashWindow;

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1400,
    height: 800,
    title: "chatSth",
    titleBarOverlay: {
      // color of titile bar
      color: "#3b3b3b",
      // color of titile bar control
      symbolColor: "#74b1be",
      // height of titile bar
      height: 32,
    },
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, "./build/bundle.js"), // add "preload"
    },
  });

  // const startUrl = process.env.ELECTRON_START_URL || url.format({
  //     pathname: path.join(__dirname, '/../build/index.html'),
  //     protocol: 'file:',
  //     slashes: true
  // });
  // win.loadURL(startUrl);
  //load the index.html from a url
  win.loadURL("http://localhost:3001");

  // Open the DevTools.
  //   win.webContents.openDevTools()
}

// Function to check the heartbeat of the background service
function checkBackgroundService(cb) {
  const recurent = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/status");
      console.log(response.status);
      if (response.status === 200) {
        console.log("trigger flip");
        cb();
        splashWindow.close();
      } else {
        setTimeout(recurent, 1000); // Retry after 1 second
      }
    } catch (error) {
      console.log("failed retry", error);
      setTimeout(recurent, 1000); // Retry after 1 second
    }
  };
  recurent();
}

const createSplashWindow = () => {
  splashWindow = new BrowserWindow({
    width: 305,
    height: 205,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
    //   enableRemoteModule: true,
    //   preload: path.join(__dirname, "./build/bundle.js"), // add "preload"
    },
  });
  splashWindow.loadFile("splash.html");
  splashWindow.center();
};

app.whenReady().then(() => {
  createSplashWindow();
  checkBackgroundService(() => {
    createWindow();
  });

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.

    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

ipcMain.on("backgroundServiceLoaded", () => {
  console.log("flipped");
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    title: "chatSth",
    titleBarOverlay: {
      // color of titile bar
      color: "#3b3b3b",
      // color of titile bar control
      symbolColor: "#74b1be",
      // height of titile bar
      height: 32,
    },
    webPreferences: {
      nodeIntegration: true,
    },
  });
  win.loadURL("http://localhost:3001");
  splashWindow.close();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
