🏀 NBA Trajectory Predictor
Welcome to NBA Trajectory Predictor — a passion project combining my love for basketball and data science.
This app takes a player’s rookie stats and measurable attributes, runs them through a machine learning model, and projects how their scoring, playmaking, and rebounding might evolve over the next five seasons.

If you’ve ever debated with friends about whether a rookie will be the next superstar or just a role player — this tool gives you data-driven receipts. 📊🔥

🚀 Features
Interactive Input UI

Enter rookie year PPG, APG, RPG

Adjust height with a slider (measured in feet & inches)

Instantly see updated projections

Clean Visualizations

📈 Line Chart – Tracks projected PPG, APG, RPG over years 2–6

📊 Table View – Year-by-year breakdown

🕸 Radar Chart – Rookie vs Year 6 side-by-side snapshot

AI Summary

Generates a natural-language recap of the projection — perfect for quickly understanding the trends

🛠 Tech Stack
Frontend:

Next.js (React + TypeScript)

shadcn/ui components

Recharts for data visualizations

Backend:

FastAPI (Python)

XGBoost regression model trained on historical NBA rookie data

📦 Installation & Running Locally
bash
Copy
Edit
# Clone the repo
git clone https://github.com/anandjss/nba-stats-predictor.git
cd nba-stats-predictor

# Frontend setup
cd frontend
npm install
npm run dev

# Backend setup
cd ../backend
pip install -r requirements.txt
uvicorn main:app --reload
Frontend runs at http://localhost:3000
Backend runs at http://127.0.0.1:8000


🧠 How It Works
User inputs rookie stats & height

Frontend sends data to FastAPI backend

Backend runs the input through a pre-trained XGBoost model

Predictions for years 2–6 are returned and visualized

AI summary is generated to explain the trends in plain English

🎯 Why I Built This
I’ve always loved both basketball and data analytics.
This project is my way of bringing the two worlds together:

Apply machine learning skills to a real-world, passion-driven dataset

Build a full-stack application from scratch

Make something fun & interactive for hoops fans (and myself)

It’s not just about predicting numbers — it’s about telling a player’s story through data.

📌 Roadmap
 Add more advanced stats (TS%, BPM, Usage%)

 Include draft position & wingspan into model training

 Deploy as a public web app for anyone to use

 Add historical player lookup mode (compare real vs predicted)

🤝 Contributing
Got ideas? Found a bug? Want to add a feature? PRs are welcome — just fork, branch, and submit.

📫 Contact
Created with ❤️ by Anand Jayashankar

LinkedIn: https://www.linkedin.com/in/anandjss/



If you love basketball, machine learning, or just clean data visualizations — I hope you’ll enjoy this project as much as I enjoyed building it. 🏀📊

