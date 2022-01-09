import {
    SocketEvent,
    CustomEventArray
} from './internal'

type EventArrayType = CustomEventArray<{event:SocketEvent|string, callback:<T extends {}>(payload:T | SocketEvent) => void}>

export class EventCollection{
    public eventsArray: EventArrayType = new CustomEventArray()

    public addEventToListen(event: SocketEvent | string, callback:<T extends {}>(payload:T | SocketEvent) => void){
        if(!this.eventsArray.find(element => element.event === event && element.callback === callback)){ //possiblity of multiple events with differnt callbacks
            this.eventsArray.push({
                event,
                callback
            })
        }
    }

    public removeEvent(event: SocketEvent | string, callback?:<T extends {}>(payload:T | SocketEvent) => void){
        if(callback) this.eventsArray = this.eventsArray.filter(element => 
            element.event !== event && element.callback !== callback
        ) as EventArrayType
        this.eventsArray = this.eventsArray.filter(element => 
            element.event !== event
        ) as EventArrayType// remove all events with the same name
    }
}