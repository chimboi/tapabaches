const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3456;
const DATA_DIR = path.join(__dirname, "..", "data");
const REPORTS_FILE = path.join(DATA_DIR, "reports.json");
const PHOTOS_DIR = path.join(DATA_DIR, "photos");
const ASSETS_DIR = path.join(__dirname, "..", "assets");

// Ensure data directories exist
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(PHOTOS_DIR, { recursive: true });
if (!fs.existsSync(REPORTS_FILE)) {
  fs.writeFileSync(REPORTS_FILE, "[]");
}

function getReports() {
  try {
    return JSON.parse(fs.readFileSync(REPORTS_FILE, "utf8"));
  } catch {
    return [];
  }
}

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const server = http.createServer((req, res) => {
  if (req.url === "/api/reports") {
    res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
    res.end(JSON.stringify(getReports()));
    return;
  }

  if (req.url.startsWith("/photos/")) {
    const filePath = path.join(PHOTOS_DIR, path.basename(req.url));
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end("Not found");
    }
    return;
  }

  // Serve index.html for root
  const filePath = path.join(ASSETS_DIR, req.url === "/" ? "index.html" : req.url);
  const safePath = path.resolve(filePath);
  if (!safePath.startsWith(path.resolve(ASSETS_DIR))) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (fs.existsSync(safePath)) {
    const ext = path.extname(safePath);
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "text/plain" });
    fs.createReadStream(safePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(PORT, () => {
  console.log(`Bache Reporter web running at http://localhost:${PORT}`);
});
