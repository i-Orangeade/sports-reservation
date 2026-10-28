/**
 * 极简测试运行器（零依赖）
 * 用法：test('名称', fn)；断言失败抛 Error 即记失败。
 */
const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || '断言失败');
}

function assertEqual(actual, expected, msg) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) {
    throw new Error((msg || '值不相等') + '：期望 ' + b + '，实际 ' + a);
  }
}

function assertDeepEqual(actual, expected, msg) {
  assertEqual(actual, expected, msg);
}

function assertThrows(fn, msg) {
  let threw = false;
  try {
    fn();
  } catch (e) {
    threw = true;
  }
  if (!threw) throw new Error((msg || '期望抛出异常') + '，但未抛出');
}

async function run() {
  let passed = 0;
  let failed = 0;
  const failures = [];
  for (const t of tests) {
    try {
      await t.fn();
      passed++;
      console.log('  \u2713 ' + t.name);
    } catch (e) {
      failed++;
      failures.push({ name: t.name, message: e && e.message ? e.message : String(e), stack: e && e.stack });
      console.log('  \u2717 ' + t.name + '\n      -> ' + (e && e.message ? e.message : e));
    }
  }
  return { passed, failed, failures };
}

module.exports = { test, assert, assertEqual, assertDeepEqual, assertThrows, run, _tests: tests };
