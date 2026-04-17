const createQuestions = require('../lib/createQuestions');

const makeState = () => ({
  answers: {
    body: '',
    breaking: '',
    issues: '',
    lerna: '',
    scope: '',
    subject: '',
    type: ''
  },
  config: {
    branchScopePattern: null,
    customScopeInput: false,
    disableEmoji: false,
    list: ['feat'],
    maxMessageLength: 64,
    maxScopeLength: 10,
    messages: null,
    minMessageLength: 3,
    quickQuestions: ['type', 'subject'],
    questions: ['type', 'scope', 'subject', 'body'],
    scopes: ['core'],
    types: {
      feat: {
        description: 'A new feature',
        emoji: '🎸',
        value: 'feat'
      }
    }
  }
});

describe('createQuestions()', () => {
  it('uses default question list when quick mode is disabled', () => {
    const questions = createQuestions(makeState(), {}, {quick: false});

    expect(questions.map((question) => question.name)).toEqual([
      'type',
      'scope',
      'subject',
      'body'
    ]);
  });

  it('uses quickQuestions list when quick mode is enabled', () => {
    const questions = createQuestions(makeState(), {}, {quick: true});

    expect(questions.map((question) => question.name)).toEqual([
      'type',
      'subject'
    ]);
  });

  it('removes prefilled CLI answers from quick questions', () => {
    const questions = createQuestions(makeState(), {type: 'feat'}, {quick: true});

    expect(questions.map((question) => question.name)).toEqual([
      'subject'
    ]);
  });

  it('throws when quickQuestions is not an array', () => {
    const state = makeState();
    state.config.quickQuestions = 'type';

    expect(() => createQuestions(state, {}, {quick: true})).toThrow(TypeError);
  });
});
