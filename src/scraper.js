import axios from 'axios';
import { load } from 'cheerio';
import { createTransport } from 'nodemailer';

require('dotenv').config()

process.env.SILENCE_EMPTY_LAMBDA_WARNING = true


const config = {
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
};


export async function handler() {
  console.log('calling func!');
  let newJobFound = false;
  return axios(`https://www.governmentjobs.com/careers/home/index?agency=utah&keyword=${process.env.KEYWORD}`, config)
    .then((response) => {
      console.log('received response: ', response)
      const $ = load(response.data, { xmlMode: false });
      const node = $("a[class='item-details-link']")
      console.log('beginning loop of response')
      for (let i = 0; i < node.length; i++) {
        if (node[i].children[0].data.toLowerCase().includes(process.env.KEYWORD)) {
          newJobFound = true;
        }
        if (newJobFound) {
          break;
        }
      }
      console.log('New Job Found: ', newJobFound)
      if (newJobFound) {
        console.log('New Job Found!')
        const transporter = createTransport({
          service: 'gmail',
          name: 'www.gmail.com',
          auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
        const mailOptions = {
          from: process.env.EMAIL_ADDRESS,
          to: process.env.EMAIL_ADDRESS_TO,
          subject: 'New Autopsy Job posting!',
          text: 'https://www.governmentjobs.com/careers/home/index?agency=utah'
        };
        transporter.sendMail(mailOptions, (err, response) => {
          console.log('Sending mail..')
          if (err) {
            console.log(err);
          } else {
            console.log('Mail Sent! ', response)
          }
        });
      }
      console.log('done')
      return {
        statusCode: 200
      }
    })
    .catch((err) => {
      console.log('error!: ', err)
      return {
        statusCode: 404
      }
    })
}

