// import * as uuidv1 from "uuid/v1";
import * as vscode from "vscode";
import * as keytar from "keytar";
// import { AppInsightsClient } from "./common/appInsightsClient";
import { Constants } from "./util/constants";
import { Memory, Global, addConnection } from "./util/storage";
import { IConnection } from "./model/Connection";
import { ConnectionNode } from "./model/connectionNode";
import { INode } from "./model/INode";

export class DBTreeDataProvider implements vscode.TreeDataProvider<INode> {
    public _onDidChangeTreeData: vscode.EventEmitter<INode> = new vscode.EventEmitter<INode>();
    public readonly onDidChangeTreeData: vscode.Event<INode> = this._onDidChangeTreeData.event;

    constructor(private context: vscode.ExtensionContext) {
    }

    public getTreeItem(element: INode): Promise<vscode.TreeItem> | vscode.TreeItem {
        return element.getTreeItem();
    }

    public getChildren(element?: INode): Thenable<INode[]> | INode[] {
        if (!element) {
            return this.getConnectionNodes();
        }

        return element.getChildren();
    }

    public refresh(element?: INode): void {
        this._onDidChangeTreeData.fire(element);
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
                const activeConnection = Memory.state.get('activeConnection');
                if (!activeConnection) {
                    Memory.state.update('activeConnection', {
                        ...connections[id],
                        password
                    });
                }
            }
        }
        return ConnectionNodes;
    }
}
