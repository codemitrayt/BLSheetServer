const EVENTS = {
  WORKING: "WORKING...",
  HELLO: "HELLO",

  SIGN_UP: "SIGN_UP",
  LOGIN: "LOGIN",
  CREATE_PASSWORD: "CREATE_PASSWORD",
  FORGOT_PASSWORD: "FORGOT_PASSWORD",
  RESET_PASSWORD: "RESET_PASSWORD",

  CREATE_PROJECT_TASK: "CREATE_PROJECT_TASK",
  GET_PROJECT_TASKS: "GET_PROJECT_TASKS",
  DELETE_PROJECT_TASK: "DELETE_PROJECT_TASK",

  ASSIGN_MEMBER_TO_PROJECT_TASK: "ASSIGN_MEMBER_TO_PROJECT_TASK",

  CREATE_PROJECT_TASK_COMMENT: "CREATE_PROJECT_TASK_COMMENT",
  GET_PROJECT_TASK_COMMENT: "GET_PROJECT_TASK_COMMENT",
  DELETE_PROJECT_TASK_COMMENT: "DELETE_PROJECT_TASK_COMMENT",
  UPDATE_PROJECT_TASK_COMMENT: "UPDATE_PROJECT_TASK_COMMENT",
  REPLY_TO_PROJECT_TASK_COMMENT: "REPLY_TO_PROJECT_TASK_COMMENT",
  GET_PROJECT_TASK_COMMENT_REPLIES: "GET_PROJECT_TASK_COMMENT_REPLIES",

  CREATE_ISSUE: "CREATE_ISSUE",

  ASSIGN_MEMBER_TO_PROJECT_ISSUE: "ASSIGN_MEMBER_TO_PROJECT_ISSUE",
  CREATE_PROJECT_ISSUE_COMMENT: "CREATE_PROJECT_ISSUE_COMMENT",
  GET_PROJECT_ISSUE_COMMENT: "GET_PROJECT_ISSUE_COMMENT",
  DELETE_PROJECT_ISSUE_COMMENT: "DELETE_PROJECT_ISSUE_COMMENT",
  UPDATE_PROJECT_ISSUE_COMMENT: "UPDATE_PROJECT_ISSUE_COMMENT",
  REPLY_TO_PROJECT_ISSUE_COMMENT: "REPLY_TO_PROJECT_ISSUE_COMMENT",
  GET_PROJECT_ISSUE_COMMENT_REPLIES: "GET_PROJECT_ISSUE_COMMENT_REPLIES",
  GET_PROJECT_TASK: "GET_PROJECT_TASK",
};

export default EVENTS;
