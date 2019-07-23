import * as vscode from 'vscode';
import { IConnection } from '../model/Connection';
import { Constants } from './constants';
import * as keytar from "keytar";

export class Global{
    static state:vscode.Memento;
    static setState(context:vscode.Memento){
        Global.state = context;
    }
}
export class WorkSpace{
    static state:vscode.Memento;
    static setState(context:vscode.Memento){
        WorkSpace.state = context;
    }
}
class LocalState{
    constructor(private state:{ [s: string]: any; }){

    }
    get<T>(key: string): T | undefined{
        if(this.state[key]){
            return this.state[key];
        }
        return;
    }
    update(key: string, value: any): Thenable<void>{
        return new Promise(() => {
            this.state[key] = value;
        });
    }
}
export class Memory {
    static setState(){
        Memory.state = new LocalState({});
    }
    static state:LocalState;
}

export function getConnectionId(connection: IConnection) {
    const {user, host, databaseName, port, webApiPort} = connection;
    return `${user}_at_${host}-${databaseName}_DBPORT_${port}_WEBPORT_${webApiPort}`;
}

async function saveConnection(connection: IConnection) {
    const {user, host, databaseName, port, instanceNumber, webApiPort} = connection;
    let connections = Global.state.get<{
        [key: string]: IConnection;
    }>(Constants.ConnectionsKeys);
    if (!connections) {
        connections = {};
    }
    const id = getConnectionId(connection);
    connections[id] = {
        host,
        user,
        port,
        webApiPort,
        instanceNumber,
        databaseName
    };
    const password = connection.password || await keytar.getPassword(Constants.ExtensionId, id);
    if (password) {
        await keytar.setPassword(Constants.ExtensionId, id, password);
    }
    await Global.state.update(Constants.ConnectionsKeys, connections);
    return { connections, id };
}

export async function getConnection(id: string):Promise<IConnection|undefined>{
    let connections = await Global.state.get<{[key:string]:IConnection}>(Constants.ConnectionsKeys);
    if(connections){
        return connections[id];
    }
}

export async function addConnection() {
    const host = await vscode.window.showInputBox({ prompt: "The hostname of the database", placeHolder: "host", ignoreFocusOut: true });
    if (!host) {
        return;
    }
    const databaseName = await vscode.window.showInputBox({ prompt: "The tenant database", placeHolder: "[Optional] DB tenant name", ignoreFocusOut: true });
    if (databaseName === undefined) {
        return;
    }

    const instanceNumber = await vscode.window.showInputBox({ prompt: "Enter the instance number to digit", placeHolder: "Instance Number", ignoreFocusOut: true });
    if (!instanceNumber) {
        return;
    }

    const user = await vscode.window.showInputBox({ prompt: "The user to authenticate as", placeHolder: "user", ignoreFocusOut: true });
    if (!user) {
        return;
    }

    const password = await vscode.window.showInputBox({ prompt: "The password of the user", placeHolder: "password", ignoreFocusOut: true, password: true });
    if (password === undefined) {
        return;
    }

    const portString = await vscode.window.showInputBox({ prompt: "The port number to connect to", placeHolder: "port", ignoreFocusOut: true, value: `3${instanceNumber}13` });
    const port = Number(portString);
    if (!port) {
        return;
    }
    const webPortString = await vscode.window.showInputBox({ prompt: "The port number to connect to", placeHolder: "port", ignoreFocusOut: true, value: '8000' });
    const webApiPort = Number(webPortString);
    if (!webApiPort) {
        return;
    }

    var { connections, id } = await saveConnection({
        host,
        databaseName,
        instanceNumber,
        port,
        user,
        webApiPort,
        password
    });
    Memory.state.update('activeConnection', {
        password,
        ...connections[id]
    });
}