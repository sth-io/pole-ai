import EventEmitter from "events";

class EventBus extends EventEmitter {}

const eb = new EventBus()

export default eb;
