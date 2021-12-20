export enum SocketState {
    CLOSED,
    CLOSING,
    CONNECTING,
    OPEN,
    UNKNOWN
}

export enum SocketEvent {
    OPEN,
    CLOSE,
    ERROR
}

export enum BaseEvents {
    CLOSE = "phx_close",
    ERROR = "phx_error",
    JOIN = "phx_join",
    REPLY = "phx_reply",
    LEAVE = "phx_leave"
}

export type MessageType<T> = {
    topic: string,
    event: string,
    payload: T
}