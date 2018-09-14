import { app, BrowserWindow, Event, dialog, ipcMain as ipc } from 'electron';
import * as progress from 'request-progress';
import * as request from 'request';
import * as logger from 'signale';
import * as fetch from 'node-fetch';
import * as path from 'path';
import * as mkd from 'mkdirp';
import * as jfs from 'fs-jetpack';
import * as fs from 'fs';

import * as ProgressBar from 'electron-progressbar';

import * as magnitude from './utils/Magnitude';

const bgcache = path.join(app.getPath("userData"), "background-cache");

const xfs = jfs.cwd(app.getPath("userData"));

const log: logger.Signale = logger.scope("Electron", "Init");

let launcher: BrowserWindow = null;

app.on('ready', async () => {
  log.info("Checking Background cache!");
  await checkBackgroundCache();
  log.info("Loading Window");
  launcher = new BrowserWindow({
    width: 1024,
    height: 600,
    center: true,
    frame: false,
    resizable: false
  });
  launcher['appdata'] = app.getPath("userData");
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

async function checkBackgroundCache() {
  mkd(bgcache);

  let cx = await xfs.existsAsync("202V.cache");
  let cy = await xfs.existsAsync("202I.cache");

  if (cx) {
    let bg: string[] = (await xfs.listAsync(bgcache)) || [];
    let ls: string[] = (await getFiles()) || [];
    for (let i = 0; i < ls.length; i++) {
      let e: string = ls[i];
      if (bg.indexOf(e) === -1) await downloadFile(e);
    }
    return true;
  } else if (cy) {
    log.info("Fuck this");
    return false;
  } else {
    let answer: Answer = showQuestionDialog(
      "Do you want to download Server-specific Background Videos?",
      "Choosing 'No' will replace the video with static images!"
    );
    if (answer == Answer.Yes) {
      await xfs.writeAsync("202V.cache", "true");
    } else {
      await xfs.writeAsync("202I.cache", "true");
    }
    return await checkBackgroundCache();
  }
}

const fileserver: string = "https://res.sascha-t.de/kukicraft/launcher/";

function downloadFile(file: string): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    let size: number = await getFileSize(file);

    let time1: number = Date.now();
    let time2: number = time1;

    let pg = new ProgressBar({
      indeterminate: false,
      text: "Downloading " + file,
      maxValue: size,
      detail: ""
    });
    let mg: string = magnitude.default(pg.getOptions().maxValue, 'B', 2);
    pg.on('progress', function(value) {
      time2 = Date.now();
      let speed: number = length / ((time2 - time1) / 1000);
      pg.detail = `${magnitude.default(
        value,
        'B',
        2
      )}/${mg} @ ${magnitude.default(speed, 'B/s', 2)}`;
    });

    let url: string = fileserver + file;
    let res: fetch.Response = await fetch.default(url);
    let length = 0;
    res.body.on('data', function(d: Buffer) {
      length += d.length;
      pg.value = length;
      //log.scope('Download').info(((length / size) * 100).toFixed(2));
    });
    res.body.on('end', function() {
      resolve();
    });
    res.body.on('error', err => {
      reject(err);
    });
    res.body.pipe(fs.createWriteStream(path.join(bgcache, file)));
  });
}

async function getFiles(): Promise<string[]> {
  let res: fetch.Response = await fetch.default(fileserver + "files.json");
  let data: object = await res.json();
  return Object.keys(data);
}

async function getFileSize(filename: string): Promise<number> {
  let res: fetch.Response = await fetch.default(fileserver + "files.json");
  let data: object = await res.json();
  let keys: string[] = Object.keys(data);
  for (let i = 0; i < keys.length; i++) {
    let file: File = data[keys[i]];
    if (keys[i] == filename) return file.size;
  }
  return -1;
}

declare type File = {
  size: number;
};

enum Answer {
  Yes = 0,
  No = 1
}

function showQuestionDialog(message, detail): Answer {
  return dialog.showMessageBox({
    type: "question",
    buttons: ["Yes", "No"],
    message,
    detail
  });
}
