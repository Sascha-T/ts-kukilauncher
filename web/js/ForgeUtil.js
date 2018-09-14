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
var MinecraftUtil_1 = require("./MinecraftUtil");
var Constants_1 = require("./Constants");
var fetch = require("node-fetch");
var signale = require("signale");
var jfs = require("fs-jetpack");
var path = require("path");
var log = signale.scope("minecraft", "installer", "forge");
var fs = jfs.dir(path.join(Constants_1.Paths.APPDATA.toString(), 'minecraft'));
var LibraryHelper = /** @class */ (function () {
    function LibraryHelper() {
    }
    LibraryHelper.getUrl = function (artifact, repo) {
        var groupId = artifact[0].replace(/\./g, '/');
        var artifactId = artifact[1];
        var versionId = artifact[2].toString();
        var type;
        if (artifact.length > 3)
            type = artifact[3];
        var path = groupId + "/" + artifactId + "/" + versionId + "/" + artifactId + "-" + versionId + (type ? '-' + type : '') + ".jar";
        return [
            repo.url + "/" + path,
            path
        ];
    };
    LibraryHelper.getUrls = function (repo) {
        var result = [];
        for (var i = 0; i < repo.artifacts.length; i++)
            result.push(LibraryHelper.getUrl(repo.artifacts[i], repo));
        return result;
    };
    LibraryHelper.getLibrary = function (artifact) {
        return __awaiter(this, void 0, void 0, function () {
            var url, path, res, hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = artifact[0];
                        path = artifact[1];
                        return [4 /*yield*/, fetch.default(url + ".sha1")];
                    case 1:
                        res = _a.sent();
                        log.debug(url + ".sha1");
                        return [4 /*yield*/, res.text()];
                    case 2:
                        hash = _a.sent();
                        log.debug(" -> " + hash);
                        return [2 /*return*/, new MinecraftUtil_1.MinecraftLibrary(false, hash, 'libraries/' + path, url)];
                }
            });
        });
    };
    LibraryHelper.getLibraries = function (version, c) {
        return __awaiter(this, void 0, void 0, function () {
            var result, i, repo, libs, i, artifact, _a, _b, wrap, i;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        log.info("Getting Forge Library info!");
                        result = [];
                        for (i = 0; i < repositories.length; i++) {
                            repo = repositories[i];
                            log.info("Repo Info: '" + repo.url + "'");
                            result.push.apply(result, LibraryHelper.getUrls(repo));
                        }
                        c.steps(result.length + 3);
                        libs = [];
                        i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(i < result.length)) return [3 /*break*/, 4];
                        artifact = result[i];
                        log.debug("Artifact Info: '" + artifact[1] + "'");
                        _b = (_a = libs).push;
                        return [4 /*yield*/, this.getLibrary(artifact)];
                    case 2:
                        _b.apply(_a, [_c.sent()]);
                        c.next();
                        _c.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        wrap = [];
                        for (i = 0; i < libs.length; i++)
                            wrap.push(libs[i].wrap());
                        return [4 /*yield*/, fs.writeAsync("versions/" + version + "/" + version + "-forge.json", wrap, { jsonIndent: 4 })];
                    case 5:
                        _c.sent();
                        c.next();
                        return [2 /*return*/, libs];
                }
            });
        });
    };
    return LibraryHelper;
}());
exports.LibraryHelper = LibraryHelper;
var Maven1 = /** @class */ (function () {
    function Maven1() {
        this.url = "https://repo1.maven.org/maven2";
        this.artifacts = [
            ["org.ow2.asm", "asm-all", "5.2"],
            ["org.apache.maven", "maven-artifact", "3.5.3"]
        ];
    }
    return Maven1;
}());
exports.Maven1 = Maven1;
var MavenCentral = /** @class */ (function () {
    function MavenCentral() {
        this.url = "http://central.maven.org/maven2";
        this.artifacts = [
            ["org.scala-lang.plugins", "scala-continuations-library_2.11", "1.0.2"],
            ["org.scala-lang.plugins", "scala-continuations-plugin_2.11.1", "1.0.2"],
            ["org.scala-lang", "scala-actors-migration_2.11", "1.1.0"],
            ["org.scala-lang", "scala-compiler", "2.11.1"],
            ["org.scala-lang", "scala-library", "2.11.1"],
            ["org.scala-lang", "scala-reflect", "2.11.1"],
            ["org.scala-lang.modules", "scala-parser-combinators_2.11", "1.0.1"],
            ["org.scala-lang.modules", "scala-swing_2.11", "1.0.1"],
            ["org.scala-lang.modules", "scala-xml_2.11", "1.0.2"],
            ["com.typesafe", "config", "1.2.1"],
            ["com.typesafe.akka", "akka-actor_2.11", "2.3.3"],
            ["net.sf.trove4j", "trove4j", "3.0.3"]
        ];
    }
    return MavenCentral;
}());
exports.MavenCentral = MavenCentral;
var GeotoolkitMaven = /** @class */ (function () {
    function GeotoolkitMaven() {
        this.url = "http://maven.geotoolkit.org";
        this.artifacts = [
            ["java3d", "vecmath", "1.5.2"]
        ];
    }
    return GeotoolkitMaven;
}());
exports.GeotoolkitMaven = GeotoolkitMaven;
var MinecraftLibraries = /** @class */ (function () {
    function MinecraftLibraries() {
        this.url = "https://libraries.minecraft.net";
        this.artifacts = [
            ["net.minecraft", "launchwrapper", "1.12"]
        ]; //https://libraries.minecraft.net/net/minecraft/launchwrapper/1.12/launchwrapper-1.12.jar
    }
    return MinecraftLibraries;
}());
exports.MinecraftLibraries = MinecraftLibraries;
var SpongeMaven = /** @class */ (function () {
    function SpongeMaven() {
        this.url = "https://repo.spongepowered.org/maven";
        this.artifacts = [
            ["lzma", "lzma", "0.0.1"]
        ];
    }
    return SpongeMaven;
}());
exports.SpongeMaven = SpongeMaven;
var ForgeFiles = /** @class */ (function () {
    function ForgeFiles() {
        this.url = "https://files.minecraftforge.net/maven";
        this.artifacts = [
            ["net.minecraftforge", "forge", "1.12.2-14.23.4.2759", "universal"]
        ];
    }
    return ForgeFiles;
}());
exports.ForgeFiles = ForgeFiles;
var repositories = [
    new MinecraftLibraries(),
    new GeotoolkitMaven(),
    new MavenCentral(),
    new SpongeMaven(),
    new Maven1()
];
//# sourceMappingURL=ForgeUtil.js.map