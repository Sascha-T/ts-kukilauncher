import {FileType} from "../../utils/Downloader";
import {remote} from 'electron';

export const files: string = remote.getCurrentWindow()["files"];
export const filetype: FileType = remote.getCurrentWindow()["filetype"];