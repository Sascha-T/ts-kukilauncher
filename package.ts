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

  let debianPromise = debianInstaller({
    src: "builds/kukilauncher-linux-x64/",
    dest: "./release/debian/",
    arch: "x86_64"
  }).then(success => {
    console.log("Debian Build done!");
  });

  let redhatPromise = redhatInstaller({
    src: "builds/kukilauncher-linux-x64/",
    dest: "./release/redhat/",
    arch: "x86_64"
  }).then(success => {
    console.log("RedHat Build done!");
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
