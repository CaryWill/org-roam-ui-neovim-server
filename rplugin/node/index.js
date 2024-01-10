const WebSocket = require("ws");

// ws server
const port1 = 35903;
// http server api
const port2 = 35901;

const WebSocketServer = WebSocket.Server;

// const orgRoamGraphData = require("./mockdata");

let wss = null;
let wsarray = [];
let graphdata = null;

const processGraphData = (_graphdata) => {
  try {
    plugin.nvim.outWrite(`123! \n`);
    // const data = JSON.parse(_graphdata);
    const nodes = [];
    const links = [];
    const tags = [];
    // plugin.nvim.outWrite(`${_graphdata}! \n`);
    return;
    // TODO: try catch
    data[0].forEach((file) => {
      const { file_id: id, file_path } = file;
      nodes.push({
        id,
        file: file_path,
        // TODO: file name not stored in db
        title: file_path,
        level: 0,
        pos: 0,
        properties: {},
        tags: [],
        olp: null,
      });
      // const backlinks = JSON.parse(file.links);
      // backlinks.forEach((link) => {
      //   links.push({
      //     source: link.file_id,
      //     target: link.id,
      //     type: "bad",
      //   });
      // });
    });
    return { nodes, links, tags };
  } catch (err) {
    plugin.nvim.outWrite(`${err.message}! \n`);
  }
};

module.exports = (plugin) => {
  function init() {
    plugin.nvim.outWrite("inited! \n");
    wss = new WebSocketServer({
      port: port1,
    });

    wss.on("connection", function (ws) {
      plugin.nvim.outWrite("Dayman (ah-ah-ah) 2\n");
      wsarray.push(ws);
      return;
      if (!graphdata) return;
      const { nodes, links, tags } = processGraphData(graphdata);
      plugin.nvim.outWrite("connected! \n");
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
  }

  const updateGraphData = () => {
    plugin.nvim.outWrite("updateGraphData! \n");
    // TODO: wsarray 替换成 wss.clients?
    // 需要一个办法获取所有链接的 clients
    wsarray.forEach((ws) => {
      // since lua only have table data structure
      // so, {} will be convert to [{}]
      const { nodes, links, tags } = processGraphData(graphdata);
      plugin.nvim.outWrite(`updateGraphData! with ${graphdata} \n`);
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

  plugin.registerFunction(
    "InitWs",
    (data) => {
      init();
      return Promise(true);
    },
    { sync: false },
  );

  // then it can be call in neovim with
  // lua vim.fn.SetLines
  // you need to call :UpdateRemotePlugins
  // everytime you made change, [[https://github.com/neovim/node-client/issues/204#issuecomment-1575338830][this is the article]]
  plugin.registerFunction(
    "UpdateGraphData",
    (data) => {
      graphdata = data;
      updateGraphData();
      // works like console.log
      // plugin.nvim.outWrite('Dayman (ah-ah-ah) \n')
      // https://github.com/neovim/node-client/issues/202

      // plugin.nvim.outWrite(`${data} \n`)
      // TODO: seems like open localtion list will not triiger it?
      return Promise(true);
    },
    { sync: false },
  );

  // For test
  plugin.registerFunction(
    "CTest",
    (data) => {
      plugin.nvim.outWrite(`${wsarray.length || "getwss"}${graphdata} \n`);
      return Promise(true);
    },
    { sync: false },
  );

  plugin.registerCommand("InitWs", [plugin.nvim.buffer, init]);

  // plugin.registerAutocmd(
  //   "BufEnter",
  //   async (fileName) => {
  //     init()
  //   },
  //   { sync: false, pattern: "*.org" },
  // );

  // it seems like if i add dev:true, it will reload actually
  // from here [[https://github.com/neovim/node-client?tab=readme-ov-file#api]]
  // if not work, some times maybe the function you are passing have
  // error
  // plugin.setOptions({ dev: true });
};
