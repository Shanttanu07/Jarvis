import { BaseSideService } from "@zeppos/zml/base-side";

const padStart = (str, maxLength, fillStr = "0") => {
  return str.toString().padStart(maxLength, fillStr);
};

const formatDate = (date = new Date()) => {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const h = date.getHours();
  const mm = date.getMinutes();
  const s = date.getSeconds();

  return `${y}-${padStart(m, 2)}-${padStart(d, 2)} ${padStart(h, 2)}:${padStart(
    mm,
    2
  )}:${padStart(s, 2)}`;
};
// Simulating an asynchronous network request using Promise
async function mockAPI() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        body: {
          data: {
            text: "HELLO ZEPPOS: " + formatDate(),
          },
        },
      });
    }, 1000);
  });
};

async function fetchData(res) {
  try {
    const { body: { data = {} } = {} } = await fetch({
      url: 'https://jarvisbackend.randomcoder1234.repl.co/pusher/1',
      method: 'GET'
    })
    res(null, {
      result: data,
    });
  } catch (error) {
    res(null, {
      result: "ERROR",
    });
  }
};
async function fetchData2(res) {
  try {
    const { body: { data = {} } = {} } = await fetch({
      url: 'https://jarvisbackend.randomcoder1234.repl.co/pusher/2',
      method: 'GET'
    })
    res(null, {
      result: data,
    });
  } catch (error) {
    res(null, {
      result: "ERROR",
    });
  }
};
AppSideService(
  BaseSideService({
    onInit() {},

    onRequest(req, res) {
      console.log("=====>,", req.method);
      if (req.method === "GET_DATA1") {
        fetchData(res);
      }
      if (req.method === "GET_DATA2"){
        fetchData2(res)
      }
    },

    onRun() {},

    onDestroy() {},
  })
);
