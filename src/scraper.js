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

function createMailClient() {
  return createTransport({
    service: 'gmail',
    name: 'www.gmail.com',
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  })
}

const mailClient = createMailClient();

exports.handler = async () => {
  console.log('Function Begin');
  let newJobFound = false;
  axios(`https://www.governmentjobs.com/careers/home/index?agency=utah&keyword=${process.env.KEYWORD}`, config)
    .then(async (response) => {
      const $ = load(response.data, { xmlMode: false });
      const node = $("a[class='item-details-link']")
      for (let i = 0; i < node.length; i++) {
        if (node[i].children[0].data.toLowerCase().includes(process.env.KEYWORD)) {
          newJobFound = true;
        }
        if (newJobFound) {
          break;
        }
      }
      if (newJobFound) {
        console.log('New Job Found!')
        console.log('FROM: ', process.env.EMAIL_ADDRESS)
        console.log('TO: ', process.env.EMAIL_ADDRESS_TO)
        console.log('BCC: ', process.env.EMAIL_ADDRESS_BCC)
        await mailClient.sendMail({
          from: process.env.EMAIL_ADDRESS,
          to: process.env.EMAIL_ADDRESS_TO,
          bcc: process.env.EMAIL_ADDRESS_BCC,
          subject: 'New Autopsy Job posting!',
          text: 'https://www.governmentjobs.com/careers/home/index?agency=utah'
        })
      }
      return {
        statusCode: 200,
      }
    })
    .catch((err) => {
      console.log('error!: ', err)
      return {
        statusCode: 500
      }
    })
}

