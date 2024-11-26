const axios = require('axios');

class APIClient {
  /**
   * 创建API客户端实例-
   * @param {string} clientID - 客户端ID
   * @param {string} clientSecret - 客户端密钥
   */
  constructor() {
    this.clientID = '自己申请';//申请123盘开发者得到
    this.clientSecret = '自己申请';//申请123盘开发者得到
    this.baseURL = 'https://open-api.123pan.com';//请求域名，根据文档得出
    this.platform = 'open_platform';//固定
    this.accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTk3MTU1ODksImlhdCI6MTcxOTExMDc4OSwiaWQiOjE4MTU4MzI4ODgsIm1haWwiOiIyNjIyMDExNzIxQHFxLmNvbSIsIm5pY2tuYW1lIjoi562J6aOO5Lmf562J5L2gLeWGjeW6piIsInVzZXJuYW1lIjoxOTEyODg4ODgyNSwidiI6MH0.UKdUN9tVqjciXgB28CA50aaeRBrwvH9RxiN1EOJ9EUQ';//随机初始化给个，方便测试
  }

  /**
   * 获取访问令牌
   * @returns {Promise<Object>} 包含访问令牌的数据
   */
  async getAccessToken() {
    console.log('获取 token方法进行中...');
    const url = `${this.baseURL}/api/v1/access_token`;
    const headers = {
      'Content-Type': 'application/json',
      'Platform': this.platform
    };
    const body = {
      clientID: this.clientID,
      clientSecret: this.clientSecret
    };

    try {
      const response = await axios.post(url, body, { headers });
      this.accessToken = response.data.data.accessToken;
      // console.log('获取token成功', this.accessToken);
      return response.data;
    } catch (error) {
      console.error('Error fetching access token:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  /**
   * 发送带认证的请求
   * @param {string} url - 请求URL
   * @param {string} method - 请求方法
   * @param {Object} body - 请求体
   * @returns {Promise<Object>} 响应数据
   */
  async requestWithAuth(url, method, body) {
    if (!this.accessToken) {
      console.log('taong token不存在，重新获取');
      await this.getAccessToken();
      // console.log('token重新获取成功', this.accessToken);

    }
    console.log('token存在，继续执行');
    const headers = {
      'Content-Type': 'application/json',
      'Platform': this.platform,
      'Authorization': `${this.accessToken}`
    };
    // console.log('token存在，继续执行', headers);
    // console.log({ method, url, headers, data: body })
    try {
      const response = await axios({ method, url, headers, data: body });
      // console.log('请求', response);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) { // 令牌失效
        await this.getAccessToken();
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        const retryResponse = await axios({ method, url, headers, data: body });
        return retryResponse.data;
      } else {
        console.error(`Error ${method} ${url}:`, error.response ? error.response.data : error.message);
        throw error;
      }
    }
  }

  /**
   * 创建分享链接
   * @param {string} shareName - 分享名称
   * @param {string} shareExpire - 分享过期时间
   * @param {Array<number>} fileIDList - 文件ID列表
   * @param {string} [sharePwd=''] - 分享密码
   * @returns {Promise<Object>} 分享链接的数据
   */
  async createShareLink(shareName, shareExpire, fileIDList, sharePwd = '') {
    const url = `${this.baseURL}/api/v1/share/create`;
    const body = { shareName, shareExpire, fileIDList, sharePwd };
    return await this.requestWithAuth(url, 'post', body);
  }

  /**
   * 创建目录
   * @param {string} name - 目录名称
   * @param {number} parentID - 父目录ID
   * @returns {Promise<Object>} 创建的目录数据
   */
  async createDirectory(name, parentID) {
    console.log('创建目录方法进行中...');
    console.log({ name, parentID });
    const url = `${this.baseURL}/upload/v1/file/mkdir`;
    const body = { name, parentID };
    return await this.requestWithAuth(url, 'post', body);
  }

  /**
   * 创建离线下载任务
   * @param {string} url - 下载资源地址
   * @param {string} [fileName=''] - 自定义文件名称
   * @param {number} [dirID=null] - 指定目录ID
   * @param {string} [callBackUrl=''] - 回调地址
   * @returns {Promise<Object>} 离线下载任务的数据
   */
  async createOfflineDownloadTask(url, fileName = '', dirID = null, callBackUrl = '/api/callBackUrl') {
    const apiUrl = `${this.baseURL}/api/v1/offline/download`;
    const body = { url, fileName, dirID, callBackUrl };
    console.log('创建离线下载任务方法进行中...');
    // console.log({ url, fileName, dirID, callBackUrl });
    return await this.requestWithAuth(apiUrl, 'post', body);
  }

  /**
   * 获取离线下载进度
   * @param {number} taskID - 离线下载任务ID
   * @returns {Promise<Object>} 离线下载进度的数据
   */
  async getOfflineDownloadProgress(taskID) {
    if (!this.accessToken) {
      await this.getAccessToken();
    }

    const url = `${this.baseURL}/api/v1/offline/download/process?taskID=${taskID}`;
    const headers = {
      'Content-Type': 'application/json',
      'Platform': this.platform,
      'Authorization': `Bearer ${this.accessToken}`
    };

    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) { // 令牌失效
        await this.getAccessToken();
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        const retryResponse = await axios.get(url, { headers });
        return retryResponse.data;
      } else {
        console.error('Error fetching download progress:', error.response ? error.response.data : error.message);
        throw error;
      }
    }
  }

