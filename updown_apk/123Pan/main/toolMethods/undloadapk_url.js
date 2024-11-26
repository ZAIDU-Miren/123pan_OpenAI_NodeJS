const axios = require('axios');
// 请求下载任务
async function makeRequest(url, game_name) {
  // 先删除库内已存在的游戏
  
  try {
    const response = await axios.post(
      'http://154.12.55.19:9999/api/v1/tasks',
      {
        'req': {
          'url': url
        },
        'opt': {
          'name': game_name,
          'path': '/root/Docker-zaidu/webdav_123/game/New_game',
          'selectFiles': [],
          'extra': {
            'connections': 16,
            'autoTorrent': true
          }
        }
      },
      {
        headers: {
          'Accept': '*/*',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
          'Cookie': 'Hm_lvt_c49822819aff316c44f8a097f64a68e3=1692453441; _SSID=-W7omHv17tdoR5BPH6WH3SF-1PqdeTi0UUA-BBtNagA; did=ItYbCzVsJckHDY-Q6w6HHIbO7wP2yfJUESrTDLSU8DwkBV24GIZW-wKbPrCKkgSYO2ordLKx8gZ0nNY56k0FRw; _CrPoSt=cHJvdG9jb2w9aHR0cDo7IHBvcnQ9NTAwMDsgcGF0aG5hbWU9Lzs%3D; Hm_lvt_c790ac2bdc2f385757ecd0183206108d=1704017468; _ga=GA1.2.2036840902.1704017518; PHPSESSID=a556066abf3f84b18d4fbd50e8aa45ec; auth=%5B%22zaidu%22%2C%22c969ec0ccc8bfff88c587cfc6a25b64dea4dc1c388ff51beec57bd01e407a83e%22%5D; filemanager=gn1qdhk3hqh8i15epnm36me89b',
          'Origin': 'http://154.12.55.19:9999',
          'Proxy-Connection': 'keep-alive',
          'Referer': 'http://154.12.55.19:9999/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
          'content-type': 'application/json'
        }
      }
    );
    console.log(response.data); // 输出响应数据
    return response.data; // 返回响应数据
  } catch (error) {
    console.error('请求出错:', error);
    throw error;
  }
}
// makeRequest("https://116-142-255-138.pd1.cjjd19.com:30443/download-cdn.cjjd19.com/123-207/cac18431/1818836746-0/cac18431c09ae9bee1cb14134ecd48cf/c-m17?v=5&t=1721040255&s=1721040255d77883ca45600dafcc24776a362b3998&r=8UX47P&bzc=1&bzs=1815832888&filename=com.sw.app103.apk&x-mf-biz-cid=f601c314-73e7-4a87-a267-83db477ae00e-584000&auto_redirect=0&ndcp=1&cache_type=1&xmfcid=8af2625c-ecd4-491b-9b7f-4c95983356a0-1-9eed82220", "game_name.apk")
module.exports = makeRequest;
