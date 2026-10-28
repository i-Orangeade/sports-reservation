/**
 * 事务内 where 用法守卫（回归护栏）
 * 依据：微信云数据库事务「不支持批量操作(where 语句)，只支持单记录操作
 * (collection.doc / collection.add)」。事务回调内出现 .where() 属不合规用法，
 * 会导致事务失败或该操作脱离事务原子性。
 */
const fs = require('fs');
const path = require('path');
const { test, assert } = require('./_lib.js');

const SERVICE_DIR = path.resolve(__dirname, '../cloudfunctions/cloud/project/service');

function scanWhereInTransaction(file) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.indexOf('runTransaction') < 0) continue;
    const indent = (line.match(/^\s*/) || [''])[0];
    // 向后扫描到同缩进的 "});"
    for (let j = i + 1; j < lines.length && j < i + 60; j++) {
      const l = lines[j];
      const lTrim = l.trimStart();
      const lIndent = (l.match(/^\s*/) || [''])[0];
      if (lIndent === indent && lTrim.indexOf('});') === 0) {
        // 在 [i, j] 区间内找 .where(
        for (let k = i + 1; k < j; k++) {
          if (lines[k].indexOf('.where(') >= 0) {
            hits.push((path.basename(file)) + ':' + (k + 1) + ' -> ' + lines[k].trim());
          }
        }
        break;
      }
    }
  }
  return hits;
}

test('事务回调内不得使用 where 查询（微信云数据库不支持）', () => {
  const files = fs.readdirSync(SERVICE_DIR).filter((f) => f.endsWith('.js'));
  const all = [];
  for (const f of files) {
    all.push(...scanWhereInTransaction(path.join(SERVICE_DIR, f)));
  }
  assert(all.length === 0, '发现事务内 where 用法：\n' + all.join('\n'));
});