  /**
   * 获取文件详情
   * @param {number} fileID - 文件ID
   * @returns {Promise<Object>} 文件详情的数据
   */
  async getFileDetail(fileID) {
    if (!this.accessToken) {
      await this.getAccessToken();
    }

    const url = `${this.baseURL}/file/detail?fileID=${fileID}`;
    const headers = {
      'Content-Type': 'application/json',
      'Platform': this.platform,
      'Authorization': `Bearer ${this.accessToken}`
    };

    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) { // 令牌失效
        await this.getAccessToken();
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        const retryResponse = await axios.get(url, { headers });
        return retryResponse.data;
      } else {
        console.error('Error fetching file detail:', error.response ? error.response.data : error.message);
        throw error;
      }
    }
  }

  /**
   * 文件重命名
   * @param {Array<Object>} renameList - 重命名列表，格式为 { fileID: number|newName: string, }
   * @returns {Promise<Object>} 重命名结果的数据
   */
  async renameFiles(renameList) {
    const url = `${this.baseURL}/file/rename`;
    const body = { renameList: renameList.map(item => `${item.fileID}|${item.newName}`) };
    return await this.requestWithAuth(url, 'post', body);
  }
  /**
     * 获取文件详情--搜索
     * 名称	类型	是否必填	说明
     * parentFileId	number	必填	文件夹ID，根目录传 0
     * limit	number	必填	每页文件数量，最大不超过100
     * searchData	string	选填	搜索关键字将无视文件夹ID参数。将会进行全局查找
     * searchMode	number	选填	0:全文模糊搜索(注:将会根据搜索项分词,查找出相似的匹配项)
     * 1:精准搜索(注:精准搜索需要提供完整的文件名)
     * lastFileId	number	选填	翻页查询时需要填写
     */
  async getFilesSearch(parentFileId, limit, searchData, searchMode) {
    const url = `${this.baseURL}/api/v2/file/list`;
    const body = { parentFileId, limit, searchData, searchMode };
    return await this.requestWithAuth(url, 'GET', body);
  }

  //创建文件
  /**
   * 
   Body 参数
名称	类型	是否必填	说明
parentFileID	number	必填	父目录id，上传到根目录时填写 0
filename	string	必填	文件名要小于128个字符且不能包含以下任何字符："\/:*?|><。（注：不能重名）
etag	string	必填	文件md5
size	number	必填	文件大小，单位为 byte 字节
   */
  async createFolder(parentFileId, filename, etag, size) {
    const url = `${this.baseURL}/upload/v1/file/create`;
    const body = {
      "parentFileID": parentFileId,
      "filename": filename,
      "etag": etag,
      "size": size
    };
    return await this.requestWithAuth(url, 'post', body);
  }
  /**
   * 
 */
  // 获取上传地址
  async getUploadUrl(preuploadID, sliceNo) {
    const url = `${this.baseURL}/upload/v1/file/get_upload_url`;
    const body = {
      "preuploadID": preuploadID,
      "sliceNo": sliceNo,
    };
    return await this.requestWithAuth(url, 'post', body);
  }
  //列举已上传分片
  async getUploadedChunks(preuploadID) {
    const url = `${this.baseURL}/upload/v1/file/list_upload_parts`;
    const body = {
      "preuploadID": preuploadID,
    };
    return await this.requestWithAuth(url, 'post', body);
  }
 //上传完成
  async completeUpload(preuploadID) {
    const url = `${this.baseURL}/upload/v1/file/upload_complete`;
    const body = {
      "preuploadID": preuploadID,
    };
    return await this.requestWithAuth(url, 'post', body);
 }
 
}

// 暴露方法
module.exports = APIClient;
