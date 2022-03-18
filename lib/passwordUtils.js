/*
* Please note: 
* This is a basic, but standard way of encrypting passwords: passport allows us to encrypt passwords in any way we want.
* This is the implementation from this video https://www.youtube.com/watch?v=F-sFp_AvHc8&t=
*/

const crypto = require('crypto');

function genPassword(password) {

    // Using https://datatracker.ietf.org/doc/html/rfc8018 pbkdf2 method
    var salt = crypto.randomBytes(32).toString('hex');
    var genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

    return {
        salt: salt,
        hash: genHash
    };
}


function validPassword(password, hash, salt) {

    var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

    return hash === hashVerify;

}



module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;