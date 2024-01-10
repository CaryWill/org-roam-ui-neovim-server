const WebSocket = require("ws");

const wsPort = 35903;
const httpPort = 35901;
const WebSocketServer = WebSocket.Server;

let wss = null;
let wsarray = [];
let graphdata = null;

const processGraphData = (_graphdata) => {
  try {
    const data = JSON.parse(_graphdata);
    const nodes = [];
    const links = [];
    const tags = [];
    data.forEach((file) => {
      const { file_id: id, file_path } = file;
      nodes.push({
        id,
        file: file_path,
        // TODO: fix comment single comment
        // TODO: file name not stored in db
        // use last path component for now
        // then fix the dev env and refactor code
        title: file_path
          .split("/")
          [file_path.split("/").length - 1].split(".")[0],
        level: 0,
        pos: 0,
        properties: {},
        tags: [],
        olp: null,
      });
      const backlinks = JSON.parse(file.id_links);
      backlinks.forEach((link) => {
        links.push({
          source: link.file_id,
          target: link.id,
          type: "bad",
        });
      });
    });
    return { nodes, links, tags };
  } catch (err) {
    // TODO: how to properly debug by logging
    // it looks like I can't use console.log
    // because it throw errors
    // https://github.com/neovim/node-client/issues/202
    plugin.nvim.outWrite(`${err.message}! \n`);
    return { nodes: [], links: [], tags: [] };
  }
};

module.exports = (plugin) => {
  function init() {
    plugin.nvim.outWrite(`connecting... \n`);
    wss = new WebSocketServer({
      port: wsPort,
    });

    // TODO: remove from array when disconnect
    // or I can find a way to use wss object
    // to get all clients
    wss.on("connection", function (ws) {
      plugin.nvim.outWrite(`connected! \n`);
      wsarray.push(ws);
      if (graphdata) {
        updateGraphData();
      }
    });
  }

  const updateGraphData = () => {
    plugin.nvim.outWrite("updateGraphData! \n");
    wsarray.forEach((ws) => {
      const { nodes, links, tags } = processGraphData(graphdata);
      // TODO: 需要找一个高效率的调试方式
      ws.send(
        JSON.stringify({
          type: "graphdata",
          data: {
            nodes,
            links,
            tags,
          },
        }),
      );
    });
  };

  // lua vim.fn.SetLines
  // you need to call :UpdateRemotePlugins
  // everytime you made change, [[https://github.com/neovim/node-client/issues/204#issuecomment-1575338830][this is the article]]
  plugin.registerFunction(
    "UpdateGraphData",
    (data) => {
      graphdata = data;
      updateGraphData();
      return Promise(true);
    },
    { sync: false },
  );

  plugin.registerCommand("InitWs", [plugin.nvim.buffer, init]);

  // it seems like if i add dev:true, it will reload actually
  // from here [[https://github.com/neovim/node-client?tab=readme-ov-file#api]]
  // if not work, some times maybe the function you are passing have
  // error
  // plugin.setOptions({ dev: true });
};
