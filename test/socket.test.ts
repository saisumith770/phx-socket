import {
    BaseEvents, 
    Socket,
    SocketState,
    CustomEventArray
} from '../src/internal'

describe("Socket", () => {
    const inst = new Socket("ws://localhost:4000/socket/websocket")

    test("checking for initialisation", () => {
        expect([SocketState.CONNECTING,SocketState.OPEN].find(element => element == inst.state))
        .toBeTruthy()
    })

    test("socket connection established",() => {
        setTimeout(() => {
            expect(inst.state).toBe(SocketState.OPEN)
        },3000)
    })

    describe("Topics",() => {
        test("subscription to topics",() => {
            inst.subscribe("room:lobby")
            expect(inst.topics.find(topic => topic.topic == "room:lobby"))
            .toBeTruthy()
        })
    
        test("unsubscription from topics",() => {
            inst.unsubscribe("room:lobby")
            expect(!inst.topics.find(topic => topic.topic == "room:lobby"))
            .toBeTruthy()
        })
    })

    describe("Events",() => {
        test("creating single callback events",() => {
            inst.on(BaseEvents.REPLY,(msg) => {
                console.log(msg)
            })
            expect(inst.events.find(element => element.event == BaseEvents.REPLY))
            .toBeTruthy()
        })

        test("removing all references of an event", () => {
            inst.off(BaseEvents.REPLY)
            expect(!inst.events.find(element => element.event == BaseEvents.REPLY))
            .toBeTruthy()
        })
    })

    describe("Functionality", () => {
        test("send messages to the socket",() => {
            inst.send({
                topic:"room:lobby",
                event:"shout",
                payload:{
                    message:"test message!!"
                }
            })
        })

        test("reset all events and topics", () => {
            inst.reset()
            expect(inst.events instanceof CustomEventArray && inst.events.length == 0).toBeTruthy()
            expect(inst.topics).toEqual([])
        })

        test("close socket",() => {
            inst.close()
            expect([SocketState.CLOSED,SocketState.CLOSING].find(state => state == inst.state))
            .toBeTruthy()
            setTimeout(() => {
                expect(inst.state).toBe(SocketState.CLOSED)
            },3000)
        })
    })
})

export {}