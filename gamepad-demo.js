var util = require('util'),
    _ = require('lodash');

var gamepad = require('./lib/gamepad'),
    arDrone = require('ar-drone');

function dump() {
    console.log.apply(console, [].map.call(arguments, function(arg) { return util.inspect(arg, {colors:true}); }));
}

console.log('>>> create ardrone-client...');
var drone = arDrone.createClient();

console.log('>>> configuring ardrone-client...');
drone.config('general:navdata_demo', 'TRUE', function(err) { if(err) console.log(err); });



var lastNavData = {};
drone.on('navdata', function(data) {
    lastNavData = _.pick(data.demo, [
            'controlState', 'flyState', 'batteryPercentage',
            'altitude',
            'frontBackDegrees', 'leftRightDegrees', 'clockwiseDegrees',
            'xVelocity', 'yVelocity', 'zVelocity'
    ]);

    lastNavData.flying = data.droneState.flying;

    dump(lastNavData);
});



gamepad.on('press', function(which) {
    switch(which) {
        case '10': // start
            if(lastNavData.flying) {
                drone.land();
            } else {
                drone.takeoff();
                drone.stop();
            }

            break;

        default: break;
    }
});


gamepad.on('moveQ', function(which, a) {
    dump(which, a);
    if(which === 'leftStick') {
        if(a.x === 0 && a.y === 0) {
            drone.stop();
        } else {
            if (a.x >= 0) {
                drone.right(a.x);
            } else {
                drone.left(-a.x);
            }

            if (a.y >= 0) {
                drone.front(a.y);
            } else {
                drone.back(-a.y);
            }
        }
    } else if(which === 'rightStick') {
        if(a.y >= 0) {
            drone.up(a.y);
        } else {
            drone.down(-a.y);
        }

        if(a.x >= 0) {
            drone.clockwise(a.x);
        } else {
            drone.counterClockwise(-a.x);
        }
    }
});