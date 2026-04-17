const pkg = require('../package.json');
const {runCLI} = require('./testUtils');

test('git-cz --help', async () => {
  const {getResult} = runCLI(['--help']);

  const result = await getResult();

  expect(result).toMatchSnapshot();
});

test('git-cz --version', async () => {
  const {getResult} = runCLI(['--version']);

  const result = await getResult();

  expect(result.trim()).toBe(pkg.version);
});

test('git-cz --non-interactive', async () => {
  const {getResult} = runCLI(['--non-interactive', '--dry-run']);

  const result = await getResult();

  expect(result).toMatchSnapshot();
});

test('git-cz --non-interactive --format', async () => {
  const {getResult} = runCLI([
    '--non-interactive',
    '--dry-run',
    '--format={type}: {subject}'
  ]);

  const result = await getResult();

  expect(result).toContain('chore: automated commit');
  expect(result).not.toContain('🤖 automated commit');
});

test('git-cz --non-interactive --lerna', async () => {
  const {getResult} = runCLI([
    '--non-interactive',
    '--dry-run',
    '--type=feat',
    '--subject=ship mono package updates',
    '--lerna=core, ui'
  ]);

  const result = await getResult();

  expect(result).toContain('affects: core, ui');
});

test('git-cz --non-interactive --quick', async () => {
  const {getResult} = runCLI([
    '--non-interactive',
    '--dry-run',
    '--quick'
  ]);

  const result = await getResult();

  expect(result).toContain('chore: 🤖 automated commit');
  expect(result).not.toContain('--quick');
});
