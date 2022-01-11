export class CustomEventArray<T> extends Array<T>{
    constructor(public callback?:Function,...args:T[]){
        super(...args as T[])
    }
    
    public clear(){
        if(this.callback) this.forEach(element => this.callback!(element))
        else this.length = 0
    }
}