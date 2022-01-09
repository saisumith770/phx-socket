export class CustomEventArray<T> extends Array{
    constructor(public callback?:Function,...args:T[]){
        super(...args as any)
    }
    
    public clear(){
        if(this.callback) this.forEach(element => this.callback!(element))
        else this.length = 0
    }
}