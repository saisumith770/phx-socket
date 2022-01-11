"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const internal_1 = require("../src/internal");
describe("Socket", () => {
    const inst = new internal_1.Socket("ws://localhost:4000/socket/websocket");
    test("checking for initialisation", () => {
        expect([internal_1.SocketState.CONNECTING, internal_1.SocketState.OPEN].find(element => element == inst.state))
            .toBeTruthy();
    });
    test("socket connection established", () => {
        setTimeout(() => {
            expect(inst.state).toBe(internal_1.SocketState.OPEN);
        }, 3000);
    });
    describe("Topics", () => {
        test("subscription to topics", () => {
            inst.subscribe("room:lobby");
            expect(inst.topics.find(topic => topic.topic == "room:lobby"))
                .toBeTruthy();
        });
        test("unsubscription from topics", () => {
            inst.unsubscribe("room:lobby");
            expect(!inst.topics.find(topic => topic.topic == "room:lobby"))
                .toBeTruthy();
        });
    });
    describe("Events", () => {
        test("creating single callback events", () => {
            inst.on(internal_1.BaseEvents.REPLY, (msg) => {
                console.log(msg);
            });
            expect(inst.events.find(element => element.event == internal_1.BaseEvents.REPLY))
                .toBeTruthy();
        });
        test("removing all references of an event", () => {
            inst.off(internal_1.BaseEvents.REPLY);
            expect(!inst.events.find(element => element.event == internal_1.BaseEvents.REPLY))
                .toBeTruthy();
        });
    });
    describe("Functionality", () => {
        test("send messages to the socket", () => {
            inst.send({
                topic: "room:lobby",
                event: "shout",
                payload: {
                    message: "test message!!"
                }
            });
        });
        test("reset all events and topics", () => {
            inst.reset();
            expect(inst.events instanceof internal_1.CustomEventArray && inst.events.length == 0).toBeTruthy();
            expect(inst.topics).toEqual([]);
        });
        test("close socket", () => {
            inst.close();
            expect([internal_1.SocketState.CLOSED, internal_1.SocketState.CLOSING].find(state => state == inst.state))
                .toBeTruthy();
            setTimeout(() => {
                expect(inst.state).toBe(internal_1.SocketState.CLOSED);
            }, 3000);
        });
    });
});
