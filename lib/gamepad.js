var Gamepad = require( 'node-gamepad');

var gamepad = new Gamepad('logitech/dualaction', {
    configPath: __dirname + '/../data/dualaction.json'
});

gamepad.connect();


// based on easeInOutQuad-equation from https://github.com/warrenm/AHEasing/blob/master/AHEasing/easing.c
function ease(p) {
    if(p === 0) { return 0; }

    var sign = (p < 0)? -1 : 1,
        abs = Math.abs(p);

    if(abs < 0.5) {
        return sign * 4 * Math.pow(abs, 3);
    } else {
        var f = ((2 * abs) - 2);
        return sign * (0.5 * Math.pow(f, 3) + 1);
    }
}

// normalize values from range [0,255] to range [-1,1] with given precision and easing
function normalize(p, precision) {
    var mult = Math.pow(10, precision);
    return {
        x: Math.round(mult * ease((p.x - 128)/128)) / mult,
        y: Math.round(mult * ease(-(p.y - 128)/128)) / mult
    }
}


var lastQValues = {};

// add events for quantized and normalized movements
gamepad.on('move', function(which, a) {
    a = normalize(a, 1);

    if(!lastQValues[which]) { lastQValues[which] = {}; }
    if(lastQValues[which].x != a.x || lastQValues[which].y != a.y) {
        gamepad.emit('moveQ', which, a);
    }

    lastQValues[which] = a;
});

module.exports = gamepad;