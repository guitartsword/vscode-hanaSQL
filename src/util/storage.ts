import * as vscode from 'vscode';

export class Global{
    static state:vscode.Memento;
    static setState(context:vscode.Memento){
        Global.state = context;
    }
}
export class WorkSpace{
    static state:vscode.Memento;
    static setState(context:vscode.Memento){
        WorkSpace.state = context;
    }
}
class LocalState{
    constructor(private state:{ [s: string]: any; }){

    }
    get<T>(key: string): T | undefined{
        if(this.state[key]){
            return this.state[key];
        }
        return;
    }
    update(key: string, value: any): Thenable<void>{
        return new Promise(() => {
            this.state[key] = value;
        });
    }
}
export class Memory {
    static setState(){
        Memory.state = new LocalState({});
    }
    static state:LocalState;
}