//引入express框架
const bodyParser = require('body-parser');
const express = require('express');
const log4js = require('../reptile/Puppeteer/log/log4js.config');
const logger = log4js.getLogger("♦接口模块");
const Mailer = require('../reptile/QQEMail/mailer');
const axios = require('axios');
const api123 = require('../updown_apk/123Pan/localUpload');//使用下载到本地再分片上传得到123盘分享链接模块--两个任选
// const api123 = require('../updown_apk/123Pan/offlineDownload');//使用离线下载的方式得到123盘分享链接模块--两个任选
/*
*  1.引入express框架
*  2.引入封装方法模块
*  3.比较简单的示例，各位大佬仅供参考
*  4.如有疑问可以一起联系：2622011721@qq.com，QQ微信同号
*
*/
//导入config模块  配置信息 读取环境变量
const config = require('config')
const API = config.get('app.host') + ':' + config.get('app.port');
//数据库操作
const { pool } = require('../model/apkpan_sql'); // 导入数据库操作模块
//创建路由对象
const api = express.Router();
// 解析参数

api.use((req, res, next) => {
  // 允许哪些客户端访问我
  res.header('Access-Control-Allow-Origin', '*') //允许所有客户端访问我
  res.header('Access-Control-Allow-Methods', 'get,post') // 允许客户端使用哪些请求方法访问我
  next()
})
//爬取内容发布文章
// 使用 body-parser 中间件来解析 POST 请求的 JSON 数据
api.use(bodyParser.json());

// 爬取游戏
api.get('/g_upload', async (req, res) => {
  try {
    const { packageName } = req.params;
    const { FileName } = req.params;
    console.log({ packageName, FileName })
    const results = {
      names: 'video.downloader.videodownloader_2.2.7.apk',
      packageName: 'video.downloader.videodownloader',
      lastDownloadLink: 'https://d-12.winudf.com/b/APK/dmlkZW8uZG93bmxvYWRlci52aWRlb2Rvd25sb2FkZXJfMTI3Xzg3YzE2MTZj?_fn=VmlkZW8gRG93bmxvYWRlcl8yLjIuN19BUEtQdXJlLmFwaw&_p=dmlkZW8uZG93bmxvYWRlci52aWRlb2Rvd25sb2FkZXI%3D&download_id=otr_1235904613593756&is_hot=true&k=f815c200eafeb8bee019eb1cd47e185d6695c1b5',
      dirName: 'Inshot Video Downloader',
      version: '2.2.7',
      apkSize: 12845
    }
    

    let config = {
      method: 'post',
      url: API+'/api/123CloudDownload',
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(results)
    };
    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (error) {
    logger.error('失败:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//上传接口
api.post('/123CloudDownload', (req, res) => {
  const { names, packageName, lastDownloadLink, dirName, version, apkSize } = req.body;
  if (!names || !packageName || !lastDownloadLink || !dirName || !version || !apkSize) {
    return res.status(400).send('All fields are required');
  }
  api123.setParams(names, packageName, lastDownloadLink, dirName, version, apkSize);

  res.send({
    code: 200,
    msg: '正在上传..',
    log: {log: '正在上传..'}
  })
})

// POST 请求的回调接口--通知--离线下载时123盘需要请求我们的接口
api.post('/callBackUrl', async (req, res) => {
  const { url, status, failReason, fileID } = req.body;

  console.log('收到回调内容：');
  console.log(req.body);
  logger.info('当前状态是：', status);
  console.log(`Status: ${status === 0 ? '成功' : '失败'}`);
  if (status === 1) {
    console.log(`失败原因: ${failReason}`);
    logger.info('当前失败原因是：', failReason);
  } else {
    console.log(`文件ID: ${fileID}`);
    logger.info('当前文件ID是：', fileID);
    // 通知邮件----自己撸了个邮件信息
    const mailer = new Mailer();

    function createHtmlTable(data) {
      let html = `<table style="width:100%; border: 1px solid #ddd; border-collapse: collapse;">
                  <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Link</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Description</th>
                  </tr>`;

      html += `<tr>
               <td style="border: 1px solid #ddd; padding: 8px;">${status === 0 ? '成功' : '失败'}</td>
               <td style="border: 1px solid #ddd; padding: 8px;">${status === 0 ? `文件ID: ${fileID}` : `失败原因: ${failReason}`}</td>
             </tr>`;
      html += `<tr>
               <td style="border: 1px solid #ddd; padding: 8px;" colspan="2">URL: ${url}</td>
             </tr>`;

      html += `</table>`;
      return html;
    }

    const htmlContent = createHtmlTable({ url, status, failReason, fileID });

    try {
      await mailer.sendMail('3788767702@qq.com', '游戏链接已更新~', htmlContent);
      console.log('Email sent successfully');
      logger.info('当前 URL 是：', url);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  // 返回给调用方一个成功的响应
  res.json({
    msg: "请求成功",
    code: "200",
    data: {
      url,
      status,
      failReason,
      fileID
    }
  });
});

// 将公共内容开放出去
module.exports = api;