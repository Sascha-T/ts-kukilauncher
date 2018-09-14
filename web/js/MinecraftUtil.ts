import {MinecraftVersion} from "./VersionUtil";
import {DownloadHelper} from "./DownloadUtil";
import * as jfs from 'fs-jetpack';
import * as log from 'signale';
import * as path from 'path';
import * as uuid from 'uuid';
import * as ofs from 'fs';
import {remote, ipcRenderer as ipc} from 'electron';
import {SystemHelper, Paths} from "./Constants";
import {LibraryHelper} from "./ForgeUtil";
import {AuthenticationResult} from "./YggdrasilUtil";

import * as child from 'child_process';

const mc: string = path.join(Paths.APPDATA.toString(), 'minecraft');
const fs = jfs.dir(mc);

export class MinecraftUtil {

    private readonly native: string;
    private version: MinecraftVersion;
    private libraries: MinecraftLibrary[];

    private classpath: string[] = [];

    constructor(version: MinecraftVersion) {
        this.version = version;
        this.native = path.join(SystemHelper.temp(), uuid.v4());
    }

    public async launch(auth: AuthenticationResult): Promise<void> {
        let cp: string = this.classpath.join(SystemHelper.classpathSeparatorBecauseJavaIsFuckingStupid());
        let args: string[] = [];
        args.push('-Djava.library.path="' + this.native + '"');
        args.push('-cp');
        cp += ':/home/pascal/.config/kukilauncher/minecraft/minecraftforge.jar';
        args.push(`"${cp}"`);
        args.push('net.minecraft.launchwrapper.Launch');
        args.push('--tweakClass');
        args.push('net.minecraftforge.fml.common.launcher.FMLTweaker');
        args.push('--version');
        args.push(this.version.id);
        args.push('--accessToken');
        if(auth) {
            args.push(auth.token || 'none');
            if(auth.uuid) {
                args.push('--uuid');
                args.push(auth.uuid);
            }
            if(auth.name) {
                args.push('--username');
                args.push(auth.name);
            }
        } else
            args.push('none');
        log.info(args.join(' '));
        let minecraft: child.ChildProcess = child.exec(`java ${args.join(" ")}`, {
            cwd: mc
        });
        minecraft.stdout.on('data', (data: Buffer) => {
            let records: string[] = data.toString('utf-8').split('\n');
            for(let i = 0; i < records.length; i++)
                if(/\s/.test(records[i]))
                    log.scope("minecraft", "client").info(records[i]);
        });

        minecraft.stderr.on('data', (data: Buffer) => {
            let records: string[] = data.toString('utf-8').split('\n');
            for(let i = 0; i < records.length; i++)
                if(/\s/.test(records[i]))
                    log.scope("minecraft", "client").error(records[i]);
        });

        minecraft.on('close', (code: number) => {
            log.scope("minecraft", "client").info(`Process closed! (${code})`);
            ipc.send('exit');
        });
    }

    public async install(step: SetStepCallback, update: UpdateCallback): Promise<void> {
        let l: log.Signale<log.DefaultMethods> = log.scope("minecraft", "installer");

        l.info("Installing Manifest File!");
        await this.installManifest(StepCallback.create("Loading Manifest File", step, update));

        l.info("Installing/Checking Forge libraries!");
        await this.getForgeLibraries(StepCallback.create("Loading Forge libraries", step, update));

        l.info("Installing/Checking libraries!");
        await this.installLibraries(StepCallback.create("Loading Minecraft libraries", step, update));

        l.info("Installing/Checking assets!");
        await this.installAssets(StepCallback.create("Loading Assets", step, update));

        l.info("Installing/Checking Resource Packs!");
        await this.installResourcePacks(StepCallback.create("Loading Resource Packs", step, update));

        l.info("Installing/Checking Mods!");
        await this.installMods(StepCallback.create("Loading Mods", step, update));

        l.info("Generating Classpath for launch!");
        await this.generateClasspath(StepCallback.create("Loading Classpath", step, update));
    }

    private async installResourcePacks(c: StepCallback): Promise<void> {
        c.steps(1);
        //TODO Video, Mod Selection, Gui (Images?), Settings, Login
        c.next();
    }

