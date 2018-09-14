"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var sys = require("os");
var Endpoints;
(function (Endpoints) {
    Endpoints["MANIFEST"] = "https://launchermeta.mojang.com/mc/game/version_manifest.json";
    Endpoints["AUTHENTICATION"] = "https://authserver.mojang.com/authenticate";
})(Endpoints = exports.Endpoints || (exports.Endpoints = {}));
var Paths;
(function (Paths) {
    Paths[Paths["APPDATA"] = electron_1.remote.getCurrentWindow()["appdata"]] = "APPDATA";
})(Paths = exports.Paths || (exports.Paths = {}));
var SystemHelper = /** @class */ (function () {
    function SystemHelper() {
    }
    SystemHelper.os = function () {
        var platform = sys.platform();
        return platform.replace("darwin", "osx").replace("win32", "windows");
    };
    SystemHelper.temp = function () {
        return sys.tmpdir();
    };
    SystemHelper.classpathSeparatorBecauseJavaIsFuckingStupid = function () {
        switch (sys.platform()) {
            case 'darwin':
                return ':';
            case 'win32':
                return ';';
            default:
                return ':';
        }
    };
    return SystemHelper;
}());
exports.SystemHelper = SystemHelper;
//# sourceMappingURL=Constants.js.map