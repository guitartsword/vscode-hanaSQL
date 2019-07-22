import * as vscode from "vscode";

export class SqlResultWebView {
    public static show(data:Array<Object>, title:string) {
        const panel = vscode.window.createWebviewPanel("HanaSql", title, vscode.ViewColumn.Two, {
            retainContextWhenHidden: true,
        });

        panel.webview.html = SqlResultWebView.getWebviewContent(data);
    }

    public static getWebviewContent(data:Array<Object>): string {
        const head = [
            "<!DOCTYPE html>",
            "<html>",
            "<head>",
            '<meta http-equiv="Content-type" content="text/html;charset=UTF-8">',
            "<style>table{border-collapse:collapse; }table,td,th{border:1px dotted #ccc; padding:5px;} </style>",
            "</head>",
            "<body>",
        ].join("\n");

        const body = SqlResultWebView.render(data);

        const tail = [
            "</body>",
            "</html>",
        ].join("\n");

        return head + body + tail;
    }

    private static render(rows:Array<any>) {
        if (rows.length === 0) {
            return "No data";
        }

        let head = "";
        for (const field in rows[0]) {
            if (rows[0].hasOwnProperty(field)) {
                head += "<th>" + field + "</th>";
            }
        }
        let body = "<table><tr>" + head + "</tr>";
        rows.forEach((row) => {
            body += "<tr>";
            for (const field in row) {
                if (row.hasOwnProperty(field)) {
                    const text = String(row[field]);
                    body += "<td>" + text.replace(/\</g, '&lt').replace(/\>/g, '&gt').replace(/\&/g, '&amp') + "</td>";
                }
            }

            body += "</tr>";
        });

        return body + "</table>";
    }

}