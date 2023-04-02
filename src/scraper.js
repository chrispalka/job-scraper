const axios = require('axios');
const { schedule } = require("@netlify/functions");

require('dotenv').config()

export const handler = schedule('* * * * *', async (event, context) => {
  console.log('callingg')
  // axios('./api/job')
  //   .then((response) => {
  //     console.log('Success')
  //   })
  //   .catch((err) => console.log(err));

  return {
    statusCode: 200,
    body: 'Hello from Netlify Functions!'
  }
})
