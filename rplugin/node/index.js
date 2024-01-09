module.exports = (plugin) => {
  const http = require("http");
  const port = 35903;

  function setLine() {
    http.get("http://localhost:8080/test123124");
    plugin.nvim.setLine("test");
  }
  plugin.registerCommand("InitWs", [plugin.nvim.buffer, setLine]);
};
