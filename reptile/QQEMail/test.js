const Mailer = require('./mailer');
const mailer = new Mailer();

mailer.sendMail('2622011721@qq.com', 'Hello from Node', 'This is a plain text body', '<h1>This is an HTML body</h1>')
  .then(response => console.log('Email sent successfully'))
  .catch(error => console.error('Failed to send email:', error));


// const mailer = new Mailer();
// function createHtmlTable(data) {
//   let html = `<table style="width:100%; border: 1px solid #ddd; border-collapse: collapse;">
//                           <tr>
//                             <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Link</th>
//                             <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Description</th>
//                           </tr>`;

//   data.forEach(item => {
//     html += `<tr>
//                            <td style="border: 1px solid #ddd; padding: 8px;"><a href="${item.href}">${item.href}</a></td>
//                            <td style="border: 1px solid #ddd; padding: 8px;">${item.text}</td>
//                          </tr>`;
//   });

//   html += `</table>`;
//   return html;
// }
// const htmlContent = createHtmlTable(data.texHtml);
// mailer.sendMail('2622011721@qq.com', 'PUBGM有更新！', '', htmlContent)
//   .then(response => console.log('Email sent successfully'))
//   .catch(error => console.error('Failed to send email:', error));