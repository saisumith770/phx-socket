import {
    BaseEvents,
    Socket
} from '../src/internal'

describe("Channel",() => {
    const inst = new Socket("ws://localhost:4000/socket/websocket")
    const channel = inst.subscribe("room:lobby")!

    test("subscribed to channel",() => {
        expect(inst.topics.find(channel => channel.topic == "room:lobby"))
        .toBeTruthy()
        expect(channel.topic).toBe("room:lobby")
    })

    describe("Functionality",() => {
        test("sending messages",() => {
            channel.send({
                event:"shout",
                payload:{
                    message:"this is just a test"
                }
            })
        })
    })

    describe("Events", () => {
        test("creating single callback events",() => {
            channel.on(BaseEvents.REPLY,(msg) => {
                console.log(msg)
            })
            expect(channel.events.find(element => element.event == BaseEvents.REPLY))
            .toBeTruthy()
        })
    
        test("removing all references of an event", () => {
            channel.off(BaseEvents.REPLY)
            expect(!channel.events.find(element => element.event == BaseEvents.REPLY))
            .toBeTruthy()
        })
    })
})

export {}