import * as path from "path";
import * as vscode from "vscode";
import { INode } from "./INode";
import { IConnection } from "./Connection";

export class ColumnNode implements INode {
    constructor(private readonly connection:IConnection, private readonly column: any ) {
    }

    public getTreeItem(): vscode.TreeItem {
        return {
            label: `${this.column.COLUMN_NAME} : ${this.column.DATA_TYPE_NAME} (${this.column.LENGTH})    \n${this.column.COMMENTS||''}`,
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: "column",
            iconPath: path.join(__filename, "..", "..", "..", "media", this.column.INDEX_TYPE === "FULL" ? "primary.gif" : "message_info.png"),
        };
    }

    public async getChildren(): Promise<INode[]> {
        return [];
    }
}