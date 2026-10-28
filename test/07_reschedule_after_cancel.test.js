/**
 * 取消后重新预约（职责分离）模型约束测试
 *
 * 背景：微信云数据库事务仅支持 doc/add，因此「占用表 reservations」与
 * 「流水表 reservation_records」职责分离：
 *   - reservations._id = ${date}_${slot_key}_${venue_key}（确定性主键，取消即物理删除）
 *   - reservation_records._id 自动生成（一条预约一条流水，res_id 字段关联）
 * 本测试用内存 Map/数组模拟两张集合，验证「A 预约→取消→B 重约同一场地」时：
 *   占用表可删除后重新 add；流水表自动 _id 可重复 add 不冲突；流水保留两条历史。
 */
const { test, assert, assertEqual } = require('./_lib.js');

const RES_ID = '2026-10-27_1820_1930_badminton#3';

/** 内存模拟：占用表（_id 主键） + 流水表（自动 _id + res_id 字段） */
function makeStore() {
  const reservations = new Map(); // _id -> doc
  const records = []; // {_id, res_id, status}
  let auto = 0;
  return {
    addReservation(doc) {
      if (reservations.has(doc._id)) throw new Error('reservations duplicate _id: ' + doc._id);
      reservations.set(doc._id, doc);
    },
    removeReservation(id) {
      reservations.delete(id);
    },
    getReservation(id) {
      return reservations.get(id) || null;
    },
    addRecord(doc) {
      auto += 1;
      records.push(Object.assign({ _id: 'auto' + auto }, doc));
    },
    // 事务外 where({res_id, status}).update(data)
    updateRecords(resId, fromStatus, data) {
      let n = 0;
      for (const r of records) {
        if (r.res_id === resId && r.status === fromStatus) {
          Object.assign(r, data);
          n += 1;
        }
      }
      return n;
    },
    getRecords() {
      return records.slice();
    },
    getReservationCount() {
      return reservations.size;
    },
  };
}

test('A 预约→取消→B 重约同一 date_slot_venue：占用释放、流水不冲突', () => {
  const s = makeStore();

  // 1) A 预约（create 事务内：占用表 add(_id=resId) + 流水表 add(自动 _id)）
  s.addReservation({ _id: RES_ID, student_openid: 'A', status: 'pending' });
  s.addRecord({ res_id: RES_ID, student_openid: 'A', status: 'pending' });
  assertEqual(s.getReservationCount(), 1);
  assertEqual(s.getRecords().length, 1);

  // 2) A 取消（cancel：事务内占用表 doc.remove；事务外流水 where({res_id,status:pending}).update）
  s.removeReservation(RES_ID);
  const cancelledN = s.updateRecords(RES_ID, 'pending', { status: 'cancelled' });
  assertEqual(s.getReservationCount(), 0, '取消后占用表应物理删除（立即释放）');
  assertEqual(cancelledN, 1);
  assertEqual(s.getRecords()[0].status, 'cancelled');

  // 3) B 重约同一场地场次（create）：占用表 add 成功、流水表 add 用新自动 _id 不冲突
  s.addReservation({ _id: RES_ID, student_openid: 'B', status: 'pending' });
  s.addRecord({ res_id: RES_ID, student_openid: 'B', status: 'pending' });
  assertEqual(s.getReservationCount(), 1, 'B 应成功占用该场地');
  const records = s.getRecords();
  assertEqual(records.length, 2, '流水表应保留两条历史（A cancelled + B pending）');
  assertEqual(records[0].status, 'cancelled');
  assertEqual(records[0].student_openid, 'A');
  assertEqual(records[1].status, 'pending');
  assertEqual(records[1].student_openid, 'B');
  assert(records[0]._id !== records[1]._id, '流水表两条记录 _id 应不同（自动生成）');
  assertEqual(records[0].res_id, records[1].res_id, '两条流水 res_id 相同（同一场地场次）');
});

test('B 签到后仅更新自己的 pending 流水，不影响 A 的 cancelled 流水', () => {
  const s = makeStore();
  s.addReservation({ _id: RES_ID, student_openid: 'A', status: 'pending' });
  s.addRecord({ res_id: RES_ID, student_openid: 'A', status: 'pending' });
  s.removeReservation(RES_ID);
  s.updateRecords(RES_ID, 'pending', { status: 'cancelled' });
  s.addReservation({ _id: RES_ID, student_openid: 'B', status: 'pending' });
  s.addRecord({ res_id: RES_ID, student_openid: 'B', status: 'pending' });

  // checkin：事务外 where({res_id, status:'pending'}).update -> checked_in
  const n = s.updateRecords(RES_ID, 'pending', { status: 'checked_in' });
  assertEqual(n, 1, '应只更新 B 的 pending 流水');
  const records = s.getRecords();
  assertEqual(records[0].status, 'cancelled', 'A 的历史流水应保持 cancelled');
  assertEqual(records[1].status, 'checked_in', 'B 的流水应更新为 checked_in');
});
