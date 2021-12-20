import {
    Socket,
    MessageType
} from './internal'

/**
 * @description 
 * simply abrstraction on top of sockets for channels
 */
 export class Channel{
    constructor(
        public topic:string,
        private _socket: Socket,
    ){

    }

    /**
     * 
     * @param message 
     * @description
     * this function will send a socket message by populating it with required data
     */
    public send<PayloadType extends {}>(message: Omit<MessageType<PayloadType>,"topic">) {
        this._socket.send({
            ...message,
            topic: this.topic
        })
    }

    public on(event: string, callback: (socket: WebSocket, event: MessageEvent) => void) {
        const topic_name = this.topic
        this._socket.on(event,(socket,ev) => {
            const parsed = (JSON.parse((ev as MessageEvent).data))
            if (parsed.topic === topic_name){callback(socket, (ev as MessageEvent))}
        })
    }
}