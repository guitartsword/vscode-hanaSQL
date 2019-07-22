import * as vscode from "vscode";
import { INode } from "../INode";
import { IConnection } from "../Connection";

export class FileNode implements INode {
    constructor(private readonly connection:IConnection, private readonly name: string, private readonly path: string) {
    }

    public async getTreeItem(): Promise<vscode.TreeItem> {
        
        return {
            label: this.name,
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: 'file',
            command: {
                command: 'hanaide.openFile',
                title: '',
                arguments: [this.connection, this.path]
            }
        };
    }

    public async getChildren(): Promise<INode[]> {
        return [];
    }
}