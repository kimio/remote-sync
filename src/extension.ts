'use strict';
import * as vscode from 'vscode';
import {Workspace} from './Helpers/Workspace';
import {RemoteSync} from './Business/RemoteSync';
export function activate(context: vscode.ExtensionContext) {
  // Config file
  let disposable = vscode.commands.registerCommand('extension.remoteSyncConfig', () => {
    var code = new Workspace(vscode);
    var workspaceAddress = code.verify();
    if (workspaceAddress) {
      var remoteSync = new RemoteSync(code);
      remoteSync.configFile();
    }
  });
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('extension.remoteSyncSftpUpload', () => {
    var code = new Workspace(vscode);
    var workspaceAddress = code.verify();
    if (workspaceAddress) {
      var remoteSync = new RemoteSync(code);
      remoteSync.uploadFile();
    }
  });
  context.subscriptions.push(disposable);
}