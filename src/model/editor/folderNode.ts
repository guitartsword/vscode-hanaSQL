import * as path from "path";
import * as vscode from "vscode";
import { INode } from "../INode";
import { IConnection } from "../Connection";
import { getBaseFolder } from "../../util/hanaeditor";

export class FolderNode implements INode {
    constructor(private readonly connection:IConnection, private readonly name: string, private readonly path: string) {
    }

    public getTreeItem(): vscode.TreeItem {
        return {
            label: this.name,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: 'folder'
        };
    }

    public async getChildren(): Promise<INode[]> {
        const {Children}= await getBaseFolder<Array<any>>(this.connection, this.path);
        return Children.map<FolderNode>(({Name}: {Name:string}) => {
            return new FolderNode(this.connection, Name, `${this.path}/${Name}`);
        });
    }
}