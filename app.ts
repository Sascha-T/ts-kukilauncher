import {app, BrowserWindow, ipcMain as ipc} from 'electron';
import * as logger from 'signale';
import * as jfs from 'fs-jetpack';

import * as Downloader from "./utils/Downloader";

const log: logger.Signale = logger.scope("Electron", "Init");

const fs = jfs.cwd(app.getPath("userData"));

let launcher: BrowserWindow = null;
let settings: BrowserWindow = null;

app.on('ready', async () => {
    log.info("Checking Background files!");
    await Downloader.checkBackgroundFiles();
    log.info("Checking Background cache!");
    let backgrounds: Downloader.DownloadResult = await Downloader.checkBackgroundCache();
    log.info("Checking Config");
    await checkConfig();
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
ipc.on('settings', (_, mods) => {
    settings = new BrowserWindow({
        width: 370,
        height: 500,
        center: true,
        frame: false,
        resizable: false
    });

    if(!app)
        process.exit(0);

    settings['appdata'] = app.getPath("userData");
    settings["mods"] = mods;
    settings.loadFile("web/settings.html");
    settings.show();
});
ipc.on('close-s', () => {
    settings.close();
    // Can you not relaunch. Please?
});

app.on('window-all-closed', () => {
    app.quit()
});

async function checkConfig(): Promise<void> {
    let dconf: object = require('./defaultconfig.json') || {};
    let conf: object = await fs.readAsync('.config', 'json') || {};
    let eq: string = JSON.stringify(conf);
    let keys: string[] = Object.keys(dconf);
    log.info(conf);
    for(let i = 0; i < keys.length; i++) {
        let key: string = keys[i];
        if(!conf.hasOwnProperty(key))
            conf[key] = dconf[key];
    }
    log.info(conf);
    if(JSON.stringify(conf) !== eq) {
        await fs.removeAsync('.config');
        await fs.writeAsync('.config', JSON.stringify(conf, null, 4));
    }
}