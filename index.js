'use strict';

let newClient = require('rotonde-client/src/Client');

let client = newClient('ws://192.168.2.9:4224/');

let openaction = {
  port: '/dev/ttyAMA0',
  baudrate: 9600,
};

client.eventHandlers.attach('SERIAL_PORTMESSAGE', (event) => {
  console.log(event);
});

client.onReady(() => {
  client.bootstrap({'SERIAL_OPEN': openaction}, ['SERIAL_OUTPUT'], ['SERIAL_PORTMESSAGE']).then((events) => {
    let serialOutputEvent = events[0].data;
    if (serialOutputEvent.Cmd == 'Open') {
      console.log('port open, start listening for messages');
    }
  }, (error) => {
    console.log('error', error);
  });
});

client.connect();
