---
name: bache-reporter
description: Receive and manage pothole (bache) reports from WhatsApp users. Use when a user sends a message about a pothole, road damage, street problem, or "bache". Handles receiving location, photos, and descriptions of potholes, stores them in a local JSON database, and serves a public web page showing all reports on a map. Triggers on words like "bache", "hoyo", "calle rota", "reportar", "reporte", "pothole", "road damage".
---

# Bache Reporter

Receive pothole reports via WhatsApp and display them on a public web map.

## Workflow

When a user reports a pothole (bache):

1. **Acknowledge** the report immediately in Spanish: "Gracias por tu reporte! Necesito algunos datos."
2. **Collect information** - Ask for any missing data:
   - **Ubicacion**: Street address or GPS coordinates. If the user shares a WhatsApp location, extract lat/lng.
   - **Descripcion**: Brief description of the problem (size, danger level).
   - **Foto** (optional): A photo of the pothole.
3. **Save the report** by appending a JSON entry to `~/.openclaw/skills/bache-reporter/data/reports.json`:
   ```json
   {
     "id": "<unix-timestamp>",
     "fecha": "<ISO date>",
     "ubicacion": "<address or description>",
     "lat": <latitude or null>,
     "lng": <longitude or null>,
     "descripcion": "<user description>",
     "foto": "<file path or null>",
     "reportadoPor": "<sender name or number>",
     "estado": "pendiente"
   }
   ```
4. **Confirm** to the user: "Tu reporte #<id> fue registrado. Puedes ver todos los reportes en http://localhost:3456"

## Data Storage

- Reports file: `~/.openclaw/skills/bache-reporter/data/reports.json` (JSON array)
- Photos: save to `~/.openclaw/skills/bache-reporter/data/photos/`
- Create the data directory and empty JSON array `[]` if they don't exist.

## Web Dashboard

Run the web server to view reports:
```bash
node ~/.openclaw/skills/bache-reporter/scripts/server.js
```

The server runs on port 3456 and serves:
- A map showing all reported potholes with pins
- A list of recent reports with details
- Status of each report (pendiente/en proceso/resuelto)

## Report Status Updates

Users can ask about their reports. Read reports.json and filter by their number/name.
Users can also update status by saying "el bache #<id> ya fue arreglado" - update estado to "resuelto".

## Important Notes

- Always respond in Spanish
- Be empathetic - people reporting potholes are frustrated
- If location is vague, ask for cross streets or landmarks
- Encourage users to share their GPS location for accurate mapping
