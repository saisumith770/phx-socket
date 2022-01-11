import { EventArrayType } from '.'
import {
    BaseEvents,
    Channel,
    EventCollection,
    MessageType,
    SocketEvent,
    SocketState,
} from './internal'

import {e7} from './uuid'

/**
 * 
 * @description
 * This class is what you should import into your app. It has access to all the features of this library.
 * @example 
 * const inst = new Socket("wss://localhost:4000/socket/websocket")
 * inst.on("phx_reply",(message) => {
 *  console.log("got a new reply")
 * })
 * inst.send({
 *  topic:"room",
 *  event:"phx_join",
 *  payload:{
 *      account:"sai sumith",
 *      avatar:"https://avatar.com/avatar"
 *  }
 * }) 
 */
export class Socket {
    private _socket: WebSocket
    private _socket_id: string
    private _ready: boolean = false
    private _pending_messages: MessageType<any>[] = []
    public topics: Channel[] = [] //will be used to populate data in the global state manager
    private _events:EventCollection = new EventCollection()

    constructor(url: string) {
        this._socket = new WebSocket(url)
        this._socket_id = "socket:" + e7()
        this.on(SocketEvent.OPEN, (_) => {
            this._ready = true
            this._pending_messages.forEach((message) => {
                this.send(message)
            })
            this._pending_messages = []
            this.off(SocketEvent.OPEN)
        })

    }

    /**
     * 
     * @param topic 
     * @description
     * subscribes to a phoenix channel
     * @example
     * inst.subscribe("room")
     */
    public subscribe(topic: string) {
        this.send({
            topic,
            event: BaseEvents.JOIN,
            payload: {}
        })
        if (!(topic in this.topics)) {
            const channel = new Channel(topic,this)
            this.topics.push(channel)
            return channel 
        }
        return;
    }

    /**
     * 
     * @param topic 
     * @description
     * unsubscribes from a phoenix channel
     * @example
     * inst.unsubscribe("room")
     */
    public unsubscribe(topic: string) {
        this.send({
            topic,
            event: BaseEvents.LEAVE,
            payload: {}
        })
        if (this.topics.find(element => element.topic == topic)) this.topics = this.topics.filter(ch => ch.topic !== topic)
    }

    /**
     * 
     * @param event 
     * @param callback 
     * @description
     * this method will set an event listener associated to the event. You can also set multiple callbacks to the same event.
     * @example
     * inst.on('msg',(message) => {
     *  console.log("received msg", message)
     * })
     * inst.on('msg',(message) => {
     *  console.log("received msg from server", message)
     * })
     */
    public on<T extends {}>(event: SocketEvent | string, callback:(payload:MessageType<T> | SocketEvent) => void ) {
        this._events.addEventToListen(event,callback as any)
        const eventsToListen = this._events.eventsArray
        switch (event) {
            case SocketEvent.OPEN: 
                this._socket.onopen = function (this: WebSocket, _: Event) { callback(SocketEvent.OPEN) } 
                break;
            case SocketEvent.CLOSE: 
                this._socket.onclose = function (this: WebSocket, _: CloseEvent) { callback(SocketEvent.CLOSE) } 
                break;
            case SocketEvent.ERROR: 
                this._socket.onerror = function (this: WebSocket, _: Event) { callback(SocketEvent.ERROR) } 
                break;
            default: this._socket.onmessage = function (this: WebSocket, ev: MessageEvent) {
                const parsedJson = JSON.parse(ev.data)
                const parsedEvent = parsedJson.event
                eventsToListen.forEach(element => {
                    if(element.event === parsedEvent) {element.callback(parsedJson)}
                })
            }
        }
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
     * inst.off('msg')
     */
    public off(event:SocketEvent | string, callback?: <T extends {}>(payload:MessageType<T> | SocketEvent) => void ){
        if(callback) this._events.removeEvent(event,callback as any)
        else this._events.removeEvent(event)

        const eventsToListen = this._events.eventsArray
        this._socket.onmessage = function (this: WebSocket, ev: MessageEvent) {
            const parsedJson = JSON.parse(ev.data)
            const parsedEvent = parsedJson.event
            eventsToListen.forEach(element => {
                if(element.event === parsedEvent) {element.callback(parsedJson)}
            })
        }
    }

    /**
     * 
     * @param message 
     * @description
     * this function will send a socket message by populating it with required data
     * @example
     * inst.send({
     *  topic:"room",
     *  event:"shout",
     *  payload:{
     *      message:"hey boi's"
     *  }
     * })
     */
    public send<PayloadType extends {}>(message: MessageType<PayloadType>) {
        if(!this._ready) {
            this._pending_messages.push(message)
            return;
        }
        const msg_id = "message:" + e7()
        this._socket.send(JSON.stringify({
            ...message,
            ref: msg_id,
            join_ref: this._socket_id
        }))
    }

    /**
     * @description
     * this getter shows the state of the current socket connection.
     * You can use the enum provided by our types file in order to get the enums
     * we use for maintaing state.
     * @example
     * console.log(inst.state === SocketState.CLOSED)
     */
    public get state(): SocketState {
        switch (this._socket.readyState){
            case this._socket.CLOSED: return SocketState.CLOSED
            case this._socket.CLOSING: return SocketState.CLOSING
            case this._socket.CONNECTING: return SocketState.CONNECTING
            case this._socket.OPEN: return SocketState.OPEN
            default: return SocketState.UNKNOWN
        }
    }

    public get events():EventArrayType {
        return this._events.eventsArray
    }

    public reset(){
        this.events.clear()
        this.topics.forEach(channel => {
            this.unsubscribe(channel.topic)
        })
    }

    /**
     * @description
     * this method will close the socket connection.
     * @example 
     * inst.close()
     */
    public close(){
        this._socket.close()
    }
}