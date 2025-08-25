const { DatabaseQuery } = require("../config/db");

const assertRecordExists  = async (id, tableName, columnName) => {
  const data =await DatabaseQuery(
    `SELECT * FROM ${tableName} WHERE ${columnName} = ?`,
    [id]
  );
  if (!data.length) throw new Error(`${tableName} are not found`);
};
module.exports = { assertRecordExists };
