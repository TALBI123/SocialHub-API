const { body, param, query, validationResult } = require("express-validator");
// ---------- Unique Error Type ---------- //
const uniqueErrors = (errors) =>
  Object.values(
    errors.array().reduce((acc, err) => {
      if (!acc[err.path]) acc[err.path] = err;
      return acc;
    }, [])
  );

// ---------- valdation columns ---------- //

const keyValidation = (key, minCharacter = 0) =>
  body(key)
    .notEmpty()
    .withMessage(`${key} is required`)
    .isLength({ min: minCharacter })
    .withMessage(`${key} must be at least ${minCharacter} characters`);

// ---------- valdation ids ---------- //

const idValidation = (key) =>
  body(key)
    .exists()
    .withMessage(`${key} is required`)
    .isInt({ min: 1 })
    .withMessage(`${key} must be a positive integer`)
    .toInt();

const idValidationNotRequired = (key) =>
  body(key)
    .optional()
    .isInt({ min: 1 })
    .withMessage(`${key} must be a positive integer`);

// ---------- valdation ids in parameter ---------- //

const paramValidaion = (key) =>
  param(key).isInt({ min: 1 }).withMessage(`${key} must be a positive integer`);
// ---------- valdation ids in parameter ---------- //

const queryValdition = (key) =>
  query(key)
    .notEmpty()
    .withMessage("Search field cannot be empty. Please enter a search term.");

const optionelQueryValdition = (key) =>
  query(key)
    .optional()
    .isInt({ min: 1 })
    .withMessage(`${key} must be a positive integer`);
// ---------- valdation user inputs ---------- //

const userValidation = [
  body("email")
    .notEmpty()
    .trim()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email"),
  keyValidation("password", 6),
];
// ---------- valdation like type ---------- //
const validationEnums = (enums) =>
  body("status")
    .optional()
    .isIn(enums)
    .withMessage("Status must be one of: like,love,laugh,sad");
module.exports = {
  uniqueErrors,
  keyValidation,
  validationResult,
  userValidation,
  gender: body("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .isIn(["male", "female"])
    .withMessage("Must be male or female"),
  validationPost: [keyValidation("title", 8), keyValidation("body")],
  idValidation,
  idValidationNotRequired,
  paramValidaion,
  validationEnums,
  queryValdition,
  optionelQueryValdition,
};
