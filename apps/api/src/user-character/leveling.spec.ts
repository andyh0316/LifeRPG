import { levelFromXp } from './leveling';

describe('levelFromXp', () => {
  it('returns the correct level for various xp values', () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(4)).toBe(1);
    expect(levelFromXp(10)).toBe(2);
    expect(levelFromXp(1000)).toBe(12);
    expect(levelFromXp(999999)).toBe(100);
  });
});
