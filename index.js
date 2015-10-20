'use strict';

let WebSocket = require('ws');

let ws = new WebSocket('ws://192.168.2.9:4224/');

ws.on('open', function open() {
  console.log('opened');
  ws.send(JSON.stringify({
  type: 'sub',
    payload: {
      identifier: 'SERIAL_PORTMESSAGE',
    },
  }));
});

ws.on('message', function(data, flags) {
  let packet = JSON.parse(data);
  if (packet.type == 'def') {
    let definition = packet.payload;
    if (definition.type == 'action') {
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
  } else {
    console.log(packet);
  }
});
