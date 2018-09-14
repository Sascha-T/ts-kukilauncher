import {Endpoints} from "./Constants";
import * as fetch from 'node-fetch';

export class VersionHelper {

    public static async getVersions(): Promise<Map<String, MinecraftVersion>> {
        let res: fetch.Response = await fetch.default(Endpoints.MANIFEST);
        let json: any = await res.json();
        let versions: Map<String, MinecraftVersion> = new Map<String, MinecraftVersion>();
        for(let i = 0; i < json["versions"].length; i++) {
            let version = json["versions"][i];
            versions.set(version["id"], new MinecraftVersion(
                version["id"],
                version["url"],
                version["type"],
                version["time"],
                version["releaseTime"]
            ));
        }
        return versions;
    }

    public static async getVersion(version: string): Promise<MinecraftVersion> {
        let versions: Map<String, MinecraftVersion> = await this.getVersions();
        return versions.get(version);
    };

}

export class MinecraftVersion {

    public id: string;
    public url: string;
    public type: string;
    public time: string;
    public releaseTime: string;

    constructor(id: string, url: string, type: string, time: string, releaseTime: string) {
        this.id = id;
        this.url = url;
        this.type = type;
        this.time = time;
        this.releaseTime = releaseTime;
    }

}