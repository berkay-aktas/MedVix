# MedVix

ML Visualization Tool for Healthcare Professionals — SENG 430 Software Quality Assurance Laboratory

## Tech Stack

- **Frontend**: React
- **Backend**: Python Flask
- **ML**: scikit-learn, pandas, numpy, SHAP

## Project Structure

```
MedVix/
├── frontend/          # React application
├── backend/           # Flask API server
│   ├── data/          # Built-in CSV datasets (20 clinical domains)
│   ├── models/        # ML model training & evaluation
│   └── app.py         # Flask entry point
├── docker-compose.yml
└── README.md
```

## Getting Started

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
flask run
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Team — MedVix

| Name | Role |
|------|------|
| Berkay AKTAS | Lead Developer & Scrum Master |
| Arzu Tuğçe KOCA | QA / Documentation Lead |
| Nisanur KONUR | Product Owner |
| Özge ALTINOK | UX Designer |
