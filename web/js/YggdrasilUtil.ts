import {Endpoints, Paths} from "./Constants";
import * as crypto from 'crypto';
import * as fetch from 'node-fetch';
import * as path from 'path';
import * as sys from 'os';
import * as fs from 'fs-jetpack';
import * as log from 'signale';

const xfs = fs.cwd(Paths.APPDATA.toString());

log.info(getUniqueIdentifier());
log.info(getUniqueIdentifier());
log.info(getUniqueIdentifier());
log.info(getUniqueIdentifier());

export class YggdrasilUtil {

    private static hasLastLogin: boolean;
    public static lastLogin: LastLogin;

    public static async checkLastlogin(): Promise<LastLogin | undefined> {
        if (await xfs.existsAsync("lastlogin") === 'file') {
            let lastlogin: string = await xfs.readAsync("lastlogin");
            if (lastlogin) {
                let data: string = Buffer.from(lastlogin, 'base64').toString('utf8');
                log.info(data);
                this.lastLogin = JSON.parse(data);
                this.hasLastLogin = true;
                return this.lastLogin;
            }
        }
        this.hasLastLogin = false;
        return undefined;
    }

    public static login(user: string, pass: string, lastlogin: boolean): Promise<AuthenticationResult> {
        if(lastlogin)
            return this.authenticate(new TokenPayload(this.lastLogin.token, this.lastLogin.name, this.lastLogin.uuid));
        else
            return this.authenticate(new LoginPayload(user, pass));
    }

    public static async authenticate(payload: Payload): Promise<AuthenticationResult> {
        let res: fetch.Response = await fetch.default(payload.getEndpoint(), new class implements fetch.RequestInit {
            method: string = 'POST';
            body: fetch.BodyInit = JSON.stringify(payload.generatePayload());
            headers: fetch.HeaderInit = generateHeaders();
        });

        let json: any = await res.json();

        let result: AuthenticationResult;
        if(json.hasOwnProperty('error'))
            result = new ErrorAuthenticationResult(json["cause"] || "", json["errorMessage"], json["error"]);
        else if(!json.hasOwnProperty('selectedProfile'))
            result = new ErrorAuthenticationResult("", "Your Mojang profile has no attached Minecraft profile!", "Not Found");
        else {
            let mail: string = payload.generatePayload()["username"];
            if(!mail || mail.indexOf('@') === -1)
                mail = this.lastLogin.email || "";
            result = new ValidAuthenticationResult(json["selectedProfile"]["name"], json["accessToken"], json["selectedProfile"]["id"]);
            await this.updateLastlogin(result, mail);
        }
        return result;
    }

    private static async updateLastlogin(auth: ValidAuthenticationResult, mail: string): Promise<void> {
        if(await xfs.existsAsync('lastlogin') === 'file')
            await xfs.removeAsync('lastlogin');

        let data: LastLogin = {
            name: auth.name,
            uuid: auth.uuid,
            token: auth.token,
            email: mail
        };
        let encoded: string = Buffer.from(JSON.stringify(data)).toString('base64');

        return await xfs.writeAsync('lastlogin', encoded);
    }

}

enum AuthenticationType {
    Login,
    Refresh
}

interface Payload {

    type: AuthenticationType;

    generatePayload(): object;
    getEndpoint(): string;
}

class LoginPayload implements Payload {

    public static async login(user: string, pass: string): Promise<AuthenticationResult> {
        return await YggdrasilUtil.authenticate(new LoginPayload(user, pass));
    }

    password: string;
    username: string;

    type: AuthenticationType;

    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;

        this.type = AuthenticationType.Login;
    }

    generatePayload(): object {
        return {
            agent: {
                name: "Minecraft",
                version: 1
            },
            username: this.username,
            password: this.password,
            clientToken: getUniqueIdentifier(),
            requestUser: true
        };
    }

    getEndpoint(): string {
        return "https://authserver.mojang.com/authenticate";
    }

}

class TokenPayload implements Payload {

    public static login(token: string, name: string, uuid: string): Promise<AuthenticationResult> {
        return YggdrasilUtil.authenticate(new TokenPayload(token, name, uuid));
    }

    uuid: string;
    name: string;
    token: string;

    type: AuthenticationType;

    constructor(token: string, name: string, uuid: string) {
        this.token = token;
        this.name = name;
        this.uuid = uuid;
        this.type = AuthenticationType.Refresh;
    }

    generatePayload(): object {
        return {
            "accessToken": this.token,
            "clientToken": getUniqueIdentifier(),

            /*"selectedProfile": { // And I thought ""optional; sending it will result in an error"" was a typo -.-
                "id": this.uuid,
                "name": this.name
            },*/
            "requestUser": true
        }
    }

    getEndpoint(): string {
        return "https://authserver.mojang.com/refresh";
    }

}

function getUniqueIdentifier(): String {
    let data: string = sys.arch() + sys.cpus() + sys.type() + sys.homedir() + sys.endianness() + sys.tmpdir();
    let hash: crypto.Hash = crypto.createHash('sha512');
    hash.update(data, "utf8");
    return hash.digest().toString('hex');
}

function generateHeaders(): fetch.HeaderInit {
    let headers: fetch.Headers = new fetch.Headers();
    headers.append('Content-Type', "application/json");
    return headers;
}

declare type LastLogin = {
    token: string,
    email: string,
    name: string,
    uuid: string
}

export interface AuthenticationResult {

    token: string;
    name: string;
    uuid: string;

    result: boolean;

    errorType: string;
    errorMessage: string;
    errorCause: string;

}

class ValidAuthenticationResult implements AuthenticationResult {

    errorCause: string;
    errorMessage: string;
    errorType: string;

    result: boolean;

    name: string;
    token: string;
    uuid: string;


    constructor(name: string, token: string, uuid: string) {
        this.name = name;
        this.token = token;
        this.uuid = uuid;

        this.errorCause = "";
        this.errorMessage = "";
        this.errorType = "";

        this.result = true;
    }

}
class ErrorAuthenticationResult implements AuthenticationResult {

    errorCause: string;
    errorMessage: string;
    errorType: string;

    result: boolean;

    name: string;
    token: string;
    uuid: string;


    constructor(errorCause: string, errorMessage: string, errorType: string) {
        this.errorCause = errorCause;
        this.errorMessage = errorMessage;
        this.errorType = errorType;

        this.result = false;

        this.name = "";
        this.token = "";
        this.uuid = "";
    }
}