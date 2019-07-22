import * as path from "path";
import * as vscode from "vscode";
import { INode } from "../INode";
import { IConnection } from "../Connection";
import { getBaseFolder } from "../../util/hanaeditor";
import { FileNode } from "./fileNode";

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
        const {Children}= await getBaseFolder(this.connection, this.path);
        return Children.map<INode>(({Name, Directory}:{Name:string, Directory:boolean}) => {
            if(Directory){
                return new FolderNode(this.connection, Name, `${this.path}/${Name}`);
            }
            return new FileNode(this.connection, Name, `${this.path}/${Name}`);
        });
    }
}