'use strict';
import * as vscode from 'vscode';
import {Workspace} from './Helpers/Workspace';
import {RemoteSync} from './Business/RemoteSync';
export function activate(context: vscode.ExtensionContext) {
  // Config file
  let disposable = vscode.commands.registerCommand('extension.remoteSyncConfig', () => {
    var code = new Workspace(vscode);
    //verify workspace
    var workspaceAddress = code.verify();
    if (workspaceAddress) {
      var remoteSync = new RemoteSync(code);
      remoteSync.configFile(workspaceAddress);
    }
  });
  context.subscriptions.push(disposable);
}