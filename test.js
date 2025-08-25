// const bcrypt = require('bcrypt');
// const password = "youness";
// (async () => {
//   const  salt = await bcrypt.genSalt(15);
//   const hashed = await bcrypt.hash(password,salt);
//   console.log(hashed);
//   const isValid = await bcrypt.compare(password,hashed);
//   console.log(isValid)


// })();
const data = { name: "mohamed", age: 15 };
const arr = [1,2,3];
// console.log(arr)
const obj = {
    name:"mohamed",
    age:21,
    affiche : () => {
        return "hello";
    }
}
console.log(obj);