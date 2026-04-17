const parseLernaPackages = (lerna) => {
  if (!lerna) {
    return [];
  }

  return String(lerna)
    .split(',')
    .map((pkg) => pkg.trim())
    .filter(Boolean);
};

const runNonInteractiveMode = (state, {type = 'chore', subject = 'automated commit', ...restAnswers}) => {
  const answers = {
    subject,
    type,
    ...restAnswers
  };

  const packages = parseLernaPackages(answers.lerna);

  Object.keys(state.answers).forEach((key) => {
    if (answers[key]) {
      state.answers[key] = answers[key];
      delete answers[key];
    }
  });

  if (packages.length > 0) {
    state.answers.packages = packages;
  }
};

module.exports = runNonInteractiveMode;
