export class CustomEventArray<T> extends Array{
    constructor(public callback:Function,...args:T[]){
        super(...args as any)
    }
    
    public clear(){
        this.length = 0
        this.forEach(element => this.callback(element))
    }
}