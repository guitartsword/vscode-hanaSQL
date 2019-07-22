// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import * as hanaApi from './util/login';
import * as hanadb from './util/hanadb';
import * as keytar from 'keytar';

import {SqlResultWebView} from './sqlResultsWebView';
import {DBTreeDataProvider} from './DBTreeProvider';
import {EditorTreeProvider} from './EditorTreeProvider';
import { Global, WorkSpace, Memory, addConnection } from './util/storage';
import { IConnection } from './model/Connection';
import { Constants } from './util/constants';
import { ConnectionNode } from './model/connectionNode';
import { INode } from './model/INode';
import { DatabaseNode } from './model/databaseNode';
import { getBaseFile } from './util/hanaeditor';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	const subscriptions = context.subscriptions;
	Global.setState(context.globalState);
	WorkSpace.setState(context.workspaceState);
	Memory.setState();
	Memory.state.update('vscode-hana', vscode.workspace.getConfiguration('vscode-hana'));
	// const document = await vscode.workspace.openTextDocument(vscode.Uri.parse('file://' + vscode.workspace.rootPath + '/' + 'hana-config.json'));
	// const config = JSON.parse(document.getText());
	let xcsrfToken = 'unsafe';
	const contentProvider = new class implements vscode.TextDocumentContentProvider {

		// emitter and its event
		onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
		onDidChange = this.onDidChangeEmitter.event;

		async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
			// simply invoke cowsay, use uri-path as text
			return uri.path;
		}
	};

	const dbTreeDataProvider = new DBTreeDataProvider(context);
	const editorTreeProvider = new EditorTreeProvider(context);
	
	subscriptions.push(vscode.window.registerTreeDataProvider('hanadb', dbTreeDataProvider));
	subscriptions.push(vscode.window.registerTreeDataProvider('hanaeditor', editorTreeProvider));
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "hana-editor" is now active!');
	// subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('hanafile', myProvider));

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	subscriptions.push(vscode.commands.registerCommand('hanaide.edit', async () => {
		let what = await vscode.window.showInputBox({ placeHolder: 'document name' });
		if (what) {
			let uri = vscode.Uri.parse('hanafile:' + what);
			let doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
			const hanaDoc = await vscode.window.showTextDocument(doc);
		}
	}));
	subscriptions.push(vscode.commands.registerCommand('hana.executeQuery', async () => {
		const connection = Memory.state.get<IConnection>('activeConnection');
		if(!connection){
			vscode.window.showInformationMessage('No connection to DB');
			return;
		}
		const editor = vscode.window.activeTextEditor;
		if(!editor){
			return;
		}
		let text:string; 
		if(editor.selection.isEmpty){
			text = editor.document.getText();
		}else{
			text = editor.document.getText(editor.selection);
		}
		
		
		if(!connection.databaseName){
			connection.databaseName = await vscode.window.showInputBox({
				placeHolder: 'Tenant Name'
			}) || '';
		}
		const data = await hanadb.executeQuery(connection, text);
		SqlResultWebView.show(data, `Results[${connection.databaseName.toUpperCase()}]: ${data.length} rows`);
	}));
	subscriptions.push(vscode.commands.registerCommand('hanaide.createConnection', async () => {
		await addConnection();
		dbTreeDataProvider.refresh();
		editorTreeProvider.refresh();
	}));

	subscriptions.push(vscode.commands.registerCommand('hanaide.deleteConnection', async (connection: ConnectionNode|undefined) => {
		if(connection){
			connection.deleteConnection(context, dbTreeDataProvider);
			return;
		}
		Global.state.update(Constants.ConnectionsKeys, {});
		vscode.window.showInformationMessage('Removed all connections successfully');
	}));

	subscriptions.push(vscode.commands.registerCommand('hanaide.useConnection', async (connection: ConnectionNode|undefined) => {
		if(connection){
			await connection.connectToNode(async (id:string)=>{
				const connection = Memory.state.get<{[key: string]:any}>('activeConnection');
				if(!connection){
					return;
				}
				if(!connection.password){
					connection.password = await keytar.getPassword(Constants.ExtensionId, id) || '';
				}
				if(!connection.password){
					connection.password = await vscode.window.showInputBox({
						placeHolder: 'Password'
					});
				}
			});
			dbTreeDataProvider.refresh(connection);
			const previousConnection = Memory.state.get<INode>('previousConnection');
			if(previousConnection){
				dbTreeDataProvider.refresh(previousConnection);
			}
			Memory.state.update('previousConnection', connection);
			return;
		}
		const items = Global.state.get<{ [key: string]: IConnection }>(Constants.ConnectionsKeys);
		if(!items){
			return;
		}
		const db = await vscode.window.showQuickPick( Object.keys(items), { placeHolder: 'Choose connection' } );
		if(db){
			const connection = items[db];
			let password;
			if(!connection.password){
				password = await keytar.getPassword(Constants.ExtensionId, db) || '';
			}
			Memory.state.update('activeConnection',{
				...connection,
				password: connection.password || password
			});
		}
	}));
	subscriptions.push(vscode.commands.registerCommand('hanaide.refresh', (node:INode) => dbTreeDataProvider.refresh(node)));
	subscriptions.push(vscode.commands.registerCommand('hanaide.filterTables', async (node:DatabaseNode) => {
		let searchText = await vscode.window.showInputBox({
			placeHolder: 'Search Table'
		});
		if(searchText === undefined) {
			return;
		}
		node.setSearchText(searchText);
		dbTreeDataProvider.refresh(node);
	}));
	subscriptions.push(vscode.commands.registerCommand('hanaide.openFile', async (connection: IConnection, path:string) => {
		const data = getBaseFile(connection, path);
		let uri = vscode.Uri.parse('hanaeditor:' + path);
		let doc = await vscode.workspace.openTextDocument(uri);
		await vscode.window.showTextDocument(doc);
	}));
}



// this method is called when your extension is deactivated
export function deactivate() {}
