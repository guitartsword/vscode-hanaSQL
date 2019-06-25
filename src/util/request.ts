import * as request from 'request';

export class Request{
    private baseUrl:string;
    public xcsrf:string = 'unsafe';

    public constructor(baseUrl:string, port:number = 80) {
        this.baseUrl = `${baseUrl}:${port}`;
    }

    public async post(options:request.Options){
        
        const overridenOptions = this._getOptions('POST', options);
        return await this._request(overridenOptions);
    }
    public async get(options:request.Options){
        const overridenOptions = this._getOptions('GET', options);
        return await this._request(overridenOptions);
    }
    public async put(options:request.Options){
        const overridenOptions = this._getOptions('PUT', options);
        return await this._request(overridenOptions);
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
    private async _request(options:request.Options){
        return await new Promise<any>((resolve, reject) => {
            request(options, function(error:any, response:request.Response, body: string){
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