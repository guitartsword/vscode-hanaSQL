import * as path from "path";
import * as vscode from "vscode";
import { INode } from "../INode";
import { IConnection } from "../Connection";

export class FolderNode implements INode {
    constructor(private readonly connection:IConnection, private readonly name: string ) {
    }

    public getTreeItem(): vscode.TreeItem {
        return {
            label: this.name,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: 'folder'
        };
    }

    public async getChildren(): Promise<INode[]> {
        return [];
    }
}