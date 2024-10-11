import { checkSchema } from "express-validator";

const getIssuesQueryValidator = checkSchema(
  {
    search: {
      trim: true,
      customSanitizer: {
        options: (value: unknown) => {
          return value ? value : "";
        },
      },
    },

    priority: {
      trim: true,
      customSanitizer: {
        options: (value: unknown) => {
          if (value === "all") return null;
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

    isSort: {
      customSanitizer: {
        options: (value) => {
          if (!value || value === "false") return false;
          return true;
        },
      },
    },

    isAssignedToMe: {
      customSanitizer: {
        options: (value) => {
          if (!value || value === "false") return false;
          return true;
        },
      },
    },

    isCreatedByMe: {
      customSanitizer: {
        options: (value) => {
          if (!value || value === "false") return false;
          return true;
        },
      },
    },

    status: {
      customSanitizer: {
        options: (value) => {
          if (!value) return null;
          return value;
        },
      },
    },

    labels: {
      customSanitizer: {
        options: (value) => {
          if (!value) return [];
          return value;
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

export default getIssuesQueryValidator;
