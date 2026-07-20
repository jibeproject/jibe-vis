# Data preparation
Data preparation for JIBE Transport Health Impacts.

The historical workflow was prepared as an [R Quarto project](https://quarto.org/docs/projects/quarto-projects.html), documented in the [`JIBE_vis-data-preparation-R.md`](./JIBE_vis-data-preparation-R.md) markdown document. It is being progressively replaced by:

- **The `/dev` developer dashboard** in the app (scenario microdata ingest, derived Athena tables, PMTiles upload) — see `app/amplify/lambda/dev-admin/`.
- [`exportVisualisationResources-spec.md`](./exportVisualisationResources-spec.md) — contract for a JIBE model runner that exports visualisation-ready resources (microdata + zone→area lookup) straight into the dashboard's upload conventions.
- [`make_melbourne_tiles.R`](./make_melbourne_tiles.R) — standalone one-off script building `Melbourne.pmtiles` (SA1 with SEIFA IRSD deciles + SA2 + LGA layers) from ABS reference geography.
- `create_demographic_distribution_tables.sql` — human-readable source of truth for the templated distribution CTAS run by the dashboard.

Project dependencies for the R scripts are described in the [`renv.lock`](./renv.lock) file; see [renv](https://rstudio.github.io/renv/) for more information (`make_melbourne_tiles.R` additionally uses `readxl`, and [tippecanoe](https://github.com/felt/tippecanoe) for the final tiling step).
