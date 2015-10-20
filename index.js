'use strict';

let WebSocket = require('ws');

let ws = new WebSocket('ws://192.168.2.9:4224/');

// this is called when the connection is established
ws.on('open', function open() {
  console.log('opened');

  // we already know which event we want to subscribe to, no need to wait for the definition to pop from rotonde.
  // SERIAL_PORTMESSAGE is the event that contains the data read from the serial module.
  // we subscribe now, but this event will only be triggered once we have open a serial port
  ws.send(JSON.stringify({
    type: 'sub',
    payload: {
      identifier: 'SERIAL_PORTMESSAGE',
    },
  }));
});

// this is called when a message is received from rotonde.
ws.on('message', function(data, flags) {
  // the packets received from rotonde, can be either 'event', 'action', 'def', 'sub' or 'unsub', depending on their type field.
  // the type is associated with a payload field, that contains the data for the packet
  let packet = JSON.parse(data);

  // we listen to the received packets for action definitions, objects with type == 'def' and payload.type == 'action'
  if (packet.type == 'def') {
    let definition = packet.payload;
    if (definition.type == 'action') {

      // the action that we are waiting for in SERIAL_OPEN, that is needed to tell the serial module to open a port,
      // then send it as soon as its definition is received.
      // once the port is opened, we will start receiving SERIAL_PORTMESSAGE events which we subscribed at connection.
      if (definition.identifier == 'SERIAL_OPEN') {
        ws.send(JSON.stringify({
          type: 'action',
          payload: {
            identifier: definition.identifier,
            data: {
              port: '/dev/ttyAMA0',
              baudrate: 9600,
            },
          },
        }));
      }
    }
  } else if (packet.type == 'event') {
    // this packet is an event, we only subscribed to SERIAL_PORTMESSAGE, so this will always be a SERIAL_PORTMESSAGE which contains the data read by the serial module
    console.log(packet);
  }
});
