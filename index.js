'use strict';

'use strict';

let newClient = require('rotonde-client/src/Client');

let client = newClient('ws://localhost:4224/');

let openaction = {
  port: '/dev/ttyAMA0',
  baudrate: 9600,
};

client.onReady(() => {
  client.bootstrap({'SERIAL_OPEN': openaction}, ['SERIAL_OUTPUT']).then((events) => {
    console.log('onready', events);
    client.eventHandlers.attach('SERIAL_PORTMESSAGE', (event) => {
      console.log(event);
    });
  }, (error) => {
    console.log('error', error);
  });
});

client.connect();
