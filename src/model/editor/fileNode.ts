import * as vscode from "vscode";
import { INode } from "../INode";

export class FileNode implements INode {
    constructor(private readonly connectionId:string, private readonly name: string, private readonly path: string) {
    }

    public async getTreeItem(): Promise<vscode.TreeItem> {
        
        return {
            label: this.name,
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: 'file',
            command: {
                command: 'hanaide.openFile',
                title: '',
                arguments: [this.connectionId, this.path]
            }
        };
    }

    public async getChildren(): Promise<INode[]> {
        return [];
    }
}