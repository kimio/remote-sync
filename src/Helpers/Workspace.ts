'use strict';
export class Workspace {
  private static readonly errorWorkspaceFile =  'Your file doesn\'t has workspace';
  public vscode = null;
  public constructor(vscode){
    this.vscode = vscode;
  }
  public verify() {
    var workspace = this.vscode.workspace.workspaceFolders;
    if (workspace === undefined) {
      this.showError(Workspace.errorWorkspaceFile);
      return false;
    }
    var worspacePath = this.vscode.workspace.workspaceFolders[0].uri.path;
    this.showMessage(worspacePath);
    return worspacePath;
  }

  public createOutputChannel(outputChannel:string) {
    return this.vscode.window.createOutputChannel(outputChannel);
  }
  public showError(errorMessage:string) {
    this.vscode.window.showErrorMessage(errorMessage);
  }
  public showMessage(message:string) {
    this.vscode.window.showInformationMessage(message);
  }
}