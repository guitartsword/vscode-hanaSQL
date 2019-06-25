import * as request from 'request';
import { Request } from './request';


let token:string = 'unsafe';
let cookieMap:Map<string, string> = new Map();
export async function login(config: any) {
	const hanaRequest = new Request(
        `http://${config.host}${config.databaseName ? '-' + config.databaseName.toLowerCase() : ''}`,
        config.webIdePort
    );
    const loginPath = '/sap/hana/xs/formLogin/login.xscfunc';
    const headers: request.Headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRF-Token': 'unsafe'
    };
    const options: request.Options = {
        url: loginPath,
        method: 'POST',
        form: {
            'xs-username': config.user,
            'xs-password': config.password
        },
        headers
    };
    const {response} =  await hanaRequest.post(options);
    setCookies(response.headers['set-cookie']);
    return;
}

export async function getXCSRFToken(config:any){
    const hanaRequest = new Request(
        `http://${config.host}${config.databaseName ? '-' + config.databaseName.toLowerCase() : ''}`,
        config.webIdePort
    );
    const csrfPath = '/sap/hana/ide/common/remote/server/csrf.xsjs';
    const cookie = getCookies();
    const headers: request.Headers = {
        cookie
    };
    const options: request.Options = {
        url: csrfPath,
        headers
    };
    hanaRequest.xcsrf = 'fetch';
    const {response, body} = await hanaRequest.get(options);
    setCookies(response.headers['set-cookie']);
    return response.headers['x-csrf-token'];
}
export async function setToken(xToken:string){
    token = xToken;
}
export function setCookie(key:string, val:string){
    cookieMap.set(key, val);
}
export async function getFile(config:any, path:string){
    const baseFilePath = '/sap/hana/xs/dt/base/file/';
    const hanaRequest = new Request(
        `http://${config.host}${config.databaseName ? '-' + config.databaseName.toLowerCase() : ''}`,
        config.webIdePort
    );
    const cookie = getCookies();
    const headers: request.Headers = {
        cookie
    };
    const options: request.Options = {
        url: `${baseFilePath}${path}`,
        headers
    };
    hanaRequest.xcsrf = token;
    const { body } = await hanaRequest.get(options);
    return body;
}

function setCookies(cookies:Array<string>=[]){
    cookies.forEach(cookie => {
        const keyvalcookies = cookie.split(';');
        keyvalcookies.forEach(keyval => {
            const [key, val] = keyval.split('=');
            cookieMap.set(key, val);
        });
    });
}

function getCookies():string{
    const cookiesEntries = cookieMap.entries();
    let cookieStrings = [];
    for(const cookie of cookiesEntries){
        const [key, val] = cookie;
        cookieStrings.push(`${key}=${val}`);
    }
    return cookieStrings.join(';');
}