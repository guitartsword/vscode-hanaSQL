import * as path from "path";
import * as vscode from "vscode";
import { INode } from "../INode";
import { FileNode } from "./fileNode";
import { Editor } from "../../util/login";
import { getConnectionId } from "../../util/storage";

export class FolderNode implements INode {
    constructor(private readonly editor:Editor, private readonly name: string, private readonly path: string, private readonly connectionId:string) {
    }

    public getTreeItem(): vscode.TreeItem {
        return {
            label: this.name,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: 'folder'
        };
    }

    public async getChildren(): Promise<INode[]> {
        const {Children}:{Children:Array<any>} = await this.editor.getFolder(this.path);
        return Children.map<INode>(({Name, Directory}:{Name:string, Directory:boolean}) => {
            if(Directory){
                return new FolderNode(this.editor, Name, `${this.path}/${Name}`, this.connectionId);
            }
            return new FileNode(this.connectionId, Name, `${this.path}/${Name}`);
        });
    }
}