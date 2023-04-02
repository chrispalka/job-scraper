const axios = require('axios').default;
const { schedule } = require("@netlify/functions");

require('dotenv').config()

process.env.SILENCE_EMPTY_LAMBDA_WARNING = true


const handler = async function () {
  console.log('calling func!');
  axios('./api/job')
    .then((response) => {
      console.log('Success')
    })
    .catch((err) => console.log(err));
  return {
    statusCode: 200,
  };
};

exports.handler = schedule("* * * * *", handler);

