import { EventArrayType } from '.';
import {
    Socket,
    MessageType,
    CustomEventArray,
    SocketEvent
} from './internal'

function isMessageType<T>(value:any): value is MessageType<T>{
    return value.hasOwnProperty('topic') && value.hasOwnProperty('payload')
}

/**
 * @description 
 * simple abrstraction on top of sockets for channels
 * @example
 * channel = inst.subscribe("room")
 * channel.send({
 *  event:"shout",
 *  payload:{
 *      msg:"here's a new message"
 *  }    
 * })
 */
 export class Channel{
    public events: EventArrayType;

    constructor(
        public topic:string,
        private _socket: Socket,
    ){
        this.events = new CustomEventArray((element:string) => {
            this._socket.off(element)
        })
    }

    /**
     * 
     * @param message 
     * @description
     * this function will send a socket message by populating it with required data
     * @example
     * channel.send({
     *  event:"shout",
     *  payload:{
     *      message:"hey boi's"
     *  }
     * })
     */
    public send<PayloadType extends {}>(message: Omit<MessageType<PayloadType>,"topic">) {
        this._socket.send({
            ...message,
            topic: this.topic
        })
    }

    /**
     * 
     * @param event 
     * @param callback 
     * @description
     * this method will set an event listener associated to the event. You can also set multiple callbacks to the same event.
     * @example
     * channel.on('msg',(message) => {
     *  console.log("received msg",message)
     * })
     * channel.on('msg',(message) => {
     *  console.log("received msg from server",message)
     * })
     */
    public on<T extends {}>(event: string, callback: (payload:T) => void) {
        const topic_name = this.topic
        if(!this.events.find(ev => ev.event === event && ev.callback === callback)) this.events.push({
            event,
            callback: callback as <T extends {}>(payload: SocketEvent | T) => void,
            topic:this.topic
        })
        
        this._socket.on(event,(data) => {
            if (isMessageType<T>(data) && data.topic === topic_name){
                callback(data.payload)
            }
        },this.topic)
    }
    
    /**
     * 
     * @param event 
     * @param callback 
     * @description
     * this method will remove the event listerner. Make sure you provide the callback in order to remove
     * that specific listener or else all listeners for that event will be removed. also make sure you store
     * your callback in a variable and pass that variable because redeclaration will create new memory location and not work properly.
     * @example
     * channel.off('msg')
     */
    public off<T extends {}>(event:string, callback?: (payload:T) => void ){
        if(callback) this._socket.off(event,callback as any,this.topic)
        else this._socket.off(event,undefined,this.topic)

        this.events = this.events.filter(ev => ev.event !== event && ev.callback !== callback) as EventArrayType    
    }
}