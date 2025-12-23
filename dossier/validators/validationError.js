const handleError = (dbError, res, message) => {
  if (dbError.Code === "ER_DUP_ENTRY") return res.status(400).json({ message });
  return res.status(500).json({ message: "Internel error server" });
};
module.exports = { handleError };
