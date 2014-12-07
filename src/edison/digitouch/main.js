/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */
/*global */

/*
A simple node.js application intended to read data from Digital pins on the Intel based development boards such as the Intel(R) Galileo and Edison with Arduino breakout board.

MRAA - Low Level Skeleton Library for Communication on GNU/Linux platforms
Library in C/C++ to interface with Galileo & other Intel platforms, in a structured and sane API with port nanmes/numbering that match boards & with bindings to javascript & python.

Steps for installing MRAA & UPM Library on Intel IoT Platform with IoTDevKit Linux* image
Using a ssh client: 
1. echo "src maa-upm http://iotdk.intel.com/repos/1.1/intelgalactic" > /etc/opkg/intel-iotdk.conf
2. opkg update
3. opkg upgrade

Article: https://software.intel.com/en-us/html5/articles/intel-xdk-iot-edition-nodejs-templates
*/

var mraa = require('mraa'); //require mraa
//var req = require('request');
console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the console

var myDigitalPin6 = new mraa.Gpio(6); //setup digital read on Digital pin #6 (D6)
myDigitalPin6.dir(mraa.DIR_IN); //set the gpio direction to input
var current = myDigitalPin6.read();

periodicActivity(); //call the periodicActivity function

function periodicActivity() //
{
  var myDigitalValue =  myDigitalPin6.read(); //read the digital value of the pin
  console.log('Gpio is ' + myDigitalValue); //write the read value out to the console
    if(myDigitalValue != current){
        current = myDigitalValue;
        console.log('value changed!'); //write the read value out to the console
        var req = require('request');
        req.post('https://smartstroller.azure-mobile.net/tables/todoitem/',
            { json: { itemtype : 'touch', text:current } },
            function (error, response, body) {
                console.log(body)
                if (!error && response.statusCode == 200) {
                    console.log(body)
                }
            }
        );
        console.log('posted!'); //write the read value out to the console
    }
  setTimeout(periodicActivity,1000); //call the indicated function after 1 second (1000 milliseconds)
}