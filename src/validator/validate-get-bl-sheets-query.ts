import { checkSchema } from "express-validator";

const getBLSheetsQueryValidator = checkSchema(
  {
    search: {
      trim: true,
      customSanitizer: {
        options: (value: unknown) => {
          return value ? value : "";
        },
      },
    },

    type: {
      trim: true,
      customSanitizer: {
        options: (value: unknown) => {
          if (value === "all") return "";
          return value ? value : "";
        },
      },
    },

    currentPage: {
      customSanitizer: {
        options: (value) => {
          const parsedValue = Number(value);
          return isNaN(parsedValue) ? 1 : parsedValue;
        },
      },
    },

    perPage: {
      customSanitizer: {
        options: (value) => {
          const parsedValue = Number(value);
          return isNaN(parsedValue) ? 6 : parsedValue;
        },
      },
    },
  },
  ["query"]
);

export default getBLSheetsQueryValidator;
