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
    
    var prev_left_touch_sensor_value = 0;
    var prev_right_touch_sensor_value = 0;
    var prev_left_turn_sensor_value = 0;
    var prev_right_turn_sensor_value = 0;
    
    var left_turn_led_value = 0;
    var right_turn_led_value = 0;
    var solenoid_value = 0;

    var prev_left_turn_led_value = 0;
    var prev_right_turn_led_value = 0;
    var prev_solenoid_value = 0;

    // ----- Call function defined below forever after delay ---------------
    setInterval(function () {

        // Store previous sensor values
       prev_left_touch_sensor_value = left_touch_sensor_value;
       prev_right_touch_sensor_value = right_touch_sensor_value;
       prev_left_turn_sensor_value = left_turn_sensor_value;
       prev_right_turn_sensor_value = right_turn_sensor_value;
    
        // Read sensor data
        left_touch_sensor_value = left_touch_sensor_pin.read();
        right_touch_sensor_value = right_touch_sensor_pin.read();
        left_turn_sensor_value = left_turn_sensor_pin.read();
        right_turn_sensor_value = right_turn_sensor_pin.read();

        // Save previous solenoid and LED values
        prev_left_turn_led_value = left_turn_led_value;
        prev_right_turn_led_value = right_turn_led_value;
        prev_solenoid_value = solenoid_value;

        
        // ---- If any of the sensor values changed then log in the cloud ----
        if(prev_left_touch_sensor_value != left_touch_sensor_value)
        {
            save_to_cloud('left_touch_sensor', left_touch_sensor_value);
        }
        if(prev_right_touch_sensor_value != right_touch_sensor_value)
        {
            save_to_cloud('right_touch_sensor', right_touch_sensor_value);
        }
        if(prev_left_turn_sensor_value != left_turn_sensor_value)
        {
            save_to_cloud('left_turn_sensor', left_turn_sensor_value);
        }
        if(prev_right_turn_sensor_value != right_turn_sensor_value)
        {
            save_to_cloud('right_turn_sensor', right_turn_sensor_value);
        }
        
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
        if(prev_solenoid_value != solenoid_value)
        {
            save_to_cloud('brake',solenoid_value);
        }
        
        
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
            left_turn_led_value = ~left_turn_led_value;
            right_turn_led_value = 0;
        }
        else if(!left_turn_sensor_value && right_turn_sensor_value)
        {
            // Right turn signal
            left_turn_led_value = 0;
            right_turn_led_value = ~right_turn_led_value;
        }
        else
        {
            // Turn off both signals
            left_turn_led_value = 0;
            right_turn_led_value = 0;
        }
        left_turn_led_pin.write(left_turn_led_value);
        right_turn_led_pin.write(right_turn_led_value);
        
        if(prev_left_turn_led_value != left_turn_led_value)
        {
            save_to_cloud('left',left_turn_led_value);
        }
        if(prev_right_turn_led_value != right_turn_led_value)
        {
            save_to_cloud('right',right_turn_led_value);
        }
        
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

// ---------------------------------------------------------------
//                      Post data to cloud
// ---------------------------------------------------------------
function save_to_cloud(itemtype_arg, text_arg)
{
    var req = require('request');
    
    console.log('Data: ' + text_arg); //write the read value out to the console
   
   req.post('https://smartstroller.azure-mobile.net/tables/todoitem/',
      { json: { itemtype : itemtype_arg, text:text_arg } },
      function (error, response, body) {
          console.log(body)
          if (!error && response.statusCode == 200) {
              console.log(body)
          }
      }
      
   );
   
   console.log('posted!'); //write the read value out to the console
}

