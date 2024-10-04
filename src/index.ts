import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { setCookie, getCookie } from "hono/cookie";

const app = new Hono();

app.use("*", async (c, next) => {
  await new Promise((resolve) =>
    setTimeout(resolve, Math.floor(Math.random() * 901) + 100)
  );
  setCookie(c, "last-visit", new Date().toISOString(), {
    httpOnly: true,
    path: "/",
  });
  await next();
});

app.get("/api/hello", (c) => {
  const lastVisit = getCookie(c, "last-visit");
  return c.json({ lastVisit });
});

app.get("/", (c) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hono App</title>
    </head>
    <body>
      <div id="message"></div>
      <script>
        function fetchMessage() {
          fetch('/api/hello')
            .then(response => response.json())
            .then(({ lastVisit }) => {
              document.getElementById('message').textContent = "Last visit: " + lastVisit;
            })
            .catch((error) => console.error('Error:', error));
        }

        fetchMessage();

        setInterval(() => {
          fetchMessage();
        }, 500);
      </script>
    </body>
    </html>
  `;
  return c.html(html);
});

const port = 3005;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
