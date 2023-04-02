const axios = require('axios').default;
const { schedule } = require("@netlify/functions");

require('dotenv').config()

process.env.SILENCE_EMPTY_LAMBDA_WARNING = true


const handler = async function () {
  console.log('calling func!');
  axios(process.env.API_REQUEST_URL)
    .then((response) => {
      return response;
    })
    .catch((err) => console.log(err));
  return {
    statusCode: 200,
  };
};

exports.handler = schedule(process.env.TIMEOUT, handler);

