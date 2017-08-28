'use strict';
export class Workspace {
  private errorWorkspaceFile =  'Your file doesn\'t has workspace';

  public verify(vscode) {
    var workspace = vscode.workspace.workspaceFolders;
    if (workspace === undefined) {
      vscode.window.showErrorMessage(this.errorWorkspaceFile);
      return false;
    }
    var worspacePath = vscode.workspace.workspaceFolders[0].uri.path
    vscode.window.showInformationMessage(worspacePath);
    return worspacePath;
  }

}