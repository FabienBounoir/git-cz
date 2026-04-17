jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

const fs = require('fs');
const os = require('os');
const path = require('path');
const {execSync} = require('child_process');
const {getAllPackages, getChangedPackages} = require('../lib/util/lerna');

const writeJson = (filepath, value) => {
  fs.writeFileSync(filepath, JSON.stringify(value, null, 2));
};

const createDir = (dirpath) => {
  fs.mkdirSync(dirpath, {recursive: true});
};

describe('lerna util', () => {
  let root;

  beforeEach(() => {
    execSync.mockReset();
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'git-cz-lerna-'));
  });

  afterEach(() => {
    fs.rmSync(root, {recursive: true, force: true});
  });

  it('reads packages from workspace globs and explicit paths', () => {
    writeJson(path.join(root, 'package.json'), {
      workspaces: ['packages/*', 'apps/*', 'tools/special-package']
    });

    createDir(path.join(root, 'packages', 'core'));
    createDir(path.join(root, 'packages', 'ui'));
    createDir(path.join(root, 'apps', 'docs'));
    createDir(path.join(root, 'tools', 'special-package'));

    const packages = getAllPackages({root}).sort();

    expect(packages).toEqual(['core', 'docs', 'special-package', 'ui']);
  });

  it('falls back to packages/* when workspaces are missing', () => {
    writeJson(path.join(root, 'package.json'), {
      name: 'example'
    });

    createDir(path.join(root, 'packages', 'api'));
    createDir(path.join(root, 'packages', 'web'));

    const packages = getAllPackages({root}).sort();

    expect(packages).toEqual(['api', 'web']);
  });

  it('detects changed packages across multiple workspace roots', () => {
    writeJson(path.join(root, 'package.json'), {
      workspaces: {
        packages: ['packages/*', 'apps/*', 'tools/special-package']
      }
    });

    createDir(path.join(root, 'packages', 'core'));
    createDir(path.join(root, 'packages', 'ui'));
    createDir(path.join(root, 'apps', 'docs'));
    createDir(path.join(root, 'tools', 'special-package'));

    execSync.mockReturnValue(Buffer.from([
      'packages/ui/src/button.js',
      'apps/docs/package.json',
      'tools/special-package/index.js',
      'README.md'
    ].join('\n')));

    const changedPackages = getChangedPackages({root}).sort();

    expect(changedPackages).toEqual(['docs', 'special-package', 'ui']);
  });
});
