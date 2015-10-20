'use strict';

let WebSocket = require('ws');

let ws = new WebSocket('ws://192.168.2.9:4224/');

let actions = [];
let events = [];

ws.on('open', function open() {
  console.log('opened');
});

ws.on('message', function(data, flags) {
  let packet = JSON.parse(data);
  if (packet.type == 'def') {
    let definition = packet.payload;
    if (definition.type == 'action') {
      console.log('received action', definition);
      actions.push(definition);
    } else if (definition.type == 'event') {
      console.log('received event', definition);
      events.push(definition);
    }
  }
});
