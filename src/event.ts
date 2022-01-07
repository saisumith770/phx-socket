import {
    SocketEvent
} from './internal'

export class EventCollection{
    public eventsArray: {event:SocketEvent|string, callback:(socket: WebSocket, event: MessageEvent | CloseEvent | Event) => void}[] = []

    public addEventToListen(event: SocketEvent | string, callback: (socket: WebSocket, event: MessageEvent | CloseEvent | Event) => void){
        if(!this.eventsArray.find(element => element.event === event && element.callback === callback)){ //possiblity of multiple events with differnt callbacks
            this.eventsArray.push({
                event,
                callback
            })
        }
    }

    public removeEvent(event: SocketEvent | string, callback?: (socket: WebSocket, event: MessageEvent | CloseEvent | Event) => void){
        if(callback) this.eventsArray = this.eventsArray.filter(element => element.event !== event && element.callback !== callback)
        this.eventsArray = this.eventsArray.filter(element => element.event !== event) // remove all events with the same name
    }
}