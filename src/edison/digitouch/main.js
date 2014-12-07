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





/* ----------------------------------------------------
                     Smart Stroller     
   ----------------------------------------------------
*/
var mraa = require("mraa"); // Must have this, provides interface to GPIO pins

// ----------------------------
//         Global Vars
// ----------------------------

    var left_touch_sensor_pin = new mraa.Gpio(2);
    var right_touch_sensor_pin = new mraa.Gpio(3);
    var left_turn_sensor_pin = new mraa.Gpio(4);
    var right_turn_sensor_pin = new mraa.Gpio(5);
    var left_turn_led_pin = new mraa.Gpio(11);
    var right_turn_led_pin = new mraa.Gpio(12);
    var solenoid_pin = new mraa.Gpio(13);

// ---------------------------------------------------------------
//                     Application Entry Point
// ---------------------------------------------------------------

    setupIO();  // Setup pin directions and initial states

    var left_touch_sensor_value = 0;
    var right_touch_sensor_value = 0;
    var left_turn_sensor_value = 0;
    var right_turn_sensor_value = 0;
    var left_turn_led_value = 0;
    var right_turn_led_value = 0;
    var solenoid_value = 0;

    // ----- Call function defined below forever after delay ---------------
    setInterval(function () {

        // Read sensor data
        left_touch_sensor_value = left_touch_sensor_pin.read();
        right_touch_sensor_value = right_touch_sensor_pin.read();
        left_turn_sensor_value = left_turn_sensor_pin.read();
        right_turn_sensor_value = right_turn_sensor_pin.read();

        
        // ----------- Process touch sensors ------------------
        if(left_touch_sensor_value || right_touch_sensor_value)
        {
            // Retract brake
            solenoid_value = 1;
        }
        else
        {
            // Extend brake
            solenoid_value = 0;
        }
        solenoid_pin.write(solenoid_value);
        
        
        // ----------- Process turn signal sensors ------------------
        if(left_turn_sensor_value && right_turn_sensor_value)
        {
            // Brake
            left_turn_led_value = 1;
            right_turn_led_value = 1;
        }
        else if(left_turn_sensor_value && !right_turn_sensor_value)
        {
            // Left turn signal
            left_turn_led_value = ~left_turn_sensor_value;
            right_turn_led_value = 0;
        }
        else if(!left_turn_sensor_value && right_turn_sensor_value)
        {
            // Right turn signal
            left_turn_led_value = 0;
            right_turn_led_value = ~right_turn_sensor_value;
        }
        else
        {
            // Turn off both signals
            left_turn_led_value = 0;
            right_turn_led_value = 0;
        }
        left_turn_led_pin.write(left_turn_led_value);
        right_turn_led_pin.write(right_turn_led_value);
        
    }, 500);

// ---------------------------------------------------------------
//                    Setup Input/Output Pins
// ---------------------------------------------------------------
function setupIO()
{
    left_touch_sensor_pin.dir(mraa.DIR_IN);
    right_touch_sensor_pin.dir(mraa.DIR_IN);
    left_turn_sensor_pin.dir(mraa.DIR_IN);
    right_turn_sensor_pin.dir(mraa.DIR_IN);
    
    left_turn_led_pin.dir(mraa.DIR_OUT);
    right_turn_led_pin.dir(mraa.DIR_OUT);
    solenoid_pin.dir(mraa.DIR_OUT);
    
    // Initial values
    solenoid_pin.write(0);
    left_turn_led_pin.write(0);
    right_turn_led_pin.write(0);
}

