const bcrypt = require("bcryptjs");
const hash = bcrypt.hashSync("Admin@artist123", 10);
console.log("HASHED PASSWORD:", hash);
