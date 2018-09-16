import * as ProgressBar from "electron-progressbar";
import * as magnitude from "./Magnitude";
import * as crypto from "crypto";
import * as fetch from "node-fetch";
import * as mkdir from "mkdirp";
import * as path from "path";
import * as jfs from "fs-jetpack";
import * as fs from "fs";

import * as signale from 'signale';

import {app} from "electron";

import * as Dialog from './Dialog';

const bgcache = path.join(app.getPath("userData"), "background-cache");
const log = signale.scope("Electron", "Download");

declare type File = {
    sha1: string,
    size: number
};

export enum FileType {
    Video = ".webm",
    Image = ".png"
}

enum CacheDescriptor {
    VideoCache = "202V.cache",
    ImageCache = "202I.cache"
}

export declare type DownloadResult = {
    files: string[],
    type: FileType
}

const xfs = jfs.cwd(app.getPath("userData"));

export async function checkBackgroundFiles(): Promise<void> {
    let files: string[] = await xfs.listAsync('background-cache');
    for(let i = 0; i < files.length; i++) {
        let file: File = await getFile(files[i]);
        let data: Buffer = await xfs.readAsync('background-cache/' + files[i], "buffer");
        let hash: crypto.Hash = crypto.createHash('sha1');
        hash.update(data);
        log.info(files[i]);
        let digest: Buffer = hash.digest();
        log.info(`${digest.toString('hex')} ?= ${file.sha1}`);
        if(digest.toString('hex') !== file.sha1)
            await xfs.removeAsync('background-cache/' + files[i]);
    }
}

export async function checkBackgroundCache(): Promise<DownloadResult> {
    mkdir(bgcache);

    let cx = await xfs.existsAsync(CacheDescriptor.VideoCache);
    let cy = await xfs.existsAsync(CacheDescriptor.ImageCache);

    if (cx) {
        return {
            files: await downloadAll(FileType.Video),
            type: FileType.Video
        };
    } else if (cy) {
        return {
            files: await downloadAll(FileType.Image),
            type: FileType.Image
        };
    } else {
        let answer: Dialog.Answer = Dialog.showQuestionDialog(
            "Do you want to download Server-specific Background Videos?",
            "Choosing 'No' will replace the video with static images!"
        );
        if (answer == Dialog.Answer.Yes) {
            await xfs.writeAsync(CacheDescriptor.VideoCache, (Math.round(Math.random()*1e9)).toString(16));
        } else {
            await xfs.writeAsync(CacheDescriptor.ImageCache, (Math.round(Math.random()*1e9)).toString(16));
        }
        return await checkBackgroundCache();
    }
}

export async function downloadAll(type: FileType): Promise<string[]> {
    let bg: string[] = (await xfs.listAsync(bgcache)) || [];
    let ls: string[] = (await getFiles(type)) || [];
    for (let i = 0; i < ls.length; i++) {
        let e: string = ls[i];
        if (bg.indexOf(e) === -1) await downloadFile(e);
    }
    return ls.map(value => path.join(bgcache, value));
}

const fileServer: string = "https://res.sascha-t.de/kukicraft/launcher/";

export function downloadFile(file: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
        let size: number = (await getFile(file)).size;

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

        let url: string = fileServer + file;
        let res: fetch.Response = await fetch.default(url);
        let length = 0;

        res.body.on('data', function(d: Buffer) {
            length += d.length;
            pg.value = length;
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

async function getFiles(type: FileType): Promise<string[]> {
    let res: fetch.Response = await fetch.default(fileServer + "files.json");
    let data: object = await res.json();
    return Object.keys(data).filter(value => value.indexOf(type) !== -1);
}

async function getFile(filename: string): Promise<File> {
    let res: fetch.Response = await fetch.default(fileServer + "files.json");
    let data: object = await res.json();
    let keys: string[] = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
        let file: File = data[keys[i]];
        if (keys[i] == filename) return file;
    }
    return {
        sha1: "0000000000000000000000000000000000000000",
        size: -1
    };
}