const test = require('node:test');
const assert = require('node:assert/strict');

test('triggerRegEx capture groups map trigger, name, and id', () => {
  const { triggerRegEx } = require('react-native-controlled-mentions/dist/utils/constraints');
  const regex = new RegExp(triggerRegEx.source, 'gi');
  const value =
    'Met {@}[David Tabaka](123), fought {#}[Goblin](null), found {@}[Ada Lovelace](abc-123).';

  const matches = Array.from(value.matchAll(regex));
  assert.equal(matches.length, 3);

  const [first, second, third] = matches;
  assert.equal(first[2], '@');
  assert.equal(first[3], 'David Tabaka');
  assert.equal(first[4], '123');

  assert.equal(second[2], '#');
  assert.equal(second[3], 'Goblin');
  assert.equal(second[4], 'null');

  assert.equal(third[2], '@');
  assert.equal(third[3], 'Ada Lovelace');
  assert.equal(third[4], 'abc-123');
});
