'use strinct'
import{Terminal} from '../Helpers/Terminal';
import {Workspace} from '../Helpers/Workspace';
interface CallbackFileAddress {
  (error: Error, fileAddress?: string): void;
}
interface CallbackObjectData {
  (error: Error, data: any): void;
}
var ssh2 = require('ssh2');
var fs = require('fs');
var conn = null;

export enum TypeOfConnection {
  FTP,
  SFTP
}
export class RemoteSync {
  private static readonly outputChannel = 'RemoteSync';
  private static readonly remoteFileNameConfig = '/.remoteSyncConfig';
  private static readonly errorMessage =
      'Error can\'t create new config file :(';
  private static readonly sucessMessage = 'Created new config file :)';
  private static readonly preparingToUpload = 'Preparing to upload ';
  private static readonly uploaded = ' Uploaded!';
  private static readonly connected = ' Connected!';
  private static readonly remoteFileConfigBody =
      '{\n"host":"",\n"port":21,\n"username":"",\n"password":""\n"initial_path":""\n}';
  private static readonly errorMessageCodeNotFound = 'command code not found';
  private static readonly errorMessageConnectionFailed = 'Connection Failed';
  private static readonly commandCode = 'code ';
  private code = null;

  public static logConsole = null;
  private remoteConfigFile = null;
  private filesToUpload = null;

  private remoteConfigurationJson = null;

  public constructor(code: Workspace) {
    this.code = code;
    RemoteSync.logConsole =
        this.code.createOutputChannel(RemoteSync.outputChannel);
  }
  public uploadFile(isCurrentFile: boolean, typeOfConnection: TypeOfConnection):
      void {
    this.remoteConnect();
    this.getFilesToUpload(isCurrentFile);
    switch (typeOfConnection) {
      case TypeOfConnection.SFTP:
        this.sftpUploadFile();
        break;
    }
  }

  private getFilesToUpload(isCurrentFile: boolean): void {
    if (isCurrentFile) {
      this.filesToUpload = [this.code.getCurrentFile()];
      return;
    }
    this.filesToUpload = [];
  }
  private getPathFileToUpload(fileToUpload:string):string{
    return fileToUpload.replace(this.code.workspacePath,"");
  }
  private sftpUploadFile(): void {
    conn.on('ready', () => {
      this.code.showMessage(RemoteSync.connected);
      conn.sftp((err, sftp) => {
        if (err) {
          this.code.showError(err);
        } else {
          
          this.filesToUpload.forEach((item, index) => {
            this.code.showMessage(RemoteSync.preparingToUpload+item);
            var readStream = fs.createReadStream(item);
            let initial_path = this.remoteConfigurationJson.initial_path; 
            var writeStream = sftp.createWriteStream(initial_path+this.getPathFileToUpload(item));
            writeStream.on('close', () => {
              this.code.showMessage(item+RemoteSync.uploaded);
              sftp.end();
            });
            readStream.pipe(writeStream);
          });

        }
      });
    });
  }

  private remoteConnect(): void {
    conn = new ssh2();
    this.isConfigFileExist((err, data) => {
      if (err) {
        this.code.showError(RemoteSync.errorMessageConnectionFailed);
      } else {
        try {
          this.remoteConfigurationJson = JSON.parse(data.toString());
          conn.connect(this.remoteConfigurationJson);
        } catch (e) {
          this.code.showError(e.message);
        }
      }
    });
  }

  public configFile(): void {
    this.createRemoteSyncConfig((error: Error, fileAddress?: string): void => {
      if (!error) {
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

  private getRemoteConfigFile(): string {
    return this.code.workspacePath + RemoteSync.remoteFileNameConfig;
  }

  // Config File Exist
  private isConfigFileExist(callback: CallbackObjectData): void {
    fs.readFile(this.getRemoteConfigFile(), (err, buf) => {
      callback(err, buf);
    });
  }

  private createRemoteSyncConfig(callback: CallbackFileAddress): void {
    var remoteConfigFile = this.getRemoteConfigFile();
    this.isConfigFileExist((err, buf) => {
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
