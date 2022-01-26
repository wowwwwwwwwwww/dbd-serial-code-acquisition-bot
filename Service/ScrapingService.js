class Scraping {
  constructor(logger) {    
    this.logger = logger;
    this.common = require('../Config/common.json').scraping;
  }

  async getCode(lastTime) {
    this.logger.info(`call: ${this.constructor.name} getCode lastTime[${lastTime}]`);

    const url = this.common.targetUrl;
    const puppeteer = require('puppeteer');
    const {options} = require('../Config/puppeteer.json');
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on('request', request => {
      if (url === request.url()) {
        request.continue();
      } else {
        request.abort();
      }
    });
    const data = await this.getCodeFromWeb(page, url, lastTime);
    browser.close();
    return data;
  }

  async getCodeFromWeb(page, url, lastTime){
    this.logger.info(`call: ${this.constructor.name} getCodeFromWeb url[${url}] lastTime[${lastTime}]`);
    await page.goto(url);

    // 対象サイトにjs実行
    return await page.evaluate((common, lastTime) => {
      let data = {
        codeData : [] ,
        lastUpdTime :  ""
      };
      let dataList = [];
      const updTime = document.querySelector('time').innerText;
      if (updTime === lastTime && common.debugFlg === 0) {
        return data;
      }      
      
      const storeCodeList = document.querySelector(common.targetTag).nextElementSibling.nextElementSibling.querySelectorAll('tr');
      storeCodeList.forEach((elm, idx) => {
        let row = [];
        if (idx === 0) {
          elm.querySelectorAll('th').forEach(head => {
            row.push(head.innerText);
          });
          dataList.push(row);
          row = [];
        } else {
          elm.querySelectorAll('td').forEach((body, itmIdx) => {
            if (itmIdx === 2) {
              let codeTag = body.querySelector('input');
              if (codeTag === null) {
                const linkTag = body.querySelector('a');
                codeTag = (linkTag ? linkTag.innerText :  body.innerText);
              } else {
                codeTag = codeTag.value;
              }
              row.push(codeTag);
              dataList.push(row);
              row = [];
            } else {
              row.push(body.innerText.replace(/\r?\n/g,""));
            }
          });
        }
      });
      if (dataList.length === 0) {
        throw new Error('Could not get the data');
      }

      data.codeData = dataList;
      data.lastUpdTime = updTime;
      return data;
    }, this.common, lastTime);
  }
}

module.exports = Scraping;