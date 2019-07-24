import * as request from 'request';

export class Request{
    private baseUrl:string;
    public xcsrf:string = 'unsafe';

    constructor(baseUrl:string, port:number = 80) {
        this.baseUrl = `${baseUrl}:${port}`;
    }

    public async post<T>(options:request.Options):Promise<{body:string|T,response:request.Response}>{
        
        const overridenOptions = this._getOptions('POST', options);
        return await this._request<T>(overridenOptions);
    }
    public async get<T>(options:request.Options): Promise<{body:string|T,response:request.Response}>{
        const overridenOptions = this._getOptions('GET', options);
        return await this._request<T>(overridenOptions);
    }
    public async put<T>(options:request.Options):Promise<{body:string|T,response:request.Response}>{
        const overridenOptions = this._getOptions('PUT', options);
        return await this._request<T>(overridenOptions);
    }
    private _getOptions(method:string, options:request.Options):request.Options{
        const headers = {
            'X-CSRF-Token': this.xcsrf,
        };
        const newOptions:request.Options = {
            method: method,
            baseUrl: this.baseUrl,
            ...options,
        };
        newOptions.headers = {
            ...newOptions.headers,
            ...headers
        };
        return newOptions;
    }
    private async _request<T>(options:request.Options): Promise<{body:string|T,response:request.Response}>{
        return await new Promise<any>((resolve, reject) => {
            request(options, function(error:any, response:request.Response, body: string|T){
                if(error){
                    reject(error);
                }
                resolve({
                    body,
                    response
                });
            });
        });
    }
}