// 导入WebSocket模块:
const WebSocket = require("ws");

// ws server
const port1 = 35903;
// http server api
const port2 = 35901;
// 引用Server类:
const WebSocketServer = WebSocket.Server;

const orgRoamGraphData = require("./mockdata");

module.exports = (plugin) => {
  let wss = null;
  function init() {
    // 实例化:
    wss = new WebSocketServer({
      port: port1,
    });

    wss.on("connection", function (ws) {
      setTimeout(() => {
        ws.send(
          JSON.stringify({
            type: "graphdata",
            data: orgRoamGraphData,
          }),
          (err) => {
            if (err) {
              console.log(`[SERVER] error: ${err}`);
            }
          },
        );
      }, 1000);

      ws.on("message", function (message) {
        console.log(`[SERVER] Received: ${message}`);
        ws.send(`ECHO: ${message}`, (err) => {
          if (err) {
            console.log(`[SERVER] error: ${err}`);
          }
        });
      });
    });
  }

  // then it can be call in neovim with
  // lua vim.fn.SetLines
  // you need to call :UpdateRemotePlugins
  // everytime you made change, [[https://github.com/neovim/node-client/issues/204#issuecomment-1575338830][this is the article]]
  plugin.registerFunction(
    "SetLines",
    () => {
      return plugin.nvim
        .setLine("May I offer you an egg in these troubling times")
        .then(() => console.log("Line should be set"));
    },
    { sync: false },
  );
  plugin.registerCommand("InitWs", [plugin.nvim.buffer, init]);
  // it seems like if i add dev:true, it will reload actually
  // from here [[https://github.com/neovim/node-client?tab=readme-ov-file#api]]
  // if not work, some times maybe the function you are passing have
  // error
  plugin.setOptions({ dev: true });
};