    private async installMods(c: StepCallback): Promise<void> {
        let manifest: Mods.ModList = await fs.readAsync(`versions/${this.version.id}/kuki.json`, 'json');
        let mods: Mods.ModWrapper[] = manifest.mods;
        c.steps(mods.length);
        for(let i = 0; i < mods.length; i++) {
            let mod: Mods.ModWrapper = mods[i];
            if(!Mods.shouldDownload(mod)) {
                c.next();
                continue;
            }

            log.scope("Download", "Mods").info(mod.projectid);
            await DownloadHelper.checkOrDownload(Mods.getUrl(mod), `mods/${mod.projectid}.jar`, mod.sha1);
            c.next();
        }
    }

    private async installAssets(c: StepCallback): Promise<void> {
        let assets: object = fs.readAsync(`assets/indexes/${this.version.id}.json`, 'json');
        let keys: string[] = Object.keys(assets);
        c.steps(keys.length-1);
        for(let i = 0; i < keys.length; i++) {
            let asset = assets[keys[i]];
            let id = `${asset.hash.substr(0,2)}/${asset.hash}`;
            await DownloadHelper.checkOrDownload(`http://resources.download.minecraft.net/${id}`, path.join(mc, 'assets', 'objects', id), asset.hash);
            log.scope("Download", "Assets").info(id);
            c.next();
        }
    }

    private async getForgeLibraries(c: StepCallback): Promise<void> {
        let libs: MinecraftLibrary[];
        if((await fs.existsAsync(`versions/${this.version.id}/${this.version.id}-forge.json`)) == 'file') {
            let data: MinecraftLibrary[] = await fs.readAsync(`versions/${this.version.id}/${this.version.id}-forge.json`, 'json');
            if(!data)
                libs = await LibraryHelper.getLibraries(this.version.id, c);
            else {
                libs = data;
            }
        } else {
            libs = await LibraryHelper.getLibraries(this.version.id, c);
        }
        this.libraries.push(...libs);
        c.next();
        await DownloadHelper.checkOrDownload(
            'https://files.minecraftforge.net/maven/net/minecraftforge/forge/1.12.2-14.23.4.2759/forge-1.12.2-14.23.4.2759-universal.jar',
            'minecraftforge.jar',
            '18665ca5ab0aaa695c4be6f5733ad05ffa28c202');
        c.next();
        ofs.chmodSync(path.join(mc, 'minecraftforge.jar'), 0o0644);
        c.next();
    }

    private async installManifest(c: StepCallback): Promise<void> {
        c.steps(5);
        if((await fs.existsAsync(`versions/${this.version.id}/${this.version.id}.json`) != "file")){
            await DownloadHelper.download(this.version.url, `versions/${this.version.id}/${this.version.id}.json`);
            log.scope("Minecraft", "Installer").info("Got new version Manifest");
        } else
            log.scope("Minecraft", "Installer").info("Reused version Manifest");
        let manifest = await fs.readAsync(`versions/${this.version.id}/${this.version.id}.json`);
        if(!manifest) {
            this.libraries = [];
            throw new Error("Something's wrong with the version manifest!");
        }
        c.next();
        log.info(manifest);
        manifest = JSON.parse(manifest);
        let libraries = manifest["libraries"];
        await DownloadHelper.checkOrDownload(manifest["downloads"]["client"]["url"], `versions/${this.version.id}/${this.version.id}.jar`, manifest["downloads"]["client"]["sha1"]);
        c.next();
        await DownloadHelper.checkOrDownload(manifest["assetIndex"]["url"], `assets/indexes/${this.version.id}.json`, manifest["assetIndex"]["sha1"]);
        c.next();
        await DownloadHelper.download('https://raw.githubusercontent.com/kukiteam/kukicraft/master/manifest.json', `versions/${this.version.id}/kuki.json`);
        c.next();
        let libs: MinecraftLibrary[] = [];

        for(let i = 0; i < libraries.length; i++) {
            let lib = libraries[i];
            if(lib["downloads"] && lib["downloads"]["artifact"]) {
                let artifact = lib["downloads"]["artifact"];
                libs.push(new MinecraftLibrary(false, artifact["sha1"], 'libraries/' + artifact["path"], artifact["url"]));
            }
            if(lib["natives"] && lib["natives"][SystemHelper.os()]) {
                if(lib["rules"]) {
                    let disallow: boolean = false;
                    let rules: any[] = lib["rules"];
                    for(let i = 0; i < rules.length; i++) {
                        let rule = rules[i];
                        if(!rule["os"]) {
                            disallow = rule["action"] != "allow";
                        } else {
                            let os: string = rule["os"]["name"];
                            if(os != SystemHelper.os())
                                disallow = rule["action"] == "allow";
                            else
                                disallow = rule["action"] != "allow";
                        }
                    }
                    if(disallow)
                        continue;
                }
                let classifier: string = lib["natives"][SystemHelper.os()];
                let native = lib["downloads"]["classifiers"][classifier];
                if(!native)
                    continue;
                libs.push(new MinecraftLibrary(true, native["sha1"], 'libraries/' + native["path"], native["url"]));
                c.next();
            }
        }

        this.libraries = libs;
    }

