"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var logger = require("signale");
var fetch = require("node-fetch");
var path = require("path");
var mkd = require("mkdirp");
var jfs = require("fs-jetpack");
var fs = require("fs");
var ProgressBar = require("electron-progressbar");
var magnitude = require("./Magnitude");
var bgcache = path.join(electron_1.app.getPath('userData'), 'background-cache');
var xfs = jfs.cwd(electron_1.app.getPath('userData'));
var log = logger.scope("Electron", "Init");
var launcher = null;
electron_1.app.on('ready', function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                log.info("Checking Background cache!");
                return [4 /*yield*/, checkBackgroundCache()];
            case 1:
                _a.sent();
                log.info("Loading Window");
                launcher = new electron_1.BrowserWindow({
                    width: 1024,
                    height: 600,
                    center: true,
                    frame: false,
                    resizable: false
                });
                launcher["appdata"] = electron_1.app.getPath('userData');
                launcher.loadFile('web/index.html');
                return [2 /*return*/];
        }
    });
}); });
electron_1.ipcMain.on('close', function () {
    launcher.hide();
});
electron_1.ipcMain.on('exit', function () {
    launcher.close();
    process.exit(0);
});
electron_1.ipcMain.on('minimize', function () {
    launcher.minimize();
});
function checkBackgroundCache() {
    return __awaiter(this, void 0, void 0, function () {
        var cx, cy, bg, ls, i, e, answer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mkd(bgcache);
                    return [4 /*yield*/, xfs.existsAsync('202V.cache')];
                case 1:
                    cx = _a.sent();
                    return [4 /*yield*/, xfs.existsAsync('202I.cache')];
                case 2:
                    cy = _a.sent();
                    if (!cx) return [3 /*break*/, 9];
                    return [4 /*yield*/, xfs.listAsync(bgcache)];
                case 3:
                    bg = (_a.sent()) || [];
                    return [4 /*yield*/, getFiles()];
                case 4:
                    ls = (_a.sent()) || [];
                    i = 0;
                    _a.label = 5;
                case 5:
                    if (!(i < ls.length)) return [3 /*break*/, 8];
                    e = ls[i];
                    if (!(bg.indexOf(e) === -1)) return [3 /*break*/, 7];
                    return [4 /*yield*/, downloadFile(e)];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    i++;
                    return [3 /*break*/, 5];
                case 8: return [2 /*return*/, true];
                case 9:
                    if (!cy) return [3 /*break*/, 10];
                    log.info("Fuck this");
                    return [2 /*return*/, false];
                case 10:
                    answer = showQuestionDialog("Do you want to download Server-specific Background Videos?", "Choosing 'No' will replace the video with static images!");
                    if (!(answer == Answer.Yes)) return [3 /*break*/, 12];
                    return [4 /*yield*/, xfs.writeAsync('202V.cache', "true")];
                case 11:
                    _a.sent();
                    return [3 /*break*/, 14];
                case 12: return [4 /*yield*/, xfs.writeAsync('202I.cache', "true")];
                case 13:
                    _a.sent();
                    _a.label = 14;
                case 14: return [4 /*yield*/, checkBackgroundCache()];
                case 15: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
var fileserver = 'https://res.sascha-t.de/kukicraft/launcher/';
function downloadFile(file) {
    var _this = this;
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var size, time1, time2, pg, mg, url, res, length;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getFileSize(file)];
                case 1:
                    size = _a.sent();
                    time1 = Date.now();
                    time2 = time1;
                    pg = new ProgressBar({
                        indeterminate: false,
                        text: 'Downloading ' + file,
                        maxValue: size,
                        detail: ''
                    });
                    mg = magnitude.default(pg.getOptions().maxValue, 'B', 2);
                    pg.on('progress', function (value) {
                        time2 = Date.now();
                        var speed = length / ((time2 - time1) / 1000);
                        pg.detail = magnitude.default(value, 'B', 2) + "/" + mg + " @ " + magnitude.default(speed, 'B/s', 2);
                    });
                    url = fileserver + file;
                    return [4 /*yield*/, fetch.default(url)];
                case 2:
                    res = _a.sent();
                    length = 0;
                    res.body.on('data', function (d) {
                        length += (d.length);
                        pg.value = length;
                        //log.scope("Download").info(((length / size) * 100).toFixed(2));
                    });
                    res.body.on('end', function () {
                        resolve();
                    });
                    res.body.on('error', function (err) {
                        reject(err);
                    });
                    res.body.pipe(fs.createWriteStream(path.join(bgcache, file)));
                    return [2 /*return*/];
            }
        });
    }); });
}
function getFiles() {
    return __awaiter(this, void 0, void 0, function () {
        var res, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch.default(fileserver + 'files.json')];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = _a.sent();
                    return [2 /*return*/, Object.keys(data)];
            }
        });
    });
}
function getFileSize(filename) {
    return __awaiter(this, void 0, void 0, function () {
        var res, data, keys, i, file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch.default(fileserver + 'files.json')];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = _a.sent();
                    keys = Object.keys(data);
                    for (i = 0; i < keys.length; i++) {
                        file = data[keys[i]];
                        if (keys[i] == filename)
                            return [2 /*return*/, file.size];
                    }
                    return [2 /*return*/, -1];
            }
        });
    });
}
var Answer;
(function (Answer) {
    Answer[Answer["Yes"] = 0] = "Yes";
    Answer[Answer["No"] = 1] = "No";
})(Answer || (Answer = {}));
function showQuestionDialog(message, detail) {
    return electron_1.dialog.showMessageBox({
        type: "question",
        buttons: ["Yes", "No"],
        message: message,
        detail: detail
    });
}
//# sourceMappingURL=app.js.map