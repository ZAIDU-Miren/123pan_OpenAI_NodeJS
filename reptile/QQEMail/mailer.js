const nodemailer = require('nodemailer');

class Mailer {
    constructor() {
        // 创建可重用邮件传输器，使用QQ的SMTP服务器
        this.transporter = nodemailer.createTransport({
            host: 'smtp.qq.com',
            port: 465,
            secure: true, // 使用 SSL
            auth: {
                user: '3788767702@qq.com', // 替换为你的 QQ 邮箱
                pass: 'ivnciyvkibhjccai'  // 这里使用的是“授权码”，而非邮箱的登录密码
            }
        });
    }

    async sendMail(to, subject, text, html) {
        const mailOptions = {
            from: '"提醒~" <3788767702@qq.com>', // 发送者昵称和邮箱地址
            to: to,   // 收件人邮箱
            subject: subject, // 邮件标题
            text: text,  // 纯文本内容
            html: html   // HTML内容
        };

        try {
            let info = await this.transporter.sendMail(mailOptions);
            console.log('Message sent: %s', info.messageId);
            return info;
        } catch (error) {
            console.error('Error sending email: ', error);
        }
    }
}

module.exports = Mailer;
