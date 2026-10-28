/**
 * job 控制器：定时任务入口
 */
const BaseController = require('./base_controller.js');
const JobService = require('../service/job_service.js');

class JobController extends BaseController {
  async expire() {
    return await new JobService().expire();
  }

  async notify() {
    return await new JobService().notify();
  }
}

module.exports = JobController;
