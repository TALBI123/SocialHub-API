const mysql = require("mysql2");
require("dotenv").config();
const pool = mysql
  .createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: "",
    database: process.env.DATABASE,
  })
  .promise();

const DatabaseQuery = async (query, params) => {
  try {
    const [data] = await pool.query(query, params);
    return data;
  } catch (error) {
    console.error(error);
    throw new Error("Database Error : ", error);
  }
};
const getUserbyId = async (id) => {
  try {
    const [data] = await DatabaseQuery("SELECT * FROM users WHERE id = ?", [
      id,
    ]);
    return data;
  } catch (error) {
    console.log(error);
    throw new Error("Database Error : ", error);
  }
};
module.exports = { DatabaseQuery,getUserbyId };
