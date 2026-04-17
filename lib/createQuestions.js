/* eslint-disable import/no-dynamic-require, global-require */
const qBody = require('./questions/body');
const qBreaking = require('./questions/breaking');
const qIssues = require('./questions/issues');
const qLerna = require('./questions/lerna');
const qScope = require('./questions/scope');
const qSubject = require('./questions/subject');
const qType = require('./questions/type');

const creators = {
  body: qBody,
  breaking: qBreaking,
  issues: qIssues,
  lerna: qLerna,
  scope: qScope,
  subject: qSubject,
  type: qType
};

const getQuestionNames = (config, quick) => {
  const questionNames = quick
    ? config.quickQuestions || ['type', 'scope', 'subject']
    : config.questions;

  if (!Array.isArray(questionNames)) {
    throw new TypeError('questions config must be an array.');
  }

  return questionNames;
};

const createQuestions = (state, cliAnswers, {quick = false} = {}) => {
  const questionNames = getQuestionNames(state.config, quick);

  const questions = questionNames
    .filter((name) => creators[name] && cliAnswers[name] === undefined)
    .map((name) => {
      const question = creators[name].createQuestion(state);

      if (state.config.messages && state.config.messages[name]) {
        question.message = state.config.messages[name];
      }

      return question;
    });

  return questions.filter(Boolean);
};

module.exports = createQuestions;
