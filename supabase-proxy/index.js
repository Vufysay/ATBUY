const https = require("https");
const http = require("http");

const SUPABASE_URL = "https://buonqsikukvqbnbpuuco.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1b25xc2lrdWt2cWJuYnB1dWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNTU0MzQsImV4cCI6MjA5MDYzMTQzNH0.cCN9ciGSblGTYHUXeyQ_1Yr4htM__7F1CfHkcgQGmcw";

exports.handler = async function (event, context) {
  // CORS-заголовки для всех ответов
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
    "Access-Control-Max-Age": "3600",
  };

  // Если это preflight-запрос (OPTIONS), сразу возвращаем успех
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  try {
    // Извлекаем путь из query-параметра 'path'
    const params = event.queryStringParameters || {};
    const supabasePath = params.path || "";
    const url = SUPABASE_URL + supabasePath;

    // Заголовки для запроса к Supabase
    const headers = {
      apikey: SUPABASE_ANON_KEY,
      Authorization:
        event.headers.authorization || `Bearer ${SUPABASE_ANON_KEY}`,
      host: new URL(SUPABASE_URL).hostname,
      "Content-Type": event.headers["content-type"] || "application/json",
    };

    const lib = SUPABASE_URL.startsWith("https") ? https : http;

    const options = {
      method: event.httpMethod,
      headers: headers,
    };

    return new Promise((resolve, reject) => {
      const req = lib.request(url, options, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () =>
          resolve({
            statusCode: res.statusCode,
            headers: {
              ...corsHeaders,
              "Content-Type": res.headers["content-type"] || "application/json",
            },
            body: body,
          }),
        );
      });
      req.on("error", (err) => reject(err));
      if (event.body) req.write(event.body);
      req.end();
    });
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
