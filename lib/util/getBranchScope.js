const {execSync} = require('child_process');

const getBranchScope = (pattern) => {
  if (!pattern) {
    return undefined;
  }

  const rx = typeof pattern === 'string' ? new RegExp('(' + pattern + ')', 'i') : pattern;

  try {
    const devNull = process.platform === 'win32' ? ' nul' : '/dev/null';
    const branch = execSync('git rev-parse --abbrev-ref HEAD 2>' + devNull)
      .toString()
      .trim();

    const matches = branch.match(rx);

    return matches ? String(matches[1]).toUpperCase() : undefined;
  } catch (error) {
    return undefined;
  }
};

module.exports = getBranchScope;
