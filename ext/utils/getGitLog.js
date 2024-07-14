const vscode = require("vscode");
const { exec } = require("child_process");
const { parseLog } = require("./parseGitLog.js");

function getGitUserName() {
  return new Promise((resolve, reject) => {
    exec("git config --global user.name", (err, stdout) => {
      if (err) {
        console.error(`Error executing git command: ${err}`);
        reject(err);
        return;
      }
      const username = stdout.trim();
      resolve(username);
    });
  });
}

function getModifiedFiles(time) {
  return new Promise((resolve, reject) => {
    if (!vscode.workspace.workspaceFolders) return;

    const workspaceFolder = vscode.workspace.workspaceFolders[0];
    const workspaceFolderPath = workspaceFolder.uri.fsPath;

    getGitUserName().then((username) => {
      exec(
        `git log --author=${username} --pretty=format:"%h - %an, %ad : %s" --date=format:"%Y-%m-%d %H:%M:%S" --name-only --since="5 month ago" --until="now"`,
        { cwd: workspaceFolderPath },
        (err, stdout) => {
          if (err) {
            console.error(`Error executing git command: ${err}`);
            reject(err);
            return;
          }

          try {
            const logs = parseLog(stdout);

            const fileItems = logs.map((item) => {
              return item;
            });

            resolve(fileItems);
          } catch (error) {
            reject(error);
            console.log(error);
          }
        }
      );
    });
  });
}

module.exports = {
  getGitUserName,
  getModifiedFiles,
};
