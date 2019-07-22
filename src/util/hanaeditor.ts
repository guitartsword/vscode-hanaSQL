import { Request } from './request';
import {Memory} from './storage';
import { IConnection } from '../model/Connection';


export async function getBaseFile<T>(activeWebConnection:IConnection, path:string = '/'): Promise<T|string>{
    const {host, webApiPort, databaseName} = activeWebConnection;
    const request = new Request(`http://${host}-${databaseName}`, webApiPort);
    const { response, body } = await request.get<string>({url: `/sap/hana/xs/dt/base/file${path}?depth=1`});
    let json = body;
    try {
        json = JSON.parse(body);
    } catch (error) {
        // login()
    }
    return json;
}