"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const internal_1 = require("../src/internal");
describe("Channel", () => {
    const inst = new internal_1.Socket("ws://localhost:4000/socket/websocket");
    const channel = inst.subscribe("room:lobby");
    test("subscribed to channel", () => {
        expect(inst.topics.find(channel => channel.topic == "room:lobby"))
            .toBeTruthy();
        expect(channel.topic).toBe("room:lobby");
    });
    describe("Functionality", () => {
        test("sending messages", () => {
            channel.send({
                event: "shout",
                payload: {
                    message: "this is just a test"
                }
            });
        });
    });
    describe("Events", () => {
        test("creating single callback events", () => {
            channel.on(internal_1.BaseEvents.REPLY, (msg) => {
                console.log(msg);
            });
            expect(channel.events.find(element => element.event == internal_1.BaseEvents.REPLY))
                .toBeTruthy();
        });
        test("removing all references of an event", () => {
            channel.off(internal_1.BaseEvents.REPLY);
            expect(!channel.events.find(element => element.event == internal_1.BaseEvents.REPLY))
                .toBeTruthy();
        });
    });
});
