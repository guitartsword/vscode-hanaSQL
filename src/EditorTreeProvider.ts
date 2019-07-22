import * as vscode from 'vscode';
import * as keytar from "keytar";

import { Constants } from "./util/constants";
import { Memory, Global } from "./util/storage";
import { IConnection } from "./model/Connection";
import { ConnectionNode } from "./model/editor/connectionNode";
import { INode } from "./model/INode";


export class EditorTreeProvider implements vscode.TreeDataProvider<INode> {
    public _onDidChangeTreeData: vscode.EventEmitter<INode> = new vscode.EventEmitter<INode>();
    public readonly onDidChangeTreeData: vscode.Event<INode> = this._onDidChangeTreeData.event;
    
    public getChildren(element?: INode): Thenable<INode[]> | INode[] {
        if(!element){
            return this.getConnectionNodes();
        }
        return element.getChildren();
    }
    public getTreeItem(element: INode): Promise<vscode.TreeItem> | vscode.TreeItem {
        return element.getTreeItem();
    }

    private async getConnectionNodes(): Promise<ConnectionNode[]> {
        const connections = Global.state.get<{ [key: string]: IConnection }>(Constants.ConnectionsKeys);
        const ConnectionNodes = [];
        if (connections) {
            for (const id of Object.keys(connections)) {
                const password = await keytar.getPassword(Constants.ExtensionId, id) || '';
                ConnectionNodes.push(new ConnectionNode(id, {
                    ...connections[id],
                    password
                }));
                const activeConnection = Memory.state.get('activeWebConnection');
                if (!activeConnection) {
                    Memory.state.update('activeWebConnection', {
                        ...connections[id],
                        password
                    });
                }
            }
        }
        return ConnectionNodes;
    }

    public refresh(element?: INode): void {
        this._onDidChangeTreeData.fire(element);
    }
}