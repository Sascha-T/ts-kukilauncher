let windowsInstaller = require("electron-winstaller");
var linuxInstaller = require("electron-linux-installer");
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

  let debianPromise = linuxInstaller({
    src: "builds/kukilauncher-linux-x64/", // source location
    dest: "./release/debian/", // destination of the installer
    arch: "x86_64", // x86_x64 would work both debian and rpm cause controllers are here.
    for: "debian" // can be debian or redhat
  }).then(success => {
    console.log("Debian Build done!");
  });

  let redhatPromise = linuxInstaller({
    src: "builds/kukilauncher-linux-x64/", // source location
    dest: "./release/redhat/", // destination of the installer
    arch: "x86_64", // x86_x64 would work both debian and rpm cause controllers are here.
    for: "redhat" // can be debian or redhat
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
