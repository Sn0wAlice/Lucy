const tr = require('tor-request');

tr.request("http://juhanurmihxlp77nkq76byazcldy2hlmovfu2epvl5ankdibsot4csyd.onion", function (err, res, body) {
    console.log(body)
});