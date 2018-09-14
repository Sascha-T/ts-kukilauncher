import {Endpoints} from "./Constants";
import * as fetch from 'node-fetch';

export class YggdrasilUtil {

    public static async authenticate(user: string, pass: string): Promise<AuthenticationResult> {
        let payload: AuthenticationPayload = new AuthenticationPayload(user, pass);
        let res: fetch.Response = await fetch.default(Endpoints.AUTHENTICATION, new class implements fetch.RequestInit {
            method: string = 'POST';
            body: fetch.BodyInit = payload.generatePayload();
            headers: fetch.HeaderInit = AuthenticationPayload.generateHeaders();
        });

        let json: any = await res.json();

        let result: AuthenticationResult;
        if(json.hasOwnProperty('error'))
            result = new ErrorAuthenticationResult(json["cause"] || "", json["errorMessage"], json["error"]);
        else if(!json.hasOwnProperty('selectedProfile'))
            result = new ErrorAuthenticationResult("", "Your Mojang profile has no attached Minecraft profile!", "Not Found");
        else
            result = new ValidAuthenticationResult(json["selectedProfile"]["name"], json["accessToken"], json["selectedProfile"]["id"]);
        return result;
    }

}

class AuthenticationPayload {

    username: string;
    password: string;


    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
    }

    static generateHeaders(): fetch.HeaderInit {
        let headers: fetch.Headers = new fetch.Headers();
        headers.append('Content-Type', "application/json");
        return headers;
    }

    public generatePayload(): string {
        return JSON.stringify({
            agent: {
                name: "Minecraft",
                version: 1
            },
            username: this.username,
            password: this.password,
            clientToken: Math.random(), //TODO
            requestUser: true
        });
    }

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