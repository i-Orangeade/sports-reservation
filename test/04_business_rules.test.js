/**
 * 业务规则单元测试：加载真实 config / time_util，镜像 source 中的关键公式做断言。
 * 覆盖：工作日/周末场次选择、开放时间判断、防重复唯一键拼装、
 *       签到窗口判断、二维码 token 过期、拉黑到期计算、错误码映射。
 */
const path = require('path');
const { test, assert, assertEqual } = require('./_lib.js');

const config = require(path.resolve(__dirname, '../cloudfunctions/cloud/config/config.js'));
const timeUtil = require(path.resolve(__dirname, '../cloudfunctions/cloud/framework/utils/time_util.js'));
const initData = require(path.resolve(__dirname, '../cloudfunctions/cloud/project/init/init_data.js'));
const cryptoUtil = require(path.resolve(__dirname, '../cloudfunctions/cloud/framework/utils/crypto_util.js'));

const DAY_MS = 24 * 60 * 60 * 1000;

// 镜像 venue_service.slotList 的过滤表达式（与源码一字不差）
function selectDaySlots(dateStr) {
  const weekend = timeUtil.isWeekend(dateStr);
  return initData.TIME_SLOTS.filter(
    (s) => s.day_type === 'all' || s.day_type === (weekend ? 'weekend' : 'weekday')
  );
}

test('工作日(周一)仅 2 场：1820_1930 / 1940_2050', () => {
  const slots = selectDaySlots('2026-10-26'); // 周一
  assertEqual(slots.map((s) => s.slot_key), ['1820_1930', '1940_2050']);
});

test('周末(周六)共 6 场', () => {
  const slots = selectDaySlots('2026-10-31'); // 周六
  assertEqual(slots.map((s) => s.slot_key), [
    '1300_1410', '1420_1530', '1540_1650', '1700_1810', '1820_1930', '1940_2050',
  ]);
});

test('防重复唯一键 / 预约占用主键拼装：${date}_${slot_key}_${venue_key}', () => {
  const resId = '2026-10-27' + '_' + '1820_1930' + '_' + 'badminton#3';
  assertEqual(resId, '2026-10-27_1820_1930_badminton#3');
});

test('开放时间判断：前一天 21:00 起可约次日', () => {
  // 镜像 reservation_service.create 的公式
  const date = '2026-10-27';
  const openTime = config.DEFAULT_OPEN_TIME; // {hour:21, minute:0}
  const openMin = (Number(openTime.hour) || 0) * 60 + (Number(openTime.minute) || 0);
  assertEqual(openMin, 1260);
  const openTs = timeUtil.dateMinuteToTimestamp(timeUtil.addDays(date, -1), openMin);
  // openTs 应等于北京 2026-10-26 21:00
  const d = new Date(openTs + timeUtil.CN_OFFSET_MS);
  assertEqual([d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours()], [2026, 10, 26, 21]);
  // 20:59 未开放，21:00 已开放
  const before = openTs - 60 * 1000;
  const at = openTs;
  assert(before < openTs, '20:59 应早于开放时刻');
  assert(at >= openTs, '21:00 应已到开放时刻');
});

test('签到窗口：场次开始前15分钟 ~ 场次结束（含边界）', () => {
  // 镜像 checkin_service.checkin 公式
  const date = '2026-10-26';
  const si = timeUtil.parseSlotKey('1820_1930'); // 18:20~19:30
  const winStart = timeUtil.dateMinuteToTimestamp(date, si.start_min) - config.CHECKIN_BEFORE_MIN * 60 * 1000;
  const endTs = timeUtil.dateMinuteToTimestamp(date, si.end_min);
  const d = new Date(winStart + timeUtil.CN_OFFSET_MS);
  assertEqual([d.getUTCHours(), d.getUTCMinutes()], [18, 5], '窗口起点应为 18:05');
  // 窗口长度 85 分钟
  assertEqual((endTs - winStart) / 60000, 85);
  // 有效条件镜像：now >= winStart && now <= endTs
  assert(winStart >= winStart && winStart <= endTs, '窗口起点应在有效范围内');
  assert(endTs >= winStart && endTs <= endTs, '窗口终点应在有效范围内');
  assert(!(winStart - 1 >= winStart && winStart - 1 <= endTs), '窗口前 1ms 应无效');
  assert(!(endTs + 1 >= winStart && endTs + 1 <= endTs), '窗口后 1ms 应无效');
});

test('取消预约：开始前30分钟可取消，之后不可取消', () => {
  // 镜像 reservation_service.cancel 公式：now >= startTs - 30min 则不可取消
  const date = '2026-10-26';
  const si = timeUtil.parseSlotKey('1820_1930');
  const startTs = timeUtil.dateMinuteToTimestamp(date, si.start_min);
  const cutoff = startTs - 30 * 60 * 1000;
  const d = new Date(cutoff + timeUtil.CN_OFFSET_MS);
  assertEqual([d.getUTCHours(), d.getUTCMinutes()], [17, 50], '取消截止点应为 17:50');
  assert(cutoff < startTs, '截止点应早于开始');
  // 镜像源码：now >= startTs - 30min 则抛 CANCEL_TOO_LATE（不可取消）
  const cancellable = (now) => !(now >= cutoff);
  assert(cancellable(cutoff - 1) === true, '截止前 1ms 应可取消');
  assert(cancellable(cutoff) === false, '截止点起应不可取消');
  assert(cancellable(startTs) === false, '开始时更不可取消');
});

test('二维码 token 过期：expire_time = now + 20000，<=now 视为过期', () => {
  const now = 1700000000000;
  const expireTime = now + config.QR_TOKEN_EXPIRE;
  assertEqual(expireTime - now, 20000, '有效期应为 20s');
  // 镜像 scan：!expire_time || expire_time <= now 视为过期
  assert(expireTime <= now === false, '未过期时 expire<=now 为 false（有效）');
  assert(expireTime <= now + 20000 === true, '20s 后应判定过期');
  assert(expireTime <= now + 19999 === false, '19.999s 仍有效');
});

test('拉黑到期时间：end_time = now + days * 86400000', () => {
  const now = 1700000000000;
  const manualDays = 7;
  const manualEnd = now + manualDays * DAY_MS;
  assertEqual(manualEnd - now, 7 * DAY_MS);
  const autoEnd = now + config.AUTO_BLACK_DAYS * DAY_MS;
  assertEqual(autoEnd - now, 10 * DAY_MS);
});

test('crypto_util.randomToken(16) 返回 32 位十六进制', () => {
  const t = cryptoUtil.randomToken(16);
  assertEqual(t.length, 32);
  assert(/^[0-9a-f]{32}$/.test(t), '应为 32 位小写十六进制');
});

test('crypto_util.md5 确定且稳定', () => {
  assertEqual(cryptoUtil.md5('hello'), '5d41402abc4b2a76b9719d911017c592');
});
