const express = require("express");
const axios = require('axios').default;
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
const serverless = require("serverless-http");

require('dotenv').config()
process.env.SILENCE_EMPTY_LAMBDA_WARNING = true


const app = express();
const router = express.Router();

const config = {
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
};

router.get("/", (req, res) => {
  res.json({
    hello: "hi!"
  });
});

router.get('/job', (req, res) => {
  let newJobFound = false;
  axios(`https://www.governmentjobs.com/careers/home/index?agency=utah&keyword=autopsy`, config)
    .then((response) => {
      const $ = cheerio.load(response.data, { xmlMode: false });
      const node = $("a[class='item-details-link']")
      for (let i = 0; i < node.length; i++) {
        if (node[i].children[0].data.toLowerCase().includes('medical')) {
          newJobFound = true;
        }
      }
      if (newJobFound) {
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
          if (err) {
            console.log(err);
            res.sendStatus(404)
          } else {
            res.sendStatus(200)
          }
        });
      }
      res.sendStatus(200)
    })
    .catch((err) => {
      console.log('error!: ', err)
      res.sendStatus(200)
    })
})

app.use(`/.netlify/functions/api`, router);

module.exports = app;
module.exports.handler = serverless(app);


// const axios = require('axios');
// const { schedule } = require("@netlify/functions");

// require('dotenv').config()

// const handler = async (event, context) => {
//   axios('./api/job')
//     .then((response) => {
//       console.log('Success')
//     })
//     .catch((err) => console.log(err));

//   return {
//     statusCode: 200,
//   }
// }

// exports.handler = schedule('* * * * *', handler)

