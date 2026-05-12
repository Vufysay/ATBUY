const https = require("https");
const http = require("http");

// Замените на ваш реальный URL Supabase
const SUPABASE_URL = "https://buonqsikukvqbnbpuuco.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1b25xc2lrdWt2cWJuYnB1dWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNTU0MzQsImV4cCI6MjA5MDYzMTQzNH0.cCN9ciGSblGTYHUXeyQ_1Yr4htM__7F1CfHkcgQGmcw";

exports.handler = async function (event, context) {
  // Собираем URL для запроса к Supabase
  const supabasePath = event.url.replace("/supabase", ""); // Убираем наш префикс '/supabase'
  const url = SUPABASE_URL + supabasePath;

  // Добавляем необходимые заголовки для авторизации
  const headers = {
    ...event.headers,
    apikey: SUPABASE_ANON_KEY,
    Authorization: event.headers.authorization || `Bearer ${SUPABASE_ANON_KEY}`,
    host: new URL(SUPABASE_URL).hostname,
  };
  // Удаляем заголовки, которые могут помешать
  delete headers["content-length"];
  delete headers["host"];

  // Выбираем библиотеку в зависимости от протокола
  const lib = SUPABASE_URL.startsWith("https") ? https : http;

  const options = {
    method: event.httpMethod,
    headers: headers,
  };

  // Выполняем запрос и возвращаем ответ
  return new Promise((resolve, reject) => {
    const req = lib.request(url, options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () =>
        resolve({
          statusCode: res.statusCode,
          headers: {
            "Content-Type": res.headers["content-type"] || "application/json",
          },
          body: body,
        }),
      );
    });
    req.on("error", reject);
    if (event.body) req.write(event.body);
    req.end();
  });
};
