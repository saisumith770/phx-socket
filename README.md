# @phx/socket
## Introduction
This is a websocket library for typescript built to interact with the phoenix websocket server. This is because phoenix has an abstraction around the general http socket layer. This library will simplify the procedure.

## Installation
```bash
  npm i phx-socket
```

## Objects
### Socket
This is a class that would initiate the connection. Although in most of your programs this is the only class that you will be importing.

**Methods**
#### _Socket.topics_
This method returns all the topics that you have subscribed to.

#### _Socket.state_
This method returns the state of the websocket.

#### _Socket.subscribe(__topic__:string)_
This method allows you to subscribe to a certain topic with ease.

#### _Socket.unsubscribe(__topic__:string)_
This method allows you to unsubscribe from a certain topic with ease.

#### _Socket.on(__event__: SocketEvent | string, __callback__: (socket: WebSocket, event: MessageEvent | CloseEvent | Event) => void)_
This method sets up a listener for a certain event and gives you the flexibility to customize what the function should do.

#### _Socket.send(__message__: MessageType<PayloadType>)_
This method sends a message to the websocket but you would have to specify the topic as well.

#### _Socket.close()_
This method will close the websocket session.

**Usage**
```ts
    const inst = new Socket("ws://localhost:4000/ws/websocket")
    inst.on("phx_reply",(_,__) => {
        console.log("successfully connected to the websocket")
    })
    inst.send({
        topic:"room:lobby",
        event:"phx_join",
        payload:{}
    })
```

### Channel
This class is a higher abstraction around the Socket class. It will allow you to write and read messages directly from the channel rather than the global socket class while also making the syntax easier.

**Methods**
#### _Channel.topic_
This method returns the name of the topic that the channel is subscribed to.

#### _Channel.send(__message__: Omit<MessageType<PayloadType>,"topic">)_
This method does the exact same thing as Socket.send but you do not have to mention the topic.

#### _Channel.on(__event__: string, __callback__: (socket: WebSocket, event: MessageEvent) => void)_
This method does the exact same thing as the Socket.on but also adds an additional check whether it is on the right channel. This is important to understand as in the case of the global socket if you add an event listener then irrespective of which channel the event is coming from the callback will be executed. In this case only if the event comes from the given channel then the callback will be executed.

**Usage**
```ts
    const inst = new Socket("ws://localhost:4000/ws/websocket")
    const room = inst.subscribe("room:lobby")
    room?.on("phx_reply",(_,event) => {
      console.log(event)
    })
    room?.on("shout",(_,event) => {
      console.log("shout")
    })
    room?.send({
      event:"shout",
      payload:{
        greet:"hey there"
      }
    })
```

### EventCollection
This is an internal class and is not to be used outside the library. Although you wouldn't find much use from it as it only tracks the events and keeps them in check. Which is required for the functioning of the library but may not be useful for writing your software.

**Methods**
#### _EventCollection.eventsArray_
This method would return the events stored in the instance.

#### _EventCollection.addEventToListen(__event__: SocketEvent | string, __callback__: (socket: WebSocket, event: MessageEvent | CloseEvent | Event) => void)_
This method would add an event to the instance and this would help in monitoring all the available events.

**Usage**
```ts
    const _events:EventCollection = new EventCollection()
    _events.addEventToListen("someEvent",(_,__) => null)
    console.log(_events.eventsArray)
```