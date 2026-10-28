/**
 * 临时 QA 回归脚本（需求变更：当天 21:00 前约当天，21:00 后约次日）
 * 加载真实 time_util.js / venue_service.js / reservation_service.js，
 * 仅 mock 掉 DB 相关依赖，验证日期规则与边界。
 * 运行：node test/qa_tmp_date_rule.js
 */
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const timeUtil = require(path.join(ROOT, 'cloudfunctions/cloud/framework/utils/time_util.js'));
const appCode = require(path.join(ROOT, 'cloudfunctions/cloud/framework/core/app_code.js'));

// ---------- 极简异步测试器 ----------
const tests = [];
let passed = 0;
let failed = 0;
const failures = [];
function test(name, fn) {
  tests.push({ name, fn });
}
function assert(cond, msg) { if (!cond) throw new Error(msg || '断言失败'); }
function assertEqual(a, b, msg) {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A !== B) throw new Error((msg || '值不相等') + '：期望 ' + B + '，实际 ' + A);
}

// ---------- 固定 nowMinutes，避免依赖真实时钟 ----------
const realNowMinutes = timeUtil.nowMinutes;

// 1) slotList 日期规则（真实 venue_service.slotList + mock getOpenTime / TimeSlotModel.getAll）
const VenueService = require(path.join(ROOT, 'cloudfunctions/cloud/project/service/venue_service.js'));
const TimeSlotModel = require(path.join(ROOT, 'cloudfunctions/cloud/project/model/time_slot_model.js'));
VenueService.prototype.getOpenTime = async () => ({ hour: 21, minute: 0 });
TimeSlotModel.getAll = async () => [];

const slotCases = [
  { nowMin: 0, expectDate: timeUtil.today(), expectIsToday: true, expectType: 'today' },
  { nowMin: 1259, expectDate: timeUtil.today(), expectIsToday: true, expectType: 'today' },
  { nowMin: 1260, expectDate: timeUtil.tomorrow(), expectIsToday: false, expectType: 'tomorrow' }, // 边界 21:00
  { nowMin: 1261, expectDate: timeUtil.tomorrow(), expectIsToday: false, expectType: 'tomorrow' },
  { nowMin: 1439, expectDate: timeUtil.tomorrow(), expectIsToday: false, expectType: 'tomorrow' },
];
for (const c of slotCases) {
  test('slotList nowMin=' + c.nowMin + ' → date/is_today/date_type', async () => {
    timeUtil.nowMinutes = () => c.nowMin;
    const r = await new VenueService().slotList();
    assertEqual(r.date, c.expectDate, 'date');
    assertEqual(r.is_today, c.expectIsToday, 'is_today');
    assertEqual(r.date_type, c.expectType, 'date_type');
  });
}

// 2) create() 日期校验（真实 reservation_service.create + mock getOpenTime）
const ReservationService = require(path.join(ROOT, 'cloudfunctions/cloud/project/service/reservation_service.js'));
ReservationService.prototype.getOpenTime = async () => ({ hour: 21, minute: 0 });
const user = { info_completed: true, name: 'QA', student_no: 'N1' };
const openId = 'openid_qa';
const nowToday = timeUtil.today();
const nowTomorrow = timeUtil.tomorrow();

const createCases = [
  // [nowMin, date, expectReject(是否应被 NOT_OPEN_TIME 拒绝)]
  { nowMin: 0, date: nowToday, expectReject: false },      // 未到开放时刻 + 今天 → 放行
  { nowMin: 0, date: nowTomorrow, expectReject: true },    // 未到开放时刻 + 明天 → 拒绝
  { nowMin: 1259, date: nowToday, expectReject: false },   // 20:59 + 今天 → 放行
  { nowMin: 1259, date: nowTomorrow, expectReject: true }, // 20:59 + 明天 → 拒绝
  { nowMin: 1260, date: nowToday, expectReject: true },    // 边界 21:00 + 今天 → 拒绝
  { nowMin: 1260, date: nowTomorrow, expectReject: false },// 边界 21:00 + 明天 → 放行
  { nowMin: 1261, date: nowToday, expectReject: true },    // 21:01 + 今天 → 拒绝
  { nowMin: 1261, date: nowTomorrow, expectReject: false },// 21:01 + 明天 → 放行
];
for (const c of createCases) {
  test('create nowMin=' + c.nowMin + ' date=' + c.date + (c.expectReject ? ' → 拒绝(4102)' : ' → 放行(非4102)'), async () => {
    timeUtil.nowMinutes = () => c.nowMin;
    let gotNotOpen = false;
    let otherErr = null;
    try {
      await new ReservationService().create(openId, user, {
        date: c.date, slot_key: '1820_1930', venue_key: 'badminton#1',
      });
    } catch (e) {
      if (e && e.code === appCode.NOT_OPEN_TIME) gotNotOpen = true;
      else otherErr = e;
    }
    if (c.expectReject) {
      assert(gotNotOpen, '应被 NOT_OPEN_TIME 拒绝，实际未抛 4102（' + (otherErr && (otherErr.message || otherErr.code)) + '）');
    } else {
      assert(!gotNotOpen, '应放行（不应抛 4102），实际抛了 NOT_OPEN_TIME');
    }
  });
}

(async () => {
  console.log('== 日期规则回归（真实 service 源码）==');
  for (const t of tests) {
    try {
      await t.fn();
      passed++;
      console.log('  ✓ ' + t.name);
    } catch (e) {
      failed++;
      failures.push({ name: t.name, message: e && e.message ? e.message : String(e) });
      console.log('  ✗ ' + t.name + '\n      -> ' + (e && e.message ? e.message : e));
    }
  }
  timeUtil.nowMinutes = realNowMinutes; // 还原

  console.log('\n==============================');
  console.log('通过: ' + passed + ' | 失败: ' + failed);
  if (failed) {
    console.log('失败明细：');
    for (const f of failures) console.log('  - ' + f.name + '\n    ' + f.message);
    process.exitCode = 1;
  } else {
    console.log('全部通过 ✓');
  }
})();
