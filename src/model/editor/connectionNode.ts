import * as path from "path";
import * as vscode from "vscode";
import * as keytar from "keytar";
// import { AppInsightsClient } from "../../common/appInsightsClient";
import { Constants } from "../../util/constants";
import {  Memory, Global, addConnection  } from "../../util/storage";
import { getBaseFolder } from "../../util/hanaeditor";
import { DBTreeDataProvider } from "../../DBTreeProvider";
import { FolderNode } from "./folderNode";
// import { FileNode } from "./fileNode";
// import { InfoNode } from "./infoNode";
import { INode } from "../INode";
import { IConnection } from "../Connection";

export class ConnectionNode implements INode {
    constructor(private readonly id:string, private readonly connection: IConnection) {
    }
    public async connectToNode(callback:(id:string)=>Promise<void>) {
        const connection = {...this.connection};
        Memory.state.update('activeConnection', connection);
        await callback(this.id);
    }
    public getTreeItem(): vscode.TreeItem {
        const id = `${this.connection.user}@${this.connection.host}-${this.connection.databaseName}`;
        const activeConnection = Memory.state.get<IConnection>('activeConnection');
        return {
            label: id,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "connection",
            iconPath: path.join(__filename, "..", "..", "..", "media", this.equalsConnection(activeConnection) ? "db-active.png": 'db-inactive.png'),
        };
    }
    private equalsConnection(activeConnection:IConnection|undefined):Boolean{
        if(!activeConnection){
            return false;
        }
        if(this.connection.host !== activeConnection.host){
            return false;
        }
        if(this.connection.user !== activeConnection.user){
            return false;
        }
        if(this.connection.port !== activeConnection.port){
            return false;
        }
        if(this.connection.instanceNumber !== activeConnection.instanceNumber){
            return false;
        }
        if(this.connection.databaseName !== activeConnection.databaseName){
            return false;
        }
        return true;
    }
    public async getChildren(): Promise<INode[]> {
        const {Children}= await getBaseFolder<Array<any>>(this.connection, '/');
        return Children.map<FolderNode>(({Name}: {Name:string}) => {
            return new FolderNode(this.connection, Name, `/${Name}`);
        });
    }

    public async deleteConnection(context: vscode.ExtensionContext, treeProvider: DBTreeDataProvider) {
        // AppInsightsClient.sendEvent("deleteConnection");
        const connections = context.globalState.get<{ [key: string]: IConnection }>(Constants.ConnectionsKeys);
        if(connections){
            delete connections[this.id];
        }
        await context.globalState.update(Constants.ConnectionsKeys, connections);

        await keytar.deletePassword(Constants.ExtensionId, this.id);

        treeProvider.refresh();
    }
}