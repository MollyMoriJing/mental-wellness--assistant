# Mental Wellness Assistant

An AI-powered mental health platform using Flask, React, OpenAI, and Pinecone to deliver conversational support, mood tracking, and personalized wellness recommendations.

## Tech Stack

- **Frontend**: React, TailwindCSS
- **Backend**: Flask, SQLAlchemy, Flask-JWT
- **AI & Search**: OpenAI GPT-3.5, Pinecone vector DB
- **Database**: MySQL (or SQLite for dev)

## Features

- Secure JWT-based authentication
- GPT-powered wellness chat
- Mood logging & history
- Semantic resource recommendations

## Demo

<img src='demo.gif' title='Demo' width='' alt='Demo' />

## Project Structure

```
mental-wellness-assistant/
├── backend/
│   ├── app.py
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── config.py
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api.js
│   │   └── styles.css
│   └── index.html
```

## Getting Started

### 1. Setup Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python app.py
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

See `.env.example` for required variables:

```
OPENAI_API_KEY=your-key
PINECONE_API_KEY=your-key
PINECONE_ENVIRONMENT=us-east4-gcp
MYSQL_URL=mysql+pymysql://user:pass@localhost/db
JWT_SECRET_KEY=secret
```

## Example Prompt

> "I'm feeling stressed after work every day. What can I do to relax more effectively?"

## License

MIT
