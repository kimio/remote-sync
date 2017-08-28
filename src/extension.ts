'use strict';
import * as vscode from 'vscode';
import {Workspace} from './Helpers/Workspace';

var fs = require('fs');
export function activate(context: vscode.ExtensionContext) {
  let disposable =
      vscode.commands.registerCommand('extension.remoteSyncConfig', () => {
        var code = new Workspace();
        if (code.verify(vscode)) {
          fs.readFile('.remoteSyncConfig', function(err, buf) {
            if (err) {
            } else {
            }
          });
        }
      });

  context.subscriptions.push(disposable);
}