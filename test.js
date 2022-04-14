const bcrypt = require('bcrypt');

let password = "999999";
let email = "vdmax94@gmail.com";

const hash = bcrypt.hashSync(password, 10);

const comp = bcrypt.compareSync("9999990", "$2b$10$ioqbwWtSRk0LGHhkbIgxZ.vF47Bhvmppk6yWkfAXc6fDQvaIbX2bu");

console.log(comp);