import {Headers, Options} from 'request';
import { Request } from './request';

export class Editor {
    private cookieMap:Map<string, string> = new Map();
    constructor(private readonly request: Request, private readonly user:string, private readonly password:string){
        this.login();
    }
    async login(){
        const loginPath = '/sap/hana/xs/formLogin/login.xscfunc';
        const headers: Headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        this.request.xcsrf = 'unsafe';
        const options: Options = {
            url: loginPath,
            method: 'POST',
            form: {
                'xs-username': this.user,
                'xs-password': this.password
            },
            headers
        };
        const {response} =  await this.request.post(options);
        this.setCookies(response.headers['set-cookie']);
        await this.setXCSRFToken();
    }
    getXCSRFToken():string{
        return this.request.xcsrf;
    }
    private async setXCSRFToken():Promise<any>{
        const csrfPath = '/sap/hana/ide/common/remote/server/csrf.xsjs';
        const cookie = this.getCookies();
        const headers: Headers = {
            cookie
        };
        const options: Options = {
            url: csrfPath,
            headers
        };
        this.request.xcsrf = 'fetch';
        const {response, body} = await this.request.get(options);
        this.setCookies(response.headers['set-cookie']);
        let token = response.headers['x-csrf-token'];
        if(Array.isArray(token)){
            token = token[0];
        }
        this.request.xcsrf = token || 'unsafe';
    }
    async setToken(xToken:string){
        this.request.xcsrf = xToken;
    }
    async getFolder(path:string){
        await this.login();
        const baseFilePath = '/sap/hana/xs/dt/base/file';
        const cookie = this.getCookies();
        const headers: Headers = {
            cookie
        };
        const options: Options = {
            url: `${baseFilePath}${path}?depth=1`,
            headers
        };
        const { body } = await this.request.get(options);
        return JSON.parse(body);
    }
    async getFile(path:string){
        await this.login();
        const baseFilePath = '/sap/hana/xs/dt/base/file';
        const cookie = this.getCookies();
        const headers: Headers = {
            cookie
        };
        const options: Options = {
            url: `${baseFilePath}${path}`,
            headers
        };
        const { response, body } = await this.request.get(options);
        return body;
    }
    private setCookies(cookies:Array<string>=[]){
        cookies.forEach(cookie => {
            const keyvalcookies = cookie.split(';');
            keyvalcookies.forEach(keyval => {
                const [key, val] = keyval.split('=');
                this.cookieMap.set(key, val);
            });
        });
    }
    private getCookies():string{
        const cookiesEntries = this.cookieMap.entries();
        let cookieStrings = [];
        for(const cookie of cookiesEntries){
            const [key, val] = cookie;
            cookieStrings.push(`${key}=${val}`);
        }
        return cookieStrings.join(';');
    }
}