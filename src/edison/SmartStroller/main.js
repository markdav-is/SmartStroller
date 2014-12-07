

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

    var old_left_touch_sensor_value = 0;
    var old_right_touch_sensor_value = 0;
    var old_left_turn_sensor_value = 0;
    var old_right_turn_sensor_value = 0;

    var old_left_turn_led_value = 0;
    var old_right_turn_led_value = 0;
    var old_solenoid_value = -1;

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
        if(old_solenoid_value!=solenoid_value){
            old_solenoid_value=solenoid_value;
            SaveToCloud('break',solenoid_value);
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
        if(old_left_turn_led_value!=left_turn_led_value){
            old_left_turn_led_value=left_turn_led_value;
            SaveToCloud('left',left_turn_led_value);
        }
        right_turn_led_pin.write(right_turn_led_value);
        if(old_right_turn_led_value!=right_turn_led_value){
            old_right_turn_led_value=right_turn_led_value;
            SaveToCloud('right',left_turn_led_value);
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

function SaveToCloud(itemType, newValue){
        var req = require('request');
        req.post('https://smartstroller.azure-mobile.net/tables/todoitem/',
            { json: { itemtype : itemType, text:newValue } },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body);
                }
            }
        );
    }



