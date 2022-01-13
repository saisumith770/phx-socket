import { Channel } from "./internal";

type PresenceStateData<T> = Record<string,{
    metas:[T]
}>

export class Presence<T extends {}>{
    public list:Array<T>
    constructor(private _channel:Channel){
        this.list = []
        this._channel.on("presence_state",(data:PresenceStateData<T>) => {
            this.list = Object.entries(data).map(([_,value]) => {
                return value.metas[0]
            })
        })
    }

    public onJoin(callback:(members:T[]) => void){
        this._channel.on("presence_diff",(data:{joins:PresenceStateData<T>,leaves:PresenceStateData<T>}) => {
            const members = Object.entries(data.joins).map(([_,value]) => {
                return value.metas[0]
            })
            if(members.length > 0) callback(members)
        })
    }

    public onLeave(callback:(members:T[]) => void){
        this._channel.on("presence_diff",(data:{joins:PresenceStateData<T>,leaves:PresenceStateData<T>}) => {
            const members = Object.entries(data.leaves).map(([_,value]) => {
                return value.metas[0]
            })
            if(members.length > 0) callback(members)
        })
    }
}