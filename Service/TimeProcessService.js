class TimeProcess {
  constructor(logger) {
    this.logger = logger;
    this.common = require('../Config/common.json').scraping;
    this.Repository = require('../Repository/Repository.js');
    this.repository = new this.Repository(logger);
  }

  async getLastTime() {
    this.logger.info(`call: ${this.constructor.name} getLastTime`);
    return await this.repository.getLastTime();
  }

  isTimehasPassend(time) {
    this.logger.info(`call: ${this.constructor.name} isTimehasPassend time[${time}]`);

    const now = new Date();
    const lastTime = new Date(time);

    // 1分経過したら
    lastTime.setMinutes(lastTime.getMinutes() + this.common.progressMin);
    return now.getTime() > lastTime.getTime() ? true : false;
  }

  setLastExeTime() {
    this.logger.info(`call: ${this.constructor.name} setLastExeTime`);
    this.repository.setLastExeTime(this.convertToDate(new Date()));
  }

  setLastUpdTime(time) {
    this.logger.info(`call: ${this.constructor.name} setLastUpdTime time[${time}]`);
    this.repository.setLastUpdTime(time);
  }

  convertToDate(time) {
    this.logger.info(`call: ${this.constructor.name} convertToDate time[${time}]`);
    let datetime = "";
    const timecut1 = '-';
    const timecut2 = ':';
    const space = ' ';

    datetime += time.getFullYear() + timecut1;
    datetime += time.getMonth() + 1 + timecut1;
    datetime += time.getDate() + space;
    datetime += time.getHours() + timecut2;
    datetime += time.getMinutes() + timecut2;
    datetime += time.getSeconds() + timecut2;
    datetime += time.getMilliseconds();

    // console.log(datetime);
    return datetime;
  }

  now() {
    this.logger.info(`call: ${this.constructor.name} now`);
    return this.convertToDate(new Date());
  }
}

module.exports = TimeProcess;