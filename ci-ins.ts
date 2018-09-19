import * as npm from "npm-programmatic";
import * as fs from "fs";
import * as path from "path";
let allPackagesToInstall = [];
function addPackage(packageName: String) {
  allPackagesToInstall.push(
    new Promise((resolve, reject) => {
      npm
        .install([packageName], {
          cwd: __dirname,
          save: false
        })
        .catch(err => {
          console.error(`Package ${packageName} failed to install`);
          console.error(err);
          reject(err);
        })
        .then(() => {
          resolve();
        });
    })
  );
}
async function finish() {
  await Promise.all(allPackagesToInstall);
}

async function main() {
  let packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, "package.json"), "UTF8")
  );
  for (let ciI in packageJson["ciDependencies"]) {
    addPackage(ciI);
  }
  await finish();
  console.log("Done");
}
main();
