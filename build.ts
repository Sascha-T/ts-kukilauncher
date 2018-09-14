let electronInstaller = require("electron-winstaller");
async function main() {
  let resultPromise32 = electronInstaller.createWindowsInstaller({
    appDirectory: "./builds/kukilauncher-win32-ia32",
    outputDirectory: "./release/installer32",
    authors: "KukiTeam",
    description: "Launches KukiCraft",
    exe: "kukilauncher.exe"
  });

  let resultPromise64 = electronInstaller.createWindowsInstaller({
    appDirectory: "./builds/kukilauncher-win32-x64",
    outputDirectory: "./release/installer64",
    authors: "KukiTeam",
    description: "Launches KukiCraft",
    exe: "kukilauncher.exe"
  });
  let promises = [resultPromise32, resultPromise64];
  Promise.all(promises);
}
main();
