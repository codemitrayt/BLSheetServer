import { checkSchema } from "express-validator";

const getTodoListQueryValidator = checkSchema(
  {
    date: {
      customSanitizer: {
        options: (value) => {
          return value ? new Date(value) : null;
        },
      },
    },
  },
  ["query"]
);

export default getTodoListQueryValidator;
