import {
    BaseEvents,
    Channel,
    EventCollection,
    MessageType,
    SocketEvent,
    SocketState
} from './internal'

import {e7} from './uuid'

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
        this.on(SocketEvent.OPEN, (_,__) => {
            this._ready = true
            this._pending_messages.forEach((message) => {
                this.send(message)
            })
            this._pending_messages = []
        })
    }

    /**
     * 
     * @param topic 
     * @description
     * subscribes to a phoenix channel
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
     */
    public unsubscribe(topic: string) {
        this.send({
            topic,
            event: BaseEvents.LEAVE,
            payload: {}
        })
        if (topic in this.topics) this.topics = this.topics.filter(ch => ch.topic !== topic)
    }

    public on(event: SocketEvent | string, callback: (socket: WebSocket, event: MessageEvent | CloseEvent | Event) => void) {
        this._events.addEventToListen(event,callback)
        const eventsToListen = this._events.eventsArray
        switch (event) {
            case SocketEvent.OPEN: 
                this._socket.onopen = function (this: WebSocket, ev: Event) { callback(this, ev) } 
                break;
            case SocketEvent.CLOSE: 
                this._socket.onclose = function (this: WebSocket, ev: CloseEvent) { callback(this, ev) } 
                break;
            case SocketEvent.ERROR: 
                this._socket.onerror = function (this: WebSocket, ev: Event) { callback(this, ev) } 
                break;
            default: this._socket.onmessage = function (this: WebSocket, ev: MessageEvent) {
                const parsedEvent = (JSON.parse(ev.data)).event
                eventsToListen.forEach(element => {
                    if(element.event === parsedEvent) {element.callback(this,ev)}
                })
            }
        }
    }

    /**
     * 
     * @param message 
     * @description
     * this function will send a socket message by populating it with required data
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

    public get state(): SocketState {
        switch (this._socket.readyState){
            case this._socket.CLOSED: return SocketState.CLOSED
            case this._socket.CLOSING: return SocketState.CLOSING
            case this._socket.CONNECTING: return SocketState.CONNECTING
            case this._socket.OPEN: return SocketState.OPEN
            default: return SocketState.UNKNOWN
        }
    }

    public close(){
        this._socket.close()
    }
}