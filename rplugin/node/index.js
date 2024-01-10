// 导入WebSocket模块:
const WebSocket = require("ws");

// ws server
const port1 = 35903;
// http server api
const port2 = 35901;
// 引用Server类:
const WebSocketServer = WebSocket.Server;

module.exports = (plugin) => {
  function setLine() {
    // 实例化:
    const wss = new WebSocketServer({
      port: port1,
    });

    wss.on("connection", function (ws) {
      setTimeout(() => {
        ws.send(`this is from nodejs`, (err) => {
          if (err) {
            console.log(`[SERVER] error: ${err}`);
          }
        });
      }, 8000);

      console.log(`[SERVER] connection()`);
      ws.on("message", function (message) {
        console.log(`[SERVER] Received: ${message}`);
        ws.send(`ECHO: ${message}`, (err) => {
          if (err) {
            console.log(`[SERVER] error: ${err}`);
          }
        });
      });
    });

    // http.get("http://localhost:8080/test123124");
  }
  plugin.registerCommand("InitWs", [plugin.nvim.buffer, setLine]);
};
