'use strinct'
import {Terminal} from '../Helpers/Terminal';
interface callback {
    ( error: Error, fileAddress?: string ) : void;
}
var ssh2 = require('ssh2');
var conn = null;
export class RemoteSync {
    private static readonly outputChannel = "RemoteSync";
    private static readonly remoteFileNameConfig = "/.remoteSyncConfig";
    private static readonly errorMessage = "Error can't create new config file :(";
    private static readonly sucessMessage = "Created new config file :)";
    private static readonly remoteFileConfigBody = '{\n"host":"",\n"port":21,\n"user":"",\n"password":""\n}';
    private static readonly errorMessageCodeNotFound = "command code not found";
    private static readonly commandCode = "code ";
    private code = null;

    public static logConsole = null;
    private remoteConfigFile = null;

    public constructor(code) {
        this.code = code;
        RemoteSync.logConsole = this.code.createOutputChannel(RemoteSync.outputChannel);
    }
    public uploadFile(){

    }
    private remoteConnect(){
        conn = new ssh2();
        if(this.remoteConfigFile){
            //text to json
            conn.connect(this.remoteConfigFile);
        } else {
            this.code.showError("ERRO");
        }
    }
    public configFile(workspaceAddress:string) {
        this.createRemoteSyncConfig(workspaceAddress,( error: Error, fileAddress?: string ) : void => {
            if (!error) {
                this.remoteConfigFile = fileAddress;
                //open config file
                Terminal.command(RemoteSync.commandCode+fileAddress,function(error: Error ,data ,stderr) {
                    if(error) {
                        this.code.showError(RemoteSync.errorMessageCodeNotFound);
                    }
                });
            }
        });
    }
    private createRemoteSyncConfig(workspaceAddress:string,callback:callback) : void  {
        var fs = require('fs');
        var remoteConfigFile = workspaceAddress+RemoteSync.remoteFileNameConfig;
        fs.readFile(remoteConfigFile, function(err, buf) {
            if (err) {
                fs.writeFile(remoteConfigFile, RemoteSync.remoteFileConfigBody, function(err) {
                    if (err) {
                        RemoteSync.logConsole.show();
                        RemoteSync.logConsole.append(RemoteSync.errorMessage);
                        RemoteSync.logConsole.append(err);
                        callback(new Error(err));
                    }else{
                        RemoteSync.logConsole.show();
                        RemoteSync.logConsole.append(RemoteSync.sucessMessage + "\n" + remoteConfigFile);
                    }
                });
            }else{
                RemoteSync.logConsole.show();
                RemoteSync.logConsole.append(remoteConfigFile);
            }
            callback(null,remoteConfigFile);
        });
    }
}
