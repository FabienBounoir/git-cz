const {execSync} = require('child_process');
const path = require('path');
const fs = require('fs');

const DEFAULT_WORKSPACES = ['packages/*'];

const isLerna = (state) =>
  fs.existsSync(path.join(state.root, 'lerna.json'));

const isDir = (root) => (name) => {
  const filepath = path.join(root, name);

  try {
    const stats = fs.statSync(filepath);

    return stats.isDirectory();
  } catch (error) {
    return false;
  }
};

const normalizeWorkspacePath = (workspacePath) =>
  String(workspacePath)
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/\/+$/g, '');

const readWorkspacePackages = (state) => {
  const pkgFilename = path.join(state.root, 'package.json');

  if (!fs.existsSync(pkgFilename)) {
    return [];
  }

  try {
    const workspacesConfig = require(String(pkgFilename)).workspaces;

    if (Array.isArray(workspacesConfig)) {
      return workspacesConfig;
    }

    if (workspacesConfig && Array.isArray(workspacesConfig.packages)) {
      return workspacesConfig.packages;
    }
  // eslint-disable-next-line no-empty
  } catch (error) {
  }

  return [];
};

const resolveWildcardBaseDir = (workspacePackage) => {
  if (!workspacePackage.includes('*')) {
    return null;
  }

  const starIndex = workspacePackage.indexOf('*');
  const prefix = workspacePackage.slice(0, starIndex).replace(/\/+$/g, '');

  return prefix || null;
};

const getPackageDirectories = (state) => {
  const workspacePackages = readWorkspacePackages(state);
  const normalizedWorkspacePackages = (workspacePackages.length ? workspacePackages : DEFAULT_WORKSPACES)
    .map(normalizeWorkspacePath)
    .filter(Boolean);

  const unique = {};

  for (const workspacePackage of normalizedWorkspacePackages) {
    const wildcardBaseDir = resolveWildcardBaseDir(workspacePackage);

    if (wildcardBaseDir) {
      const directory = path.join(state.root, wildcardBaseDir);

      try {
        for (const name of fs.readdirSync(directory).filter(isDir(directory))) {
          unique[(wildcardBaseDir + '/' + name).replace(/\\/g, '/')] = 1;
        }
      // eslint-disable-next-line no-empty
      } catch (error) {
      }

      continue;
    }

    if (isDir(state.root)(workspacePackage)) {
      unique[workspacePackage] = 1;
    }
  }

  return Object.keys(unique);
};

const getAllPackages = (state) => {
  try {
    return getPackageDirectories(state)
      .map((directory) => path.posix.basename(directory))
      .filter(Boolean);
  } catch (error) {
    return [];
  }
};

const getChangedFiles = () => {
  const devNull = process.platform === 'win32' ? ' nul' : '/dev/null';

  return execSync('git diff --cached --name-only 2>' + devNull)
    .toString()
    .trim()
    .split('\n')
    .map((filename) => filename.trim())
    .filter(Boolean);
};

const isFileInDirectory = (filename, directory) =>
  filename === directory || filename.startsWith(directory + '/');

const getChangedPackages = (state) => {
  const unique = {};
  const changedFiles = getChangedFiles();
  const packageDirectories = getPackageDirectories(state);

  for (const filename of changedFiles) {
    const packageDirectory = packageDirectories.find((directory) =>
      isFileInDirectory(filename.replace(/\\/g, '/'), directory)
    );

    if (packageDirectory) {
      unique[path.posix.basename(packageDirectory)] = 1;
    }
  }

  return Object.keys(unique);
};

module.exports = {
  getAllPackages,
  getChangedPackages,
  isLerna
};
