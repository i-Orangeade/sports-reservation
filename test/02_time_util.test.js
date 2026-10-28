/**
 * 时间工具纯函数单元测试（加载真实 time_util.js）
 */
const { test, assert, assertEqual } = require('./_lib.js');
const path = require('path');
const timeUtil = require(path.resolve(__dirname, '../cloudfunctions/cloud/framework/utils/time_util.js'));

test('parseSlotKey 解析 "1820_1930"', () => {
  assertEqual(timeUtil.parseSlotKey('1820_1930'), {
    start_min: 1100,
    end_min: 1170,
    start_time: '18:20',
    end_time: '19:30',
  });
});

test('parseSlotKey 对非法输入返回 null', () => {
  assert(timeUtil.parseSlotKey('1820_193') === null, '缺少一位应返回 null');
  assert(timeUtil.parseSlotKey('18201930') === null, '无下划线应返回 null');
  assert(timeUtil.parseSlotKey('') === null, '空串应返回 null');
  assert(timeUtil.parseSlotKey('abcd_efgh') === null, '非数字应返回 null');
});

test('timeToMin / minToTime 互逆', () => {
  assertEqual(timeUtil.timeToMin('18:20'), 1100);
  assertEqual(timeUtil.timeToMin('00:00'), 0);
  assertEqual(timeUtil.timeToMin('23:59'), 1439);
  assertEqual(timeUtil.minToTime(1100), '18:20');
  assertEqual(timeUtil.minToTime(0), '00:00');
  assertEqual(timeUtil.minToTime(1439), '23:59');
});

test('addDays 跨月/跨年', () => {
  assertEqual(timeUtil.addDays('2026-10-31', 1), '2026-11-01');
  assertEqual(timeUtil.addDays('2026-12-31', 1), '2027-01-01');
  assertEqual(timeUtil.addDays('2026-03-01', -1), '2026-02-28');
  assertEqual(timeUtil.addDays('2024-03-01', -1), '2024-02-29'); // 闰年
});

test('dayOfWeek / isWeekend', () => {
  // 2026-10-26 是周一
  assertEqual(timeUtil.dayOfWeek('2026-10-26'), 1, '2026-10-26 应为周一(1)');
  assert(timeUtil.isWeekend('2026-10-31') === true, '2026-10-31 应为周六');
  assert(timeUtil.isWeekend('2026-11-01') === true, '2026-11-01 应为周日');
  assert(timeUtil.isWeekend('2026-10-26') === false, '2026-10-26 应为工作日');
});

test('formatDate / dateStartTimestamp / dateMinuteToTimestamp 往返', () => {
  // 北京 2026-10-26 00:00
  const dayStart = timeUtil.dateStartTimestamp('2026-10-26');
  assertEqual(timeUtil.formatDate(dayStart), '2026-10-26');
  // 北京 2026-10-26 21:00 = 1260 分钟
  const ts = timeUtil.dateMinuteToTimestamp('2026-10-26', 1260);
  assertEqual(timeUtil.formatDate(ts), '2026-10-26');
  // 21:00 当天分钟数
  const d = new Date(ts + timeUtil.CN_OFFSET_MS);
  assertEqual(d.getUTCHours(), 21, '应为 21 点');
  assertEqual(d.getUTCMinutes(), 0, '应为 0 分');
});

test('timestamp2Time 格式化', () => {
  const ts = timeUtil.dateMinuteToTimestamp('2026-10-26', 1100); // 18:20
  assertEqual(timeUtil.timestamp2Time(ts, 'Y-M-D h:m:s'), '2026-10-26 18:20:00');
  assertEqual(timeUtil.timestamp2Time(ts, 'h:m'), '18:20');
});

test('nowMinutes 在 0~1439 范围内', () => {
  const m = timeUtil.nowMinutes();
  assert(m >= 0 && m <= 1439, 'nowMinutes 超出范围：' + m);
});
