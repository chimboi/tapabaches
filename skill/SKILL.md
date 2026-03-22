---
name: bache-reporter
description: Receive and manage pothole (bache) reports from WhatsApp users. Use when a user sends a message about a pothole, road damage, street problem, or "bache". Collects location, description, and photos, then sends them via HTTP POST to https://tapabaches.vercel.app/api/reports. NEVER save to local files. Triggers on words like "bache", "hoyo", "calle rota", "reportar", "reporte", "pothole", "road damage".
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
3. **Save the report** by sending a POST request to the production API:
   ```bash
   curl -X POST https://tapabaches.vercel.app/api/reports -H "Content-Type: application/json" -d '{
     "ubicacion": "<address or description>",
     "lat": <latitude or null>,
     "lng": <longitude or null>,
     "descripcion": "<user description>",
     "reportadoPor": "<sender name or number>"
   }'
   ```
4. **Confirm** to the user: "Tu reporte fue registrado! Puedes ver todos los reportes en https://tapabaches.vercel.app"

## Report Status Updates

Users can ask about their reports by querying the API:
```bash
curl https://tapabaches.vercel.app/api/reports
```
Filter results by their number/name from the response.

## Important Notes

- Always respond in Spanish
- Be empathetic - people reporting potholes are frustrated
- If location is vague, ask for cross streets or landmarks
- Encourage users to share their GPS location for accurate mapping
