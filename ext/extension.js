const vscode = require("vscode");
const { getModifiedFiles } = require("./utils/getGitLog.js");
const { openFile, searchKeword } = require("./utils/file.js");

function activate(context) {
  const provider = new SidebarViewProvider(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SidebarViewProvider.viewType,
      provider,
      {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.openFile", async (filePath, fileData) => {
      try {
        const {startPos, endPos} = fileData
        const document = await vscode.workspace.openTextDocument(filePath);
        const editor = await vscode.window.showTextDocument(document);
        const startPosition = new vscode.Position(startPos.line, startPos.character);
        const endPosition = new vscode.Position(endPos.line, endPos.character);
        const newSelection = new vscode.Selection(startPosition, endPosition);
  
        editor.selection = newSelection;
        editor.revealRange(newSelection, vscode.TextEditorRevealType.InCenter);
      } catch (error) {
        console.log(error)
      }
    })
  );
}

function deactivate() {}

class SidebarViewProvider {
  static viewType = "sidebarView";

  constructor(context) {
    this._context = context;
    this._extensionUri = context.extensionUri;
  }

  resolveWebviewView(webviewView, context, _token) {
    this._view = webviewView;

    webviewView.webview.options = {
      // 允许脚本在 webview 中运行
      enableScripts: true,

      // 限制 webview 只能加载扩展目录中的资源
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message) => {
      const msg = JSON.parse(message);
      const data = msg.data;

      switch (msg.command) {
        case "openFile":
          openFile(data);
          break;
        case "search":
          const result = await searchKeword(data)
          
          webviewView.webview.postMessage({
            command: "searchResult",
            data: result,
          });
          break;
        default:
          break;
      }
    });

    // 获取主题颜色
    const theme = vscode.window.activeColorTheme;
    const isDark = theme.kind === vscode.ColorThemeKind.Dark;
    const isLight = theme.kind === vscode.ColorThemeKind.Light;

    webviewView.webview.postMessage({
      command: "theme",
      data: {
        isDark,
        isLight,
      },
    });

    // 获取修改过的文件列表
    getModifiedFiles().then((files) => {
      webviewView.webview.postMessage({
        command: "getFiles",
        data: files,
      });
    });
  }

  _getHtmlForWebview(webview) {
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist", "index.css")
    );
    const codiconsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "node_modules",
        "@vscode/codicons",
        "dist",
        "codicon.css"
      )
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist", "index.js")
    );

    const nonce = getNonce();

    return `
      <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="${codiconsUri}" rel="stylesheet" nonce="${nonce}">
          <link href="${styleUri}" rel="stylesheet" nonce="${nonce}">
          <title>搜索自己的代码</title>
        </head>
        <body>
          <div id="app"></div>
          <script nonce="${nonce}" type="module" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

module.exports = {
  activate,
  deactivate,
};
