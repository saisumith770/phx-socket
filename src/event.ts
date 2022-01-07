import {
    SocketEvent
} from './internal'

export class EventCollection{
    public eventsArray: {event:SocketEvent|string, callback:(socket: WebSocket, event: MessageEvent | CloseEvent | Event) => void}[] = []

    public addEventToListen(event: SocketEvent | string, callback: (socket: WebSocket, event: MessageEvent | CloseEvent | Event) => void){
        if(!this.eventsArray.find(element => element.event === event && element.callback === callback)){
            this.eventsArray.push({
                event,
                callback
            })
        }
    }
}