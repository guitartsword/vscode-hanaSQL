import * as path from "path";
import * as vscode from "vscode";
// import { AppInsightsClient } from "../common/appInsightsClient";
import { Memory } from "../util/storage";
// import { Utility } from "../common/utility";
import { ColumnNode } from "./columnNode";
import { INode } from "./INode";
import { IConnection } from "./Connection";
import { executeQuery, createSQLTextDocument } from "../util/hanadb";

export class TableNode implements INode {
    constructor(private readonly connection: IConnection, private readonly schemaName: string, private readonly tableName: string) {
    }

    public getTreeItem(): vscode.TreeItem {
        return {
            label: this.tableName,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "table",
            iconPath: path.join(__filename, "..", "..", "..", "media", "table.gif"),
        };
    }
    private async getColumns(): Promise<Array<any>>{
        return await executeQuery(this.connection, `SELECT COLUMN_NAME, DATA_TYPE_NAME, INDEX_TYPE, LENGTH, COMMENTS FROM TABLE_COLUMNS WHERE SCHEMA_NAME = '${this.schemaName}' AND TABLE_NAME = '${this.tableName}' ORDER BY POSITION`);
    }
    public async getChildren(): Promise<INode[]> {
        // const connection = Utility.createConnection(this.connection);

        const columns = await this.getColumns();
        return columns.map<ColumnNode>( column => {
            return new ColumnNode(this.connection, column);
        });
    }

    public async selectTop1000() {
        const columns = await this.getColumns();
        const columnMap:Array<string> = columns.map(column => `"${this.tableName}"."${column.COLUMN_NAME}"`);
        const sql = `SELECT\n\t${columnMap.join(',\n\t')}\nFROM\n\t"${this.schemaName}"."${this.tableName}"\nLIMIT\n\t1000;`;
        await createSQLTextDocument(sql);
        // executeQuery(this.connection, sql);
        Memory.state.update('activeConnection', this.connection);
    }
}