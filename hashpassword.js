const bcrypt = require('bcryptjs');
 
const passwordToHash = "hello123";
const saltRounds = 10;
 
bcrypt.hash(passwordToHash, saltRounds, (err, hash) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Hashed Password:', hash);
    }
});