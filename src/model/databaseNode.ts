import * as path from "path";
import * as vscode from "vscode";
import { INode } from "./INode";
import { TableNode } from "./tableNode";
import { IConnection } from "./Connection";
import { executeQuery } from "../util/hanadb";
import { Memory, Global } from "../util/storage";


export class DatabaseNode implements INode {
    constructor(private readonly connection: IConnection, private readonly schema: string) {
    }

    public getTreeItem(): vscode.TreeItem {
        return {
            label: this.schema,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "database",
            iconPath: path.join(__filename, "..", "..", "..", "media", "schema.gif"),
        };
    }

    public async getChildren(): Promise<INode[]> {
        const conf = Memory.state.get<vscode.WorkspaceConfiguration>('vscode-hana');
        const tables = await executeQuery(this.connection, `SELECT TABLE_NAME as "name" FROM M_TABLES WHERE SCHEMA_NAME = '${this.schema}' ORDER BY TABLE_NAME LIMIT 5000`);
        return tables.map<TableNode>(({name}) => {
            return new TableNode(this.connection, this.schema, name);
        });
    }

    public async newQuery() {
        // AppInsightsClient.sendEvent("newQuery", { viewItem: "database" });
        // Utility.createSQLTextDocument();

        Memory.state.update('activeConnection', this.connection);
    }
}