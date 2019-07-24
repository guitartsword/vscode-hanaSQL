export interface IConnection {
    readonly host: string;
    readonly user: string;
    readonly password?: string;
    readonly port: number;
    readonly webApiPort: number;
    databaseName?: string;
    readonly instanceNumber?: string;
    multipleStatements?: boolean;
    readonly certPath?: string;
}