jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

const {execSync} = require('child_process');
const getBranchScope = require('../lib/util/getBranchScope');

describe('getBranchScope()', () => {
  beforeEach(() => {
    execSync.mockReset();
  });

  it('returns undefined when branchScopePattern is not set', () => {
    expect(getBranchScope(null)).toBeUndefined();
    expect(execSync).not.toHaveBeenCalled();
  });

  it('extracts and uppercases scope using string pattern', () => {
    execSync.mockReturnValue(Buffer.from('feature/ab-123-add-tests\n'));

    const scope = getBranchScope('[a-z]{2}-\\d+');

    expect(scope).toBe('AB-123');
  });

  it('extracts scope with regex pattern', () => {
    execSync.mockReturnValue(Buffer.from('feature/core-new-api\n'));

    const scope = getBranchScope(/feature\/(core)-/i);

    expect(scope).toBe('CORE');
  });

  it('returns undefined when branch name does not match', () => {
    execSync.mockReturnValue(Buffer.from('feature/no-ticket\n'));

    const scope = getBranchScope('[A-Z]{2}-\\d+');

    expect(scope).toBeUndefined();
  });

  it('returns undefined when git command throws', () => {
    execSync.mockImplementation(() => {
      throw new Error('git failed');
    });

    const scope = getBranchScope('ABC-\\d+');

    expect(scope).toBeUndefined();
  });
});
