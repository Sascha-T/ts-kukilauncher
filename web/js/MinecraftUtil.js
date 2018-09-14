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
Object.defineProperty(exports, "__esModule", { value: true });
var DownloadUtil_1 = require("./DownloadUtil");
var jfs = require("fs-jetpack");
var log = require("signale");
var path = require("path");
var uuid = require("uuid");
var ofs = require("fs");
var electron_1 = require("electron");
var Constants_1 = require("./Constants");
var ForgeUtil_1 = require("./ForgeUtil");
var child = require("child_process");
var mc = path.join(Constants_1.Paths.APPDATA.toString(), 'minecraft');
var fs = jfs.dir(mc);
var MinecraftUtil = /** @class */ (function () {
    function MinecraftUtil(version) {
        this.classpath = [];
        this.version = version;
        this.native = path.join(Constants_1.SystemHelper.temp(), uuid.v4());
    }
    MinecraftUtil.prototype.launch = function (auth) {
        return __awaiter(this, void 0, void 0, function () {
            var cp, args, minecraft;
            return __generator(this, function (_a) {
                cp = this.classpath.join(Constants_1.SystemHelper.classpathSeparatorBecauseJavaIsFuckingStupid());
                args = [];
                args.push('-Djava.library.path="' + this.native + '"');
                args.push('-cp');
                cp += ':/home/pascal/.config/kukilauncher/minecraft/minecraftforge.jar';
                args.push("\"" + cp + "\"");
                args.push('net.minecraft.launchwrapper.Launch');
                args.push('--tweakClass');
                args.push('net.minecraftforge.fml.common.launcher.FMLTweaker');
                args.push('--version');
                args.push(this.version.id);
                args.push('--accessToken');
                if (auth) {
                    args.push(auth.token || 'none');
                    if (auth.uuid) {
                        args.push('--uuid');
                        args.push(auth.uuid);
                    }
                    if (auth.name) {
                        args.push('--username');
                        args.push(auth.name);
                    }
                }
                else
                    args.push('none');
                log.info(args.join(' '));
                minecraft = child.exec("java " + args.join(" "), {
                    cwd: mc
                });
                minecraft.stdout.on('data', function (data) {
                    var records = data.toString('utf-8').split('\n');
                    for (var i = 0; i < records.length; i++)
                        if (/\s/.test(records[i]))
                            log.scope("minecraft", "client").info(records[i]);
                });
                minecraft.stderr.on('data', function (data) {
                    var records = data.toString('utf-8').split('\n');
                    for (var i = 0; i < records.length; i++)
                        if (/\s/.test(records[i]))
                            log.scope("minecraft", "client").error(records[i]);
                });
                minecraft.on('close', function (code) {
                    log.scope("minecraft", "client").info("Process closed! (" + code + ")");
                    electron_1.ipcRenderer.send('exit');
                });
                return [2 /*return*/];
            });
        });
    };
    MinecraftUtil.prototype.install = function (step, update) {
        return __awaiter(this, void 0, void 0, function () {
            var l;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        l = log.scope("minecraft", "installer");
                        l.info("Installing Manifest File!");
                        return [4 /*yield*/, this.installManifest(StepCallback.create("Loading Manifest File", step, update))];
                    case 1:
                        _a.sent();
                        l.info("Installing/Checking Forge libraries!");
                        return [4 /*yield*/, this.getForgeLibraries(StepCallback.create("Loading Forge libraries", step, update))];
                    case 2:
                        _a.sent();
                        l.info("Installing/Checking libraries!");
                        return [4 /*yield*/, this.installLibraries(StepCallback.create("Loading Minecraft libraries", step, update))];
                    case 3:
                        _a.sent();
                        l.info("Installing/Checking assets!");
                        return [4 /*yield*/, this.installAssets(StepCallback.create("Loading Assets", step, update))];
                    case 4:
                        _a.sent();
                        l.info("Installing/Checking Resource Packs!");
                        return [4 /*yield*/, this.installResourcePacks(StepCallback.create("Loading Resource Packs", step, update))];
                    case 5:
                        _a.sent();
                        l.info("Installing/Checking Mods!");
                        return [4 /*yield*/, this.installMods(StepCallback.create("Loading Mods", step, update))];
                    case 6:
                        _a.sent();
                        l.info("Generating Classpath for launch!");
                        return [4 /*yield*/, this.generateClasspath(StepCallback.create("Loading Classpath", step, update))];
                    case 7:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MinecraftUtil.prototype.installResourcePacks = function (c) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                c.steps(1);
                //TODO Video, Mod Selection, Gui (Images?), Settings, Login
                c.next();
                return [2 /*return*/];
            });
        });
    };
    MinecraftUtil.prototype.installMods = function (c) {
        return __awaiter(this, void 0, void 0, function () {
            var manifest, mods, i, mod;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs.readAsync("versions/" + this.version.id + "/kuki.json", 'json')];
                    case 1:
                        manifest = _a.sent();
                        mods = manifest.mods;
                        c.steps(mods.length);
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < mods.length)) return [3 /*break*/, 5];
                        mod = mods[i];
                        if (!Mods.shouldDownload(mod)) {
                            c.next();
                            return [3 /*break*/, 4];
                        }
                        log.scope("Download", "Mods").info(mod.projectid);
                        return [4 /*yield*/, DownloadUtil_1.DownloadHelper.checkOrDownload(Mods.getUrl(mod), "mods/" + mod.projectid + ".jar", mod.sha1)];
                    case 3:
                        _a.sent();
                        c.next();
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    MinecraftUtil.prototype.installAssets = function (c) {
        return __awaiter(this, void 0, void 0, function () {
            var assets, keys, i, asset, id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assets = fs.readAsync("assets/indexes/" + this.version.id + ".json", 'json');
                        keys = Object.keys(assets);
                        c.steps(keys.length - 1);
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < keys.length)) return [3 /*break*/, 4];
                        asset = assets[keys[i]];
                        id = asset.hash.substr(0, 2) + "/" + asset.hash;
                        return [4 /*yield*/, DownloadUtil_1.DownloadHelper.checkOrDownload("http://resources.download.minecraft.net/" + id, path.join(mc, 'assets', 'objects', id), asset.hash)];
                    case 2:
                        _a.sent();
                        log.scope("Download", "Assets").info(id);
                        c.next();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MinecraftUtil.prototype.getForgeLibraries = function (c) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, libs, data;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, fs.existsAsync("versions/" + this.version.id + "/" + this.version.id + "-forge.json")];
                    case 1:
                        if (!((_b.sent()) == 'file')) return [3 /*break*/, 6];
                        return [4 /*yield*/, fs.readAsync("versions/" + this.version.id + "/" + this.version.id + "-forge.json", 'json')];
                    case 2:
                        data = _b.sent();
                        if (!!data) return [3 /*break*/, 4];
                        return [4 /*yield*/, ForgeUtil_1.LibraryHelper.getLibraries(this.version.id, c)];
                    case 3:
                        libs = _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        libs = data;
                        _b.label = 5;
                    case 5: return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, ForgeUtil_1.LibraryHelper.getLibraries(this.version.id, c)];
                    case 7:
                        libs = _b.sent();
                        _b.label = 8;
                    case 8:
                        (_a = this.libraries).push.apply(_a, libs);
                        c.next();
                        return [4 /*yield*/, DownloadUtil_1.DownloadHelper.checkOrDownload('https://files.minecraftforge.net/maven/net/minecraftforge/forge/1.12.2-14.23.4.2759/forge-1.12.2-14.23.4.2759-universal.jar', 'minecraftforge.jar', '18665ca5ab0aaa695c4be6f5733ad05ffa28c202')];
                    case 9:
                        _b.sent();
                        c.next();
                        ofs.chmodSync(path.join(mc, 'minecraftforge.jar'), 420);
                        c.next();
                        return [2 /*return*/];
                }
            });
        });
    };
    MinecraftUtil.prototype.installManifest = function (c) {
        return __awaiter(this, void 0, void 0, function () {
            var manifest, libraries, libs, i, lib, artifact, disallow, rules, i_1, rule, os, classifier, native;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        c.steps(5);
                        return [4 /*yield*/, fs.existsAsync("versions/" + this.version.id + "/" + this.version.id + ".json")];
                    case 1:
                        if (!((_a.sent()) != "file")) return [3 /*break*/, 3];
                        return [4 /*yield*/, DownloadUtil_1.DownloadHelper.download(this.version.url, "versions/" + this.version.id + "/" + this.version.id + ".json")];
                    case 2:
                        _a.sent();
                        log.scope("Minecraft", "Installer").info("Got new version Manifest");
                        return [3 /*break*/, 4];
                    case 3:
                        log.scope("Minecraft", "Installer").info("Reused version Manifest");
                        _a.label = 4;
                    case 4: return [4 /*yield*/, fs.readAsync("versions/" + this.version.id + "/" + this.version.id + ".json")];
                    case 5:
                        manifest = _a.sent();
                        if (!manifest) {
                            this.libraries = [];
                            throw new Error("Something's wrong with the version manifest!");
                        }
                        c.next();
                        log.info(manifest);
                        manifest = JSON.parse(manifest);
                        libraries = manifest["libraries"];
                        return [4 /*yield*/, DownloadUtil_1.DownloadHelper.checkOrDownload(manifest["downloads"]["client"]["url"], "versions/" + this.version.id + "/" + this.version.id + ".jar", manifest["downloads"]["client"]["sha1"])];
                    case 6:
                        _a.sent();
                        c.next();
                        return [4 /*yield*/, DownloadUtil_1.DownloadHelper.checkOrDownload(manifest["assetIndex"]["url"], "assets/indexes/" + this.version.id + ".json", manifest["assetIndex"]["sha1"])];
                    case 7:
                        _a.sent();
                        c.next();
                        return [4 /*yield*/, DownloadUtil_1.DownloadHelper.download('https://raw.githubusercontent.com/kukiteam/kukicraft/master/manifest.json', "versions/" + this.version.id + "/kuki.json")];
                    case 8:
                        _a.sent();
                        c.next();
                        libs = [];
                        for (i = 0; i < libraries.length; i++) {
                            lib = libraries[i];
                            if (lib["downloads"] && lib["downloads"]["artifact"]) {
                                artifact = lib["downloads"]["artifact"];
                                libs.push(new MinecraftLibrary(false, artifact["sha1"], 'libraries/' + artifact["path"], artifact["url"]));
                            }
                            if (lib["natives"] && lib["natives"][Constants_1.SystemHelper.os()]) {
                                if (lib["rules"]) {
                                    disallow = false;
                                    rules = lib["rules"];
                                    for (i_1 = 0; i_1 < rules.length; i_1++) {
                                        rule = rules[i_1];
                                        if (!rule["os"]) {
                                            disallow = rule["action"] != "allow";
                                        }
                                        else {
                                            os = rule["os"]["name"];
                                            if (os != Constants_1.SystemHelper.os())
                                                disallow = rule["action"] == "allow";
                                            else
                                                disallow = rule["action"] != "allow";
                                        }
                                    }
                                    if (disallow)
                                        continue;
                                }
                                classifier = lib["natives"][Constants_1.SystemHelper.os()];
                                native = lib["downloads"]["classifiers"][classifier];
                                if (!native)
                                    continue;
                                libs.push(new MinecraftLibrary(true, native["sha1"], 'libraries/' + native["path"], native["url"]));
                                c.next();
                            }
                        }
                        this.libraries = libs;
                        return [2 /*return*/];
                }
            });
        });
    };
    MinecraftUtil.prototype.installLibraries = function (c) {
        return __awaiter(this, void 0, void 0, function () {
            var i, lib;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        c.steps(this.libraries.length - 1);
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < this.libraries.length)) return [3 /*break*/, 6];
                        lib = this.libraries[i];
                        log.scope('Download', 'Libraries').info(lib.path);
                        return [4 /*yield*/, DownloadUtil_1.DownloadHelper.checkOrDownload(lib.url, lib.path, lib.hash)];
                    case 2:
                        _a.sent();
                        if (!lib.native) return [3 /*break*/, 4];
                        return [4 /*yield*/, DownloadUtil_1.DownloadHelper.unpack(path.join(Constants_1.Paths.APPDATA.toString(), 'minecraft', lib.path), this.native)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        c.next();
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    MinecraftUtil.prototype.generateClasspath = function (c) {
        return __awaiter(this, void 0, void 0, function () {
            var i, lib;
            return __generator(this, function (_a) {
                c.steps(this.libraries.length);
                for (i = 0; i < this.libraries.length; i++) {
                    lib = this.libraries[i];
                    this.classpath.push(path.join(mc, lib.path));
                    c.next();
                }
                this.classpath.push("versions/" + this.version.id + "/" + this.version.id + ".jar");
                c.next();
                return [2 /*return*/];
            });
        });
    };
    return MinecraftUtil;
}());
exports.MinecraftUtil = MinecraftUtil;
var MinecraftLibrary = /** @class */ (function () {
    function MinecraftLibrary(native, hash, path, url) {
        this.native = native;
        this.hash = hash;
        this.path = path;
        this.url = url;
    }
    MinecraftLibrary.prototype.wrap = function () {
        return {
            native: this.native,
            hash: this.hash,
            path: this.path,
            url: this.url
        };
    };
    MinecraftLibrary.unwrap = function (object) {
        return new MinecraftLibrary(object.native, object.hash, object.path, object.url);
    };
    return MinecraftLibrary;
}());
exports.MinecraftLibrary = MinecraftLibrary;
var StepCallback = /** @class */ (function () {
    function StepCallback(description, step, update) {
        this.description = description;
        this.increment = function () { return update('increment'); };
        this.callback = step;
    }
    StepCallback.prototype.steps = function (amount) {
        this.callback(this.description, amount);
    };
    StepCallback.prototype.next = function () {
        this.increment();
    };
    StepCallback.create = function (description, step, update) {
        return new StepCallback(description, step, update);
    };
    return StepCallback;
}());
exports.StepCallback = StepCallback;
var Mods;
(function (Mods) {
    var Source;
    (function (Source) {
        Source["Curse"] = "curse";
        Source["Direct"] = "direct";
    })(Source || (Source = {}));
    function getUrl(mod) {
        switch (mod.source) {
            case Source.Curse:
                return "https://minecraft.curseforge.com/projects/" + mod.projectid + "/files/" + mod.fileid + "/download";
            case Source.Direct:
                return mod.url;
        }
    }
    Mods.getUrl = getUrl;
    function shouldDownload(mod) {
        return mod.side == Side.Common || mod.side == Side.Client;
    }
    Mods.shouldDownload = shouldDownload;
    var Side;
    (function (Side) {
        Side["Common"] = "common";
        Side["Server"] = "server";
        Side["Client"] = "client";
    })(Side || (Side = {}));
})(Mods || (Mods = {}));
//# sourceMappingURL=MinecraftUtil.js.map