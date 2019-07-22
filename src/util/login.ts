import * as request from 'request';
import { Request } from './request';
import { IConnection } from '../model/Connection';


let token:string = 'unsafe';
let cookieMap:Map<string, string> = new Map();
export async function login(request: Request, user:string, password:string) {
    const loginPath = '/sap/hana/xs/formLogin/login.xscfunc';
    const headers: request.Headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRF-Token': 'unsafe'
    };
    const options: request.Options = {
        url: loginPath,
        method: 'POST',
        form: {
            'xs-username': user,
            'xs-password': password
        },
        headers
    };
    const {response} =  await request.post(options);
    setCookies(response.headers['set-cookie']);
    return;
}

export async function getXCSRFToken(request:Request):Promise<string|string[]>{
    const csrfPath = '/sap/hana/ide/common/remote/server/csrf.xsjs';
    const cookie = getCookies();
    const headers: request.Headers = {
        cookie
    };
    const options: request.Options = {
        url: csrfPath,
        headers
    };
    request.xcsrf = 'fetch';
    const {response, body} = await request.get(options);
    setCookies(response.headers['set-cookie']);
    return response.headers['x-csrf-token'] || 'unsafe';
}
export async function setToken(xToken:string){
    token = xToken;
}
export function setCookie(key:string, val:string){
    cookieMap.set(key, val);
}
export async function getFile(request: Request, path:string){
    const baseFilePath = '/sap/hana/xs/dt/base/file';
    const cookie = getCookies();
    const headers: request.Headers = {
        cookie
    };
    const options: request.Options = {
        url: `${baseFilePath}${path}`,
        headers
    };
    request.xcsrf = token;
    const { body } = await request.get(options);
    return body;
}
export async function getFolder(request: Request, path:string){
    const baseFilePath = '/sap/hana/xs/dt/base/file';
    const cookie = getCookies();
    const headers: request.Headers = {
        cookie
    };
    const options: request.Options = {
        url: `${baseFilePath}${path}?depth=1`,
        headers
    };
    request.xcsrf = token;
    const { body } = await request.get(options);
    return JSON.parse(body);
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