const bcrypt = require('bcryptjs');

const password = "password1"; // choose any password
const hashedPassword = bcrypt.hashSync(password, 10);

console.log("Plain Password:", password);
console.log("Hashed Password:", hashedPassword);