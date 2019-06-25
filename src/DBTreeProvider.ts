// import * as uuidv1 from "uuid/v1";
import * as vscode from "vscode";
import * as keytar from "keytar";
// import { AppInsightsClient } from "./common/appInsightsClient";
import { Constants } from "./util/constants";
import { Memory, Global } from "./util/storage";
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

    public async addConnection() {
        // AppInsightsClient.sendEvent("addConnection.start");
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

        const portString = await vscode.window.showInputBox({ prompt: "The port number to connect to", placeHolder: "port", ignoreFocusOut: true, value: '30013' });
        const port = Number(portString);
        if (!port) {
            return;
        }


        let connections = Global.state.get<{ [key: string]: IConnection }>(Constants.ConnectionsKeys);

        if (!connections) {
            connections = {};
        }

        const id = `${user}@${host}$${databaseName}$:${port}`;
        connections[id] = {
            host,
            user,
            port,
            instanceNumber,
            databaseName
        };

        if (password) {
            await keytar.setPassword(Constants.ExtensionId, id, password);
        }
        await Global.state.update(Constants.ConnectionsKeys, connections);
        this.refresh();
        Memory.state.update('activeConnection', {
            password,
            ...connections[id]
        });
        // AppInsightsClient.sendEvent("addConnection.end");
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
                connections[id].password = password;
                ConnectionNodes.push(new ConnectionNode(id, connections[id]));
                const activeConnection = Memory.state.get('activeConnection');
                if (!activeConnection) {
                    Memory.state.update('activeConnection', {
                        host: connections[id].host,
                        user: connections[id].user,
                        password,
                        port: connections[id].port,
                        certPath: connections[id].certPath,
                    });
                }
            }
        }
        return ConnectionNodes;
    }
}