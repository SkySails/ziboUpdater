import { app, BrowserWindow } from 'electron';
const {ipcMain} = require('electron');
const {autoUpdater} = require("electron-updater");

autoUpdater.logger = require("electron-log")
autoUpdater.logger.transports.file.level = "info"


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 840,
    height: 850,
    frame: false,
    resizable: false,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
  createWindow()
  autoUpdater.checkForUpdates();

});

autoUpdater.on('update-downloaded', (info) => {
  mainWindow.webContents.send('updateReady', info)
});

ipcMain.on("quitAndInstall", (event, arg) => {
  autoUpdater.quitAndInstall();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('request-mainprocess-action', (event, arg) => {
  
  console.log(Object.keys(arg))
  console.log(Object.values(arg))
  download(arg);
});



// Register the download manager
const DownloadManager = require("electron-download-manager");
DownloadManager.register({downloadFolder: app.getPath("downloads")});;


function download(arg) {
  var arg = arg
  console.log("URL was set to: " + arg.link)
  console.log("Path was NOT SET!", arg.path)
  console.log("Download folder was set to: " + arg.folder)
  console.log("Custom filename was set to: " + arg.customFileName)
  DownloadManager.download({
    url: arg.link,
    downloadFolder: arg.folder,
    customFileName: arg.customFileName,
    onProgress: (progress, item) => {
      mainWindow.webContents.send('downloadProgress', progress, arg.customFileName);
    }
  }, function (error, info) {
      if (error) {
          console.error(error)
          return;
      }

      console.log("ALL FILES DONE: " + info.filePath)
  });
}

ipcMain.on('download-all', (event, data) => {

  DownloadManager.download({
    url: data.list[0].link,
    downloadFolder: data.folder,
    customFileName: data.list[0].name,
    onProgress: (progress, item) => {
      mainWindow.webContents.send('downloadProgress', progress, data.list[0].name);
    }
  }, function (error, info) {
      if (error) {
          console.error(error)
          return;
      }

      console.log("ALL FILES DONE: " + info.filePath)
      data.list.shift()
      var remaining = data
      mainWindow.webContents.send('remaining-download', data);
  });

});
