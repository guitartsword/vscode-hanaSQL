import * as vscode from 'vscode';
import * as hdb from 'hdb';
import * as keytar from 'keytar';
import { Memory } from "./storage";
import { IConnection } from '../model/Connection';
import { ConnectionNode } from '../model/connectionNode';
import { Constants } from './constants';
import { INode } from '../model/INode';

function getConfig(){
    return Memory.state.get<vscode.WorkspaceConfiguration>('vscode-hana');
}
function parseQuery(rawQuery:string):string{
    let query = rawQuery;
    query = query.trim();
    if(!query.substr(0,6).toUpperCase().startsWith('SELECT')){
        return query;
    }
    const hasLimit = query.replace(/\s+/g, ' ').match(/^SELECT.+LIMIT \d+ *(OFFSET \d+ *)?;?/i);
    if(hasLimit){
        return query;
    }
    if(query.endsWith(';')){
        query = query.slice(0,-1);
    }
    const conf = getConfig();
    let maxTableCount = 100;
    if(conf){
        maxTableCount = conf.get('maxTableCount', 10);
    }
    return query + ' LIMIT ' + maxTableCount;
}
export async function executeQuery(conf:IConnection, rawQuery:string):Promise<Array<any>>{
    const client = hdb.createClient(conf);
    let queryResult = [];
    const query = parseQuery(rawQuery);
    const executionPromise:Promise<Array<Object>> = new Promise(function(res, rej){
        client.connect(function(err:any){
            if(err){
                queryResult = {...err};
                delete queryResult.stack;
                console.warn(err.stack);
                // vscode.window.showWarningMessage('Connection was not possible');
                rej(err);
                return;
            }
            client.exec(query, function (err:any, rows:Array<Object>) {
                client.end();
                if (err) {
                  console.error('Execute error:', err);
                  vscode.window.showWarningMessage(err.toString());
                  rej(err);
                }
                res(rows);
              });
        });
    });
    return executionPromise;
}

export async function createSQLTextDocument(sql: string = "") {
    const textDocument = await vscode.workspace.openTextDocument({ content: sql, language: "sql" });
    return vscode.window.showTextDocument(textDocument);
}

export async function useConnection(connection:ConnectionNode){
    const id = connection.connectToNode();
    const activeConnection = Memory.state.get<{[key: string]:any}>('activeConnection');
    if(!activeConnection){
        return;
    }
    if(!activeConnection.password){
        activeConnection.password = await keytar.getPassword(Constants.ExtensionId, id) || '';
    }
    if(!activeConnection.password){
        activeConnection.password = await vscode.window.showInputBox({
            placeHolder: 'Password'
        });
    }
    return;
}