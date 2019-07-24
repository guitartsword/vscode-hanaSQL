# HANA IDE (CATALOG, EDITOR)



## Features

Contains a basic catalog view for you to execute queries with SQL. You can create new connections and connect to a specific
database or tenant and execute queries with the active connection.

Continas a basic HANA file viewer. You can open folders and read file contents.

### Install and configuration
<p align="center">
  <br />
  <img src="https://raw.githubusercontent.com/guitartsword/vscode-hanaSQL/master/images/create_connection.gif"
    alt="Extension configuration" />
  <br />
</p>

### DB usage
<p align="center">
  <br />
  <img src="https://raw.githubusercontent.com/guitartsword/vscode-hanaSQL/master/images/db_usage.gif"
    alt="Database usage" />
  <br />
</p>

## Editor usage
<p align="center">
  <br />
  <img src="https://raw.githubusercontent.com/guitartsword/vscode-hanaSQL/master/images/editor_usage.gif"
    alt="Editor usge" />
  <br />
</p>

## Requirements

You must configure your host file to access HANA servers.

## Extension Settings

This extension contributes the following settings:

* `vscode-hana.maxTableCount`: maximum rows that a query can bring (default: 500)

## Known Issues

It's a basic extension, probably a lot...

* Can't `update` when `CLOB` data is to big.

## Release Notes

Users appreciate release notes as you update your extension.

### 0.1.0

Initial release: Catalog and Editor
Right now the editor is just a viewer, but you can use all vscode functionality to compare files.

**Enjoy!**
