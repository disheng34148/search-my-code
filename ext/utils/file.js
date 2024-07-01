const vscode = require("vscode");
const path = require("path");

module.exports = {
  openFile(data) {
    const { log, startPos } = data;
    const workspaceFolder = vscode.workspace.workspaceFolders[0];
    const workspaceFolderPath = workspaceFolder.uri.fsPath;

    const fullPath = startPos ? log : path.join(workspaceFolderPath, log);
    const vscodePath = vscode.Uri.file(fullPath);

    vscode.commands.executeCommand("extension.openFile", vscodePath, data);
  },
  async searchKeword({ keyword, files }) {
    let filePaths = [];
    const matchingFiles = [];
    const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;

    files.map((file) => {
      const logs = file.files.map((item) => item.log);
      filePaths.push(...logs);
    });

    filePaths = [...new Set(filePaths)];

    for (const filePathStr of filePaths) {
      const filePath = path.join(workspaceFolder, filePathStr);
      const uri = vscode.Uri.file(filePath);
      try {
        const document = await vscode.workspace.openTextDocument(uri);
        const text = document.getText();
        const regex = new RegExp(keyword, "g");
        let match;

        while ((match = regex.exec(text)) !== null) {
          const startPos = document.positionAt(match.index);
          const endPos = document.positionAt(match.index + keyword.length);
          const lineText = document.lineAt(startPos.line).text;
          matchingFiles.push({ filePath, startPos, endPos, lineText });
        }
      } catch (error) {
        // console.log(error);
      }
    }

    return matchingFiles;
  },
};
