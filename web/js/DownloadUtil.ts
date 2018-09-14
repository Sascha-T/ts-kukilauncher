//import * as deflate from 'extract-zip';
import * as fetch from 'node-fetch';
import * as jfs from 'fs-jetpack';
import * as unzip from 'unzipper';
import * as crypto from 'crypto';
import * as mkdir from 'mkdirp';
import * as log from 'signale';
import * as path from 'path';

import {WriteStream} from 'fs';

import {Paths, ProgressHandler} from "./Constants";

const fs = jfs.dir(path.join(Paths.APPDATA.toString(), 'minecraft'));

export class DownloadHelper {

    static async download(url: string, _path: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            mkdir(path.join(Paths.APPDATA.toString(), 'minecraft', _path, '..'));
            fetch.default(url).then((res: fetch.Response) => {
                let pipe: WriteStream = res.body.pipe(fs.createWriteStream(_path));
                pipe.on('finish', resolve);
                pipe.on('error', reject);
            });
        });
    }

    static async checkOrDownload(url: string, path: string, hash: string): Promise<void> {
        if(!await this.check(path, hash))
            return await this.download(url, path);
        console.log("Skipped " + path);
    }

    private static async check(path: string, sha1: string): Promise<boolean> {
        if((await fs.existsAsync(path)) !== 'file')
            return false;
        let data: Buffer = await fs.readAsync(path, 'buffer');
        let hash: crypto.Hash = crypto.createHash('sha1');
        hash.update(data);
        return hash.digest().toString('hex') === sha1;
    }

    static unpack(p: string, output: string): void {
        mkdir(output);
        fs.createReadStream(p)
            .pipe(unzip.Parse())
            .on('entry', function (entry) {
                log.scope("Download", "Natives").info("Unpacking native:");
                log.scope("Download", "Natives").info(" -> " + entry.path);
                if(entry.path.indexOf('/') === -1)
                    entry.pipe(fs.createWriteStream(path.join(output, entry.path)));
            });
    }

}