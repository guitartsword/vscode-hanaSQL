import { Request } from './request';
import * as keytar from 'keytar';
import { IConnection } from '../model/Connection';
import { login, getXCSRFToken, setToken, getFile, getFolder } from './login';
import { Constants } from './constants';
import { getConnectionId } from './storage';

export async function getBaseFolder<T>(activeWebConnection:IConnection, path:string = '/'): Promise<{[Children:string]:Array<any>}>{
    const {user, host, webApiPort, databaseName} = activeWebConnection;
    const request = new Request(`http://${host}-${databaseName}`, webApiPort);
    // let { body:json } = await request.get<string>({url: `/sap/hana/xs/dt/base/file${path}?depth=1`});
    try {
        return await getFolder(request, path);
    } catch (error) {
        const id = getConnectionId(activeWebConnection);
        const password = await keytar.getPassword(Constants.ExtensionId, id);
        if(!password){
            return {};
        }
        await login(request, user, password);
        const token = await getXCSRFToken(request);
        if(Array.isArray(token)){
            setToken(token[0]);
        }else{
            setToken(token);
        }
        return await getFolder(request, path);
    }
}