const maleImage =
  "https://res.cloudinary.com/dvlipviet/image/upload/v1746130612/male-user-avatar-icon-in-flat-design-style-person-signs-illustration-png_ncsrhy.png";
const femaleImage =
  "https://res.cloudinary.com/dvlipviet/image/upload/v1746131122/aesthetic-cute-muslim-girl-with-hijab-flat-detailed-avatar-illustration-beautiful-muslim-woman-hijabi-cartoon-vector_hvno3y.jpg";
const saltRound = +process.env.SALT_ROUND;
module.exports = {
  maleImage,
  femaleImage,
  saltRound,
  convertToMinutes: (min) => 1000 * 60 * min,
  generateCode: () => Math.floor(10 ** 5 + Math.random() * 9 * 10 ** 5),
};