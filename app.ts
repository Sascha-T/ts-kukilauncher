import {app, BrowserWindow, ipcMain as ipc} from 'electron';
import * as logger from 'signale';

import * as Downloader from "./utils/Downloader";

const log: logger.Signale = logger.scope("Electron", "Init");

let launcher: BrowserWindow = null;

app.on('ready', async () => {
  log.info("Checking Background cache!");
  await Downloader.checkBackgroundFiles();
  let backgrounds: Downloader.DownloadResult = await Downloader.checkBackgroundCache();
  log.info("Loading Window");
  launcher = new BrowserWindow({
    width: 1024,
    height: 600,
    center: true,
    frame: false,
    resizable: false
  });
  launcher['appdata'] = app.getPath("userData");
  launcher['files'] = backgrounds.files;
  launcher['filetype'] = backgrounds.type;
  launcher.loadFile("web/index.html");
});

ipc.on('close', () => {
  launcher.hide();
});
ipc.on('exit', () => {
  launcher.close();
  process.exit(0);
});
ipc.on('minimize', () => {
  launcher.minimize();
});

app.on('window-all-closed', () => {
    app.quit()
});