    private async installLibraries(c: StepCallback): Promise<void> {
        c.steps(this.libraries.length-1);
        for(let i = 0; i < this.libraries.length; i++) {
            let lib: MinecraftLibrary = this.libraries[i];
            log.scope('Download', 'Libraries').info(lib.path);
            await DownloadHelper.checkOrDownload(lib.url, lib.path, lib.hash);
            if(lib.native) {
                await DownloadHelper.unpack(path.join(Paths.APPDATA.toString(), 'minecraft', lib.path), this.native);
            }
            c.next();
        }
    }

    private async generateClasspath(c: StepCallback): Promise<void> {
        c.steps(this.libraries.length);
        for(let i = 0; i < this.libraries.length; i++) {
            let lib: MinecraftLibrary = this.libraries[i];
            this.classpath.push(path.join(mc, lib.path));
            c.next();
        }
        this.classpath.push(`versions/${this.version.id}/${this.version.id}.jar`);
        c.next();
    }

}

export class MinecraftLibrary {

    public native: boolean;
    public hash: string;
    public path: string;
    public url: string;

    constructor(native: boolean, hash: string, path: string, url: string) {
        this.native = native;
        this.hash = hash;
        this.path = path;
        this.url = url;
    }

    public wrap(): LibraryWrapper {
        return {
            native: this.native,
            hash: this.hash,
            path: this.path,
            url: this.url
        }
    }

    public static unwrap(object: LibraryWrapper): MinecraftLibrary {
        return new MinecraftLibrary(object.native, object.hash, object.path, object.url);
    }

}

export class StepCallback {

    private readonly description: string;
    private readonly callback: SetStepCallback;
    private readonly increment: Callback;

    private constructor(description: string, step: SetStepCallback, update: UpdateCallback) {
        this.description = description;
        this.increment = () => update('increment');
        this.callback = step;
    }

    public steps(amount: number): void {
        this.callback(this.description, amount);
    }

    public next(): void {
        this.increment();
    }

    public static create(description: string, step: SetStepCallback, update: UpdateCallback): StepCallback {
        return new StepCallback(description, step, update);
    }

}

export declare type StepProgressCallback = (description: string) => void;
export declare type SetStepCallback = (description: string, step: number) => void;
export declare type UpdateCallback = (command: string) => void;
export declare type Callback = () => void;

declare type LibraryWrapper = { hash: string; path: string; url: string, native: boolean }

namespace Mods {

    export declare type ModList = {
        minecraft: {
            version: string,
            forge: string
        },
        mods: ModWrapper[]
    }

    export declare type ModWrapper = {
        name: string,
        source: Source,
        projectid?: string,
        fileid?: string,
        sha1: string,
        optional: boolean,
        side: Side,
        url?: string
    }

    enum Source {
        Curse = "curse",
        Direct = "direct"
    }

    export function getUrl(mod: ModWrapper): string {
        switch(mod.source) {
            case Source.Curse:
                return `https://minecraft.curseforge.com/projects/${mod.projectid}/files/${mod.fileid}/download`;
            case Source.Direct:
                return mod.url;
        }
    }

    export function shouldDownload(mod: ModWrapper): boolean {
        return mod.side == Side.Common || mod.side == Side.Client;
    }

    enum Side {
        Common = "common",
        Server = "server",
        Client = "client"
    }

}