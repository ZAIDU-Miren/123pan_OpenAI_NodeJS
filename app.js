//引入express框架
const express = require('express');
//路径拼接处理模块
const path = require('path')
//导入art-tempate模板引擎
const template = require('art-template')
//导入morgan 第三方模块提示日志信息
const morgan = require('morgan')
//导入config模块  配置信息 读取环境变量
const config = require('config')
const host = config.get('app.host');
const port = config.get('app.port');
//配置中间件
// var bodyParser = require('body-parser');
//跨域模块
const cors = require('cors');
//创建web服务器
const app = express();
app.use(cors());
//开放静态资源访问目录
app.use(express.static(path.join(__dirname, 'public')));
//模板设置后缀
app.set('view engine', 'html')
// //导入处理时间模块
//当渲染模板后缀为HTML的时候，使用的模板引擎是什么
app.engine('html', require('express-art-template'))
// //开放外部变量  向模板引擎里面导入时间变量方法
// template.defaults.imports.moment = moment;
//数据库连接
// require('./model/connect')
console.log(config.get('title'))

// console.log()
//获取系统环境变量
// console.log(process.env)
// console.log(process.env.NODE_ENV)
// if(process.env.NODE_ENV=='production') 生产环境
if (process.env.NODE_ENV == 'development') {
	//当前是开发环境
	console.log('当前环境：',process.env.NODE_ENV)
	//在开发环境中将客户端发送到服务器端的请求信息打印到控制台中
	app.use(morgan('dev'))
} else {
	console.log('当前是生产环境')
}
// 配置跨域请求中间件(服务端允许跨域请求)
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", '*'); // 设置允许来自哪里的跨域请求访问（值为*代表允许任何跨域请求，但是没有安全保证）
	res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS"); // 设置允许接收的请求类型
	res.header("Access-Control-Allow-Headers", "Content-Type", "request-origin", "MyTken"); // 设置请求头中允许携带的参数
	res.header("Access-Control-Allow-Credentials","true"); // 允许客户端携带证书式访问。保持跨域请求中的Cookie。注意：此处设true时，Access-Control-Allow-Origin的值不能'*'
	res.header("Access-control-max-age", 1000); // 设置请求通过预检后多少时间内不再检验，减少预请求发送次数
	next();
})
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//导入路由模块 api admin
const api = require('./route/api');

app.use('/', api);
app.use('/api', api);
//监听端口
app.listen(config.get('app').port);
//控制台提示输出
console.log({
  url: config.get('app').host+':'+config.get('app').port,
	port: config.get('app').port,
  msg:'服务器启动成功'
})