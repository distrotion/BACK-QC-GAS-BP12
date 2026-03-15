const axios = require('axios')

exports.post = async (url, body) => {
  try {
    const res = await axios.post(url, body);
    return res.data;
  } catch (error) {
    const status = error.response ? error.response.status : 'network_error';
    console.error(status);
    return status;
  }
};

exports.get = async (url) => {
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    const status = error.response ? error.response.status : 'network_error';
    console.error(status);
    return status;
  }
};
