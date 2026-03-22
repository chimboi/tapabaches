const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3456;
const DATA_DIR = path.join(__dirname, "data");
const REPORTS_FILE = path.join(DATA_DIR, "reports.json");
const WEB_DIR = path.join(__dirname, "web");

fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(REPORTS_FILE)) fs.writeFileSync(REPORTS_FILE, "[]");

function getReports() {
  try { return JSON.parse(fs.readFileSync(REPORTS_FILE, "utf8")); }
  catch { return []; }
}

function saveReports(reports) {
  fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2));
}

const MIME = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg" };

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.writeHead(200); return res.end(); }

  // API GET
  if (req.url === "/api/reports" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(getReports()));
  }

  // API POST
  if (req.url === "/api/reports" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const reports = getReports();
        const report = {
          id: String(Date.now()),
          fecha: new Date().toISOString(),
          ubicacion: data.ubicacion || "Sin ubicacion",
          lat: data.lat || null,
          lng: data.lng || null,
          descripcion: data.descripcion || "Sin descripcion",
          foto: data.foto || null,
          reportadoPor: data.reportadoPor || "Anonimo",
          estado: "pendiente"
        };
        reports.push(report);
        saveReports(reports);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(report));
      } catch {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "JSON invalido" }));
      }
    });
    return;
  }

  // Serve static files from web/
  const filePath = path.join(WEB_DIR, req.url === "/" ? "index.html" : req.url);
  const safePath = path.resolve(filePath);
  if (!safePath.startsWith(path.resolve(WEB_DIR))) { res.writeHead(403); return res.end("Forbidden"); }

  if (fs.existsSync(safePath)) {
    const ext = path.extname(safePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "text/plain" });
    fs.createReadStream(safePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(PORT, () => console.log(`Tapabaches corriendo en http://localhost:${PORT}`));
