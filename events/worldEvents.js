// events/worldEvents.js
const EventEmitter = require('eventemitter3');

const eventBus = new EventEmitter();

module.exports = eventBus;