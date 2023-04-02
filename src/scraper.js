const axios = require('axios').default;
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
const { schedule } = require("@netlify/functions");

require('dotenv').config()

process.env.SILENCE_EMPTY_LAMBDA_WARNING = true


const config = {
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
};


exports.handler = async function () {
  console.log('calling func!');
  let newJobFound = false;
  axios(`https://www.governmentjobs.com/careers/home/index?agency=utah&keyword=${process.env.KEYWORD}`, config)
    .then((response) => {
      const $ = cheerio.load(response.data, { xmlMode: false });
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
        const transporter = nodemailer.createTransport({
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
    })
    .catch((err) => {
      console.log('error!: ', err)
    })
  return {
    statusCode: 200,
  };
};

