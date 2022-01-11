export class Timer{
    public delay(callback:Function,milliseconds:number){
        setTimeout(callback,milliseconds)
    }

    public poll(callback:Function,milliseconds:number){
        setInterval(callback,milliseconds)
    }
}