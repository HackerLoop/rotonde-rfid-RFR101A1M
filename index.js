'use strict';

let newClient = require('rotonde-client/src/Client');

let client = newClient('ws://192.168.1.50:4224/');

let openaction = {
  port: '/dev/ttyAMA0',
  baudrate: 9600,
};

let scanned = false;
let RFID_tag = '';

client.eventHandlers.attach('SERIAL_PORTMESSAGE', (event) => {
  
  console.log(event);
  let packet_data = event.data.D;

  if(event.data.D.startsWith( '\u0002')) {
    console.log("startstring");
    packet_data = packet_data.slice(1, packet_data.length);
    RFID_tag = '';
    scanned = false;
  }
  if(event.data.D.endsWith( '\u0003' )) {
    console.log("stopstring");
    packet_data = packet_data.slice(0, packet_data.length-1);
    scanned = true;
  }

  RFID_tag += packet_data;

  if(scanned) {
    scanned = false;
    check_rfid_data(RFID_tag);
    //send_rfid_event();
    RFID_tag = '';
  }
});

function check_data(data) {
  for (let i = 0 ; i < data.length ; i++) {
    console.log("data " + i + " : " , data.charAt(i));
  }
}

//send data to rotonde
function send_rfid_event() {

  client.sendEvent('RFID_RECEIVED' , {tag: RFID_tag});
  console.log("RFID RECEIVED : " + RFID_tag);
}

//send data to rotonde
function check_rfid_data(tag) {

  console.log(tag.length);
  //return error if length of data is not even
  if(tag.length %2 === 1){
    return console.log("Error in card number reception");
  }

  let checksum = 0; //= tag.substr(tag.length() -1);
  for (let i = 0; i < tag.length-2; i+=2) { 
    let temp = '0x' + tag.substr(i , 2);
    checksum = checksum ^ parseInt(temp);
  }

  console.log(checksum , tag.substr(tag.length -2 , 2));
  if(checksum === parseInt(tag.substr(tag.length -2 , 2) , 16)){
    console.log("checksum ok");
    send_rfid_event();
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

client.onReady(() => {
  client.bootstrap({'SERIAL_OPEN': openaction}, ['SERIAL_OUTPUT'], ['SERIAL_PORTMESSAGE']).then((events) => {
    let serialOutputEvent = events[0].data;
    if (serialOutputEvent.Cmd == 'Open') {
      console.log('port open, start listening for messages');
      
      console.log('port open, sent module definitions');
    }
  }, (error) => {
    console.log('error', error);
  });
});

client.connect();

