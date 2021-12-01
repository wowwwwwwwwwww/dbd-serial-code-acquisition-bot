class Repository {
  constructor(logger) {
    this.logger = logger;
    this.sqlite3 = require('sqlite3');
    this.db = new this.sqlite3.Database('./dbd.sqlite'); // パスの場所はindexと同じらしい
  }
    
  getLastTime() {
    this.logger.info(`call: ${this.constructor.name} getLastTime`);
    return new Promise(resolve => {
      this.db.each('SELECT * FROM timeinfo', (err, row) => resolve(row));
    });
  }

  setLastExeTime(time) {
    this.logger.info(`call: ${this.constructor.name} setLastExeTime time[${time}]`);
    this.db.run('UPDATE timeinfo SET lastexetime = ?', time);
  }

  setLastUpdTime(time) {
    this.logger.info(`call: ${this.constructor.name} setLastUpdTime time[${time}]`);
    this.db.run('UPDATE timeinfo SET lastupdtime = ?', time);
  }
  
  setCodeMsg(msg) {
    this.logger.info(`call: ${this.constructor.name} setCodeMsg msg[${msg}]`);
    this.db.run('UPDATE codemsg SET msg = ?', msg);
  }

  getCodeMsg() {    
    this.logger.info(`call: ${this.constructor.name} getCodeMsg`);    
    return new Promise(resolve => {
      this.db.each('SELECT msg FROM codemsg', (err, row) => resolve(row));
    });
  }
}

module.exports = Repository;