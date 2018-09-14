import { remote } from 'electron';
import * as sys from 'os';

export enum Endpoints {
    MANIFEST = "https://launchermeta.mojang.com/mc/game/version_manifest.json",
    AUTHENTICATION = "https://authserver.mojang.com/authenticate"
}

export enum Paths {
    APPDATA = remote.getCurrentWindow()["appdata"]
}

export class SystemHelper {

    public static os(): string {
        let platform = sys.platform();
        return platform.replace("darwin", "osx").replace("win32", "windows");
    }

    public static temp(): string {
        return sys.tmpdir();
    }

    public static classpathSeparatorBecauseJavaIsFuckingStupid(): string {//Fuck Java
        switch(sys.platform()) {
            case 'darwin':
                return ':';
            case 'win32':
                return ';';
            default:
                return ':';
        }
    }

}

export declare type ProgressHandler = (progress: number) => void;