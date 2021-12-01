class DataProcess {
  constructor(logger) {
    this.logger = logger;
    this.common = require('../Config/common.json').dataProcess;
    this.Repository = require('../Repository/Repository.js');
    this.repository = new this.Repository(logger);
  }

  convertMsg(data) {
    this.logger.info(`call: ${this.constructor.name} convertMsg data[${data}]`);

    let msg = "";
    const separater = " ";
    const newLine = '\n';
    data.forEach((row, rowCnt) => {
      row.forEach((col, colCnt) => {
        if (rowCnt === 0) {
          msg += col + separater.repeat(40);
        } else {
          if (colCnt === 2) {
            msg += col;
          } else {
            msg += col + separater.repeat(((colCnt === 0 ? this.common.maxLimitLen : this.common.maxContentsLen) - this.getStrDataLen(col)) * 2);
          }
          msg += separater.repeat(6);
        }
      });
      msg += newLine;
    });
    this.setCodeMsg(msg);
    return msg;
  }

  getStrDataLen(str) {
    let len = 0;
    [].forEach.call(str, txt => {
      (txt.match(/[ -~]/)) ? len += 1 : len += 2;
    });
    return len;
  }

  setCodeMsg(msg) {
    this.logger.info(`call: ${this.constructor.name} setCodeMsg msg[${msg}]`);
    this.repository.setCodeMsg(msg);
  }

  async getCodeMsg() {
    this.logger.info(`call: ${this.constructor.name} getCodeMsg`);
    return await this.repository.getCodeMsg();
  }
}

module.exports = DataProcess;