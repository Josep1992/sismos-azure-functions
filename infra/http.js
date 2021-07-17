module.exports = {
  isPOST: function ({ method }) {
    return method === "POST";
  },
  isGET: function ({ method }) {
    return method === "GET";
  }
}