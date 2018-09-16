import { resolve } from "url";

let windowsInstaller = require("electron-winstaller");
let redhatInstaller = require("electron-installer-redhat");
let debianInstaller = require("electron-installer-debian");
async function main() {
  let resultPromise32 = windowsInstaller
    .createWindowsInstaller({
      appDirectory: "./builds/kukilauncher-win32-ia32",
      outputDirectory: "./release/installer32",
      authors: "KukiTeam",
      description: "Launches KukiCraft",
      exe: "kukilauncher.exe"
    })
    .then(success => {
      console.log("Win32 Build done!");
    });

  let resultPromise64 = windowsInstaller
    .createWindowsInstaller({
      appDirectory: "./builds/kukilauncher-win32-x64",
      outputDirectory: "./release/installer64",
      authors: "KukiTeam",
      description: "Launches KukiCraft",
      exe: "kukilauncher.exe"
    })
    .then(success => {
      console.log("Win64 Build done!");
    });

  let debianPromise = new Promise((res, rej) => {
    debianInstaller(
      {
        src: "builds/kukilauncher-linux-x64/",
        dest: "./release/debian/",
        arch: "x86_64"
      },
      err => {
        if (err) {
          rej(err);
          process.exit(1);
        }
        console.log("Successfully created built the debian package!");
        res();
      }
    );
  });

  let redhatPromise = new Promise((res, rej) => {
    redhatInstaller(
      {
        src: "builds/kukilauncher-linux-x64/",
        dest: "./release/redhat/",
        arch: "x86_64"
      },
      err => {
        if (err) {
          rej(err);
          process.exit(1);
        }
        console.log("Successfully created built the debian package!");
        res();
      }
    );
  });
  let promises = [
    resultPromise32,
    resultPromise64,
    redhatPromise,
    debianPromise
  ];
  Promise.all(promises);
}
main();
