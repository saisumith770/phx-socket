
import { v4 } from 'uuid'

enum SocketState {
    CLOSED,
    CLOSING,
    CONNECTING,
    OPEN,
    UNKNOWN
}

enum SocketEvent {
    OPEN,
    CLOSE,
    ERROR
}

enum BaseEvents {
    CLOSE = "phx_close",
    ERROR = "phx_error",
    JOIN = "phx_join",
    REPLY = "phx_reply",
    LEAVE = "phx_leave"
}

type MessageType<T> = {
    topic: string,
    event: string,
    payload: T
}

export class Socket {
    private _socket: WebSocket
    private _socket_id: string
    public topics: string[] = []

    constructor(url: string) {
        this._socket = new WebSocket(url)
        this._socket_id = "socket:" + v4()
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
        if (!(topic in this.topics)) this.topics.push(topic)
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
        if (topic in this.topics) this.topics = this.topics.filter(tp => topic !== tp)
    }

    public on(event: SocketEvent | string, callback: (socket: WebSocket, event: MessageEvent | CloseEvent | Event) => any) {
        switch (event) {
            case SocketEvent.OPEN: this._socket.onopen = function (this: WebSocket, ev: Event) { callback(this, ev) }
            case SocketEvent.CLOSE: this._socket.onclose = function (this: WebSocket, ev: CloseEvent) { callback(this, ev) }
            case SocketEvent.ERROR: this._socket.onerror = function (this: WebSocket, ev: Event) { callback(this, ev) }
            default: this._socket.onmessage = function (this: WebSocket, ev: MessageEvent) {
                if (event === ev.data.event) callback(this, ev)
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
        const msg_id = "message:" + v4()
        this._socket.send(JSON.stringify({
            ...message,
            ref: msg_id,
            join_ref: this._socket_id
        }))
    }

    //State is not properly written
    public get state(): SocketState {
        if (this._socket.CLOSED) return SocketState.CLOSED
        else if (this._socket.CLOSING) return SocketState.CLOSING
        else if (this._socket.CONNECTING) return SocketState.CONNECTING
        else if (this._socket.OPEN) return SocketState.OPEN
        return SocketState.UNKNOWN
    }
}

const inst = new Socket("ws://localhost:4000/socket/websocket")
console.log(inst)