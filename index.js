const {Client, Intents} = require('discord.js');
const client = new Client({intents: Object.keys(Intents.FLAGS)});
const {token, admin} = require('./Config/config.json');

const Log4js = require('log4js');
Log4js.configure('./Config/log-config.json');
const logger = Log4js.getLogger('system');
const common = require('./Config/common.json');
const name = 'Index';
const DataProcess = require('./Service/DataProcessService.js');
const dataprocess = new DataProcess(logger);

client.on('ready', async() => {
  logger.info(`login: user[${client.user.tag}]`);
  const cron = require('node-cron');

  // 3時間ごとに実行
  cron.schedule(common.scraping.interval, async() => {
    try{
      logger.info(`call: ${name} ready`);

      const TimeProcess = require('./Service/TimeProcessService.js');
      const timeprocess = new TimeProcess(logger);
      const lastTime = await timeprocess.getLastTime();
      // 最終実行日時から1分が経過している場合
      if (timeprocess.isTimehasPassend(lastTime.lastexetime) || common.scraping.debugFlg) {

        // 実行日時を記録
        timeprocess.setLastExeTime();
        
        const Scraping = require('./Service/ScrapingService.js');
        const scraping = new Scraping(logger);
        // データ取得
        const data = await scraping.getCode(lastTime.lastupdtime);        
        // サイトの更新日時を比較
        if (data.lastUpdTime) {
          // データ加工して送る
          timeprocess.setLastUpdTime(data.lastUpdTime);
          broadcastMsg(dataprocess.convertMsg(data.codeData));
        } else {
          logger.info(`msg: ${name} 前回の取得情報と同じです`);
        }
      } else {
        logger.info(`msg: ${name} 時間を空けて実行してください`);
      }
    } catch(e) {
      logger.error(e);
      await broadcastMsg('問題が発生したため強制終了します');
      logger.info(`logout: user[${client.user.tag}]`);
      process.exit(1);
    }
  });
// });

client.on('message', async msg => {    
  if (msg.author.id === admin) {
    if (msg.content.substr(0, 6) === '!noti ') {
      broadcastMsg(msg.content.substr(6));

    }else if (msg.content === '!scnt') {
      msg.channel.send(`現在BOTが参加しているサーバ件数は[${client.guilds.cache.size}]です`);

    }else if (msg.content === '!gcid') {
      msg.channel.send(msg.channel.id);
    }
  }
  // オウム返し
  // if (msg.author !== client.user) {
  //   msg.channel.send(msg.content);
  }
});

// 招待されたとき
client.on('guildCreate', async guild => {  
  try {
    const msgData = await dataprocess.getCodeMsg();
    if (msgData.msg) {
      client.channels.cache.get(guild.systemChannelId).send(msgData.msg);
    }
  } catch(e) {
    logger.error(`call: guildCreate[${guild}]`);
  }
});

client.login(token);

function broadcastMsg(msg) {
  const textChannels = client.channels.cache.filter(channel => {
    return channel.type == common.discord.sendChannelType && channel.name == common.discord.sendChannelName;
  });
  Array.from(textChannels.keys()).forEach(channelId => {
    if (common.discord.debugFlg) {
      console.log(msg);
    } else {      
      client.channels.cache.get(channelId).send(msg);
    }
  });
}