export interface IConnection {
    readonly host: string;
    readonly user: string;
    password?: string;
    readonly port: number;
    databaseName?: string;
    readonly instanceNumber?: string;
    multipleStatements?: boolean;
    readonly certPath?: string;
}