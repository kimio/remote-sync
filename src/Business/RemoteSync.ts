'use strinct'
import{Terminal} from '../Helpers/Terminal';
import {Workspace} from '../Helpers/Workspace';
interface callback {
  (error: Error, fileAddress?: string): void;
}
var ssh2 = require('ssh2');
var fs = require('fs');
var conn = null;

export class RemoteSync {
  private static readonly outputChannel = 'RemoteSync';
  private static readonly remoteFileNameConfig = '/.remoteSyncConfig';
  private static readonly errorMessage =
      'Error can\'t create new config file :(';
  private static readonly sucessMessage = 'Created new config file :)';
  private static readonly remoteFileConfigBody =
      '{\n"host":"",\n"port":21,\n"user":"",\n"password":""\n"initial_path":""\n}';
  private static readonly errorMessageCodeNotFound = 'command code not found';
  private static readonly commandCode = 'code ';
  private code = null;

  public static logConsole = null;
  private remoteConfigFile = null;

  public constructor(code:Workspace) {
    this.code = code;
    RemoteSync.logConsole =
        this.code.createOutputChannel(RemoteSync.outputChannel);
  }
  public uploadFile() {
    this.remoteConnect();

    conn.on('ready', () => {
      conn.sftp((err, sftp) => {
        if (err) {
          console.log('Error, problem starting SFTP: %s', err);
        }

        var readStream = fs.createReadStream('initial_path+workspaceAdress');
        var writeStream = sftp.createWriteStream('file_adress');

        writeStream.on('close',() => {
          sftp.end();
          process.exit(0);
        });
        readStream.pipe(writeStream);
      });
    });
  }

  private remoteConnect() {
    conn = new ssh2();
    if (this.remoteConfigFile) {
      var remoteConfiguration = JSON.parse(fs.readFileSync(this.remoteConfigFile).toString());
      conn.connect(remoteConfiguration);
    } else {
      this.code.showError('ERRO');
    }
  }

  public configFile() {
    this.createRemoteSyncConfig(this.code.workspaceAddress, (error: Error, fileAddress?: string): void => {
          if (!error) {
            this.remoteConfigFile = fileAddress;
            // open config file
            Terminal.command(
                RemoteSync.commandCode + fileAddress,
                function(error: Error, data, stderr) {
                  if (error) {
                    this.code.showError(RemoteSync.errorMessageCodeNotFound);
                  }
                });
          }
        });
  }

  private createRemoteSyncConfig(workspaceAddress: string, callback: callback):void {
    var remoteConfigFile = workspaceAddress + RemoteSync.remoteFileNameConfig;
    fs.readFile(remoteConfigFile, (err, buf) => {
      if (err) {
        fs.writeFile(
            remoteConfigFile, RemoteSync.remoteFileConfigBody, (err) => {
              if (err) {
                RemoteSync.logConsole.show();
                RemoteSync.logConsole.append(RemoteSync.errorMessage);
                RemoteSync.logConsole.append(err);
                callback(new Error(err));
              } else {
                RemoteSync.logConsole.show();
                RemoteSync.logConsole.append(
                    RemoteSync.sucessMessage + '\n' + remoteConfigFile);
              }
            });
      } else {
        RemoteSync.logConsole.show();
        RemoteSync.logConsole.append(remoteConfigFile);
      }
      callback(null, remoteConfigFile);
    });
  }
}
