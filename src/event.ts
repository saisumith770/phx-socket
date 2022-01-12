import {
    SocketEvent,
    CustomEventArray,
    EventArrayType
} from './internal'

export class EventCollection{
    public eventsArray: EventArrayType = new CustomEventArray()

    public addEventToListen(event: SocketEvent | string, callback:<T extends {}>(payload:T | SocketEvent) => void,topic:string){
        if(!this.eventsArray.find(element => element.event === event && element.callback === callback)){ //possiblity of multiple events with differnt callbacks
            this.eventsArray.push({
                event,
                callback,
                topic
            })
        }
    }

    public removeEvent(event: SocketEvent | string,topic:string, callback?:<T extends {}>(payload:T | SocketEvent) => void){
        if(callback) this.eventsArray = this.eventsArray.filter(element => 
            element.event !== event && 
            element.callback !== callback && 
            element.topic !== topic
        ) as EventArrayType
        this.eventsArray = this.eventsArray.filter(element => 
            element.event !== event &&
            element.topic !== topic
        ) as EventArrayType// remove all events with the same name
    }
}