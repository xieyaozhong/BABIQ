# BABIQ — Taiwan BBQ Map

BABIQ is a static GitHub Pages MVP for discovering BBQ / yakiniku restaurants across Taiwan and playing a 3-minute pixel BBQ timing game.

## Included

- Taiwan-wide interactive Leaflet map
- Live public POI loading from OpenStreetMap / Overpass
- Search by restaurant name, feature, cuisine, or address
- North / Central / South / East filters
- Price-field support when public data contains price information
- Restaurant list synchronized with map markers
- Demo seat-availability query UI with date and party-size selection
- 180-second pixel BBQ game
- Multiple ingredients with different flip timing windows
- Easy / Normal / Hard difficulty
- Combo scoring
- Special events:
  - Charcoal flare-up
  - Grease flare
  - Wind / reduced heat
- Responsive mobile layout

## Data accuracy

Restaurant position and basic metadata come from OpenStreetMap / Overpass public data and may be incomplete or outdated.

The current availability engine is deliberately marked **DEMO**. It produces deterministic sample slots and does **not** represent real restaurant inventory. Replace that layer with an authorized reservation provider or restaurant backend before presenting seats as live availability.

Price values are only shown when the public restaurant record exposes a price-like field; otherwise BABIQ displays “價位待確認” rather than guessing.

## Run locally

Open `index.html` with a local static server. For example:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Deployment

A GitHub Pages workflow is included at `.github/workflows/pages.yml`.

If Pages has not been enabled for this repository yet, go to:

**Settings → Pages → Build and deployment → Source → GitHub Actions**

Then push to `main` or run the workflow manually.

## Next integrations

1. Real-time booking inventory (inline / EZTABLE / authorized restaurant API)
2. Merchant dashboard for menus, price tiers, photos, features and seat inventory
3. User accounts and saved BBQ lists
4. Game leaderboard, seasonal events and restaurant-linked rewards
5. Moderated community corrections for missing OSM metadata

## License

MIT
