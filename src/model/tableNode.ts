import * as path from "path";
import * as vscode from "vscode";
// import { AppInsightsClient } from "../common/appInsightsClient";
import { Memory } from "../util/storage";
// import { Utility } from "../common/utility";
import { ColumnNode } from "./columnNode";
import { INode } from "./INode";
import { IConnection } from "./Connection";
import { executeQuery } from "../util/hanadb";

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

    public async getChildren(): Promise<INode[]> {
        // const connection = Utility.createConnection(this.connection);

        const columns = await executeQuery(this.connection, `SELECT COLUMN_NAME, DATA_TYPE_NAME, INDEX_TYPE, COMMENTS FROM TABLE_COLUMNS WHERE SCHEMA_NAME = '${this.schemaName}' AND TABLE_NAME = '${this.tableName}' ORDER BY POSITION`);
        return columns.map<ColumnNode>( column => {
            return new ColumnNode(this.connection, column);
        });
    }

    public async selectTop1000() {
        // AppInsightsClient.sendEvent("selectTop1000");
        // const sql = `SELECT * FROM \`${this.database}\`.\`${this.table}\` LIMIT 1000;`;
        // Utility.createSQLTextDocument(sql);

        // const connection = {
        //     host: this.host,
        //     user: this.user,
        //     password: this.password,
        //     port: this.port,
        //     database: this.database,
        //     certPath: this.certPath,
        // };
        Memory.state.update('activeConnection', this.connection);

        // Utility.runQuery(sql, connection);
    }
}