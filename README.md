# ExpliUI

ExpliUI compares UI screenshots between environments and highlights visual differences.

## Live Deployment

- Frontend: http://75.119.130.72:8081/

## Main Features

- Upload screenshot pairs and compare them.
- Capture screenshots from URLs.
- Run model-based and rule-based UI comparison.
- Review results with evidence in the frontend dashboard.

## Project Structure

```text
ExpliUI/
├── frontend/      # React + Vite app
├── backendV2/     # FastAPI API + comparison services
└── docker-compose.yml
```

## Quick Start (Docker)

```bash
git clone https://github.com/hirushi24/ExpliUI
cd ExpliUI
docker-compose up --build -d
```

Open:
- Frontend: http://localhost:8081
- Backend: http://localhost:8000
- API docs: http://localhost:8000/docs

Stop:

```bash
docker-compose down
```

## Local Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backendV2
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
fastapi dev app/main.py --port 8000
```

## API Endpoints

Base URL: `http://localhost:8000/api`

- `GET /predict/`
- `POST /predict/GetPredictResult`
- `POST /predict/CaptureByUrl`
- `POST /predict/CompareRuleBased`

## Notes

- Set `GEMINI_API_KEY` in `docker-compose.yml` before running in environments that require it.
- Uploaded images are stored under `backendV2/upload_image`.
