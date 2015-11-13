'use strict';

let newClient = require('rotonde-client/src/Client');

let client = newClient('ws://rotonde:4224/');

const tty = '/dev/tty.usbserial-AH02LTLV';

let openaction = {
  port: tty,
  baud: 115200,
};

let scanned = false;
let RFID_tag = '';

client.eventHandlers.attach('SERIAL_READ', (event) => {
  
  
  if(event.data.port !== tty){
    //console.log(event);
    return;
  }

  let packet_data = new Buffer(event.data.data , 'base64');
  let ascii_data = packet_data.toString();

  if(ascii_data.startsWith( '\u0002')) {
    ascii_data = ascii_data.slice(1, ascii_data.length);
    RFID_tag = '';
    scanned = false;
  }
  if(ascii_data.endsWith( '\u0003' )) {
    console.log("stopstring");
    ascii_data = ascii_data.slice(0, ascii_data.length-1);
    scanned = true;
  }

  RFID_tag += ascii_data;

  if(scanned) {
    scanned = false;
    check_rfid_data(RFID_tag);
    RFID_tag = '';
  }
});

//send RFID event to rotonde
function send_rfid_event(tag) {

  client.sendEvent('RFID_RECEIVED' , {tag: tag});
  console.log("RFID RECEIVED : " + tag);
}

//Check data integrity
function check_rfid_data(tag) {

  //return error if length of data is not even
  if(tag.length %2 === 1){
    return console.log("Error in card number reception");
  }

  //Calculate checksum
  let checksum = 0;
  for (let i = 0; i < tag.length-2; i+=2) { 
    let temp = parseInt(tag.substr(i , 2) , 16);
    checksum = checksum ^ temp;
  }

  if(checksum === parseInt(tag.substr(tag.length -2 , 2) , 16)){
    console.log("checksum ok");
    //Remove the checksum from the car number before sending it
    tag = tag.slice(0, tag.length -2);
    send_rfid_event(tag);
  } else {
    console.log("checksum not ok");
  }
}

//definitions of module events
client.addLocalDefinition('event' , 'RFID_RECEIVED' , [
    {
      name: 'tag',
      type: 'string',
    },
  ]);

function openport() {
  client.bootstrap({'SERIAL_OPEN': openaction}, ['SERIAL_STATUS'] , ['SERIAL_READ']).then((events) => {
    let serialOutputEvent = events[0].data;
    if (serialOutputEvent.status == 'SUCCESS') {
      console.log('port open, start listening for messages');
    }
  }, (error) => {
    console.log('error', error);
  });
}



client.onReady(() => {
  client.bootstrap({'SERIAL_CLOSE': {port:tty}}, [] , ['SERIAL_STATUS']).then((events) => {
    console.log('sent close');
    //Wait for the serial module to close the connection if already open (1s delay)
    client.eventHandlers.makePromise('SERIAL_STATUS' , 1500).then( openport , openport);
  }, (error) => {
    console.log('error', error);
  });
});

client.connect();

