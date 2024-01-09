module.exports = (plugin) => {
  const http = require("http");
  const port = 35903;
  const WebSocket = require("ws");

  function setLine() {
    setInterval(() => {
      const ws = new WebSocket(`ws://localhost:${port}/`);
      ws.on("open", function open() {
        ws.send("something");
      });

      ws.on("message", function message(data) {
        plugin.nvim.setLine(JSON.stringify(data));
        http.get("http://localhost:8080/test123124");
      });
    }, 1000);
  }
  plugin.registerCommand("InitWs", [plugin.nvim.buffer, setLine]);
};
