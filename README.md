# 🧠 MindCare - AI-Powered Mental Wellness Assistant

A revolutionary mental wellness platform that combines **personalized AI support**, **community engagement**, and **professional coaching** to create a comprehensive mental health ecosystem. Unlike generic chatbots, MindCare learns from your unique mental health journey to provide truly personalized support.

![MindCare Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![React](https://img.shields.io/badge/React-18+-61dafb)
![AI Powered](https://img.shields.io/badge/AI-Powered-orange)

## 🌟 Why MindCare is Better Than Just Asking ChatGPT

### **🎯 Personalized Mental Health Support**

- **Learns from YOUR mood patterns** - Not generic advice
- **Remembers your progress** - "Last week you felt confident about presentations"
- **Identifies personal triggers** - "I notice work stress affects your sleep"
- **Tracks your journey** - Celebrates wins, supports during challenges

### **🔬 Evidence-Based Psychology**

- **CBT techniques** - Cognitive Behavioral Therapy methods
- **Crisis intervention** - Professional-grade safety protocols
- **Evidence-based strategies** - Not random internet advice
- **Professional referrals** - Knows when to suggest real help

### **🏥 Mental Health Specificity**

- **Mood tracking integration** - AI uses your actual mood data
- **Pattern recognition** - Spots concerning trends early
- **Therapeutic continuity** - Builds relationship over time
- **Privacy-first design** - Your data stays secure

## 🏗️ App Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │   Dashboard │ │ AI Chat     │ │ Community Forum     │   │
│  │   - Moods   │ │ - Personal  │ │ - Support Groups    │   │
│  │   - Trends  │ │ - Context   │ │ - Success Stories   │   │
│  │   - Stats   │ │ - History   │ │ - Anonymous Posts   │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Flask)                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │   REST API  │ │ WebSocket   │ │ Authentication      │   │
│  │   - CRUD    │ │ - Real-time │ │ - JWT Tokens        │   │
│  │   - Search  │ │ - Chat      │ │ - Role-based        │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
        ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
        │   SQLite DB     │ │  Pinecone   │ │   OpenAI API    │
        │   - Users       │ │  Vectors    │ │   - GPT-3.5     │
        │   - Moods       │ │  - Semantic │ │   - Embeddings  │
        │   - Community   │ │  - Search   │ │   - Responses   │
        │   - Sessions    │ │  - Context  │ │                 │
        └─────────────────┘ └─────────────┘ └─────────────────┘
```

## 🚀 Key Features

### **🤖 Intelligent AI Assistant**

- **Personalized responses** based on your mood history
- **Context-aware conversations** using Pinecone vector search
- **Hybrid search system** (semantic + keyword matching)
- **Evidence-based psychology** knowledge base
- **Crisis detection** and professional referral system

### **📊 Advanced Mood Tracking**

- **Visual analytics** with interactive charts
- **Pattern recognition** across time periods
- **Mood correlation** with life events
- **Export capabilities** for therapy sessions
- **AI-enhanced insights** from your data

### **👥 Community Support**

- **Anonymous posting** for sensitive topics
- **Support groups** by mental health topics
- **Success stories** to inspire hope
- **Real-time interactions** with WebSocket
- **Moderated content** for safety

### **🎯 Professional Coaching**

- **Verified mental health coaches**
- **Real-time chat sessions**
- **Session scheduling** and management
- **Progress tracking** with coaches
- **Secure communication** channels

### **🔒 Privacy & Security**

- **End-to-end encryption** for sensitive data
- **User-specific namespaces** in vector database
- **JWT-based authentication**
- **Role-based access control**
- **GDPR compliant** data handling

## 🛠️ Tech Stack

### **Frontend**

- **React 18** - Modern UI with hooks and context
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first styling
- **Recharts** - Beautiful data visualizations
- **Socket.IO** - Real-time communication
- **Axios** - HTTP client with interceptors

### **Backend**

- **Flask** - Lightweight Python web framework
- **SQLAlchemy** - Powerful ORM for database operations
- **Flask-SocketIO** - WebSocket support for real-time features
- **JWT Authentication** - Secure token-based auth
- **Flask-Limiter** - API rate limiting and protection

### **AI & Search**

- **OpenAI GPT-3.5-turbo** - Conversational AI
- **Pinecone Serverless** - Vector database for semantic search
- **BM25 Algorithm** - Keyword-based search
- **Text Embeddings** - 1536-dimensional vector representations

### **Database**

- **SQLite** - Development and lightweight production
- **MySQL** - Production database support
- **Vector Storage** - Pinecone for embeddings

## 🚀 Quick Start

### **Prerequisites**

- Python 3.8+
- Node.js 16+
- OpenAI API Key (optional but recommended)
- Pinecone API Key (optional but recommended)

### **1. Clone and Setup**

```bash
git clone https://github.com/yourusername/mental-wellness-assistant.git
cd mental-wellness-assistant

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### **2. Environment Configuration**

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API keys
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=us-east-1  # For serverless
JWT_SECRET_KEY=your_jwt_secret_key
```

### **3. Database Setup**

```bash
# Initialize database with sample data
python backend/seed_data.py
```

### **4. Start the Application**

```bash
# Terminal 1: Start backend
python backend/app.py

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### **5. Access the Application**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **API Documentation**: http://localhost:5001/api/health

## 📖 User Guide

### **Getting Started**

1. **Register/Login** - Create your account or use sample credentials
2. **Log Your First Mood** - Start tracking your emotional patterns
3. **Chat with AI** - Experience personalized mental health support
4. **Explore Community** - Connect with others on similar journeys
5. **Book Coaching** - Schedule sessions with verified professionals

### **Sample Accounts**

After running the seed data script, you can use these accounts:

**Coaches:**

- `sarah.chen@wellness.com` / `coach123`
- `michael.rodriguez@wellness.com` / `coach123`
- `emma.wilson@wellness.com` / `coach123`

**Community Members:**

- `alex.johnson@email.com` / `user123`
- `maria.garcia@email.com` / `user123`

## 🔧 Advanced Configuration

### **Pinecone Setup (Optional)**

```bash
# 1. Sign up at https://pinecone.io
# 2. Create a new project
# 3. Get your API key
# 4. Set PINECONE_API_KEY in .env
# 5. The app will automatically create a serverless index
```

### **OpenAI Setup (Optional)**

```bash
# 1. Get API key from https://platform.openai.com
# 2. Set OPENAI_API_KEY in .env
# 3. AI features will be enabled automatically
```

### **Production Deployment**

```bash
# Use MySQL for production
MYSQL_URL=mysql://user:password@localhost/mental_wellness

# Set production environment
FLASK_ENV=production
FLASK_DEBUG=False
```

## 🧪 Testing

### **API Testing**

```bash
# Test user registration
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123"}'

# Test mood logging
curl -X POST http://localhost:5001/api/user/moods \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"level": "good", "note": "Feeling great today!"}'

# Test AI chat
curl -X POST http://localhost:5001/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message": "I am feeling stressed about work"}'
```

### **Frontend Testing**

- Navigate to http://localhost:3000
- Test all features: mood tracking, chat, community, coaching
- Verify responsive design on different screen sizes
- Test real-time features like live chat and notifications

## 🏗️ Development

### **Project Structure**

```
mental-wellness-assistant/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── config.py             # Configuration settings
│   ├── models/               # Database models
│   │   └── user.py          # User, Mood, Community models
│   ├── routes/               # API endpoints
│   │   ├── auth.py          # Authentication
│   │   ├── chat.py          # AI chat
│   │   ├── user.py          # User management
│   │   ├── community.py     # Community features
│   │   └── coaching.py      # Professional coaching
│   ├── services/             # Business logic
│   │   ├── chat_service.py  # AI response generation
│   │   └── recommender.py   # Context retrieval
│   └── utils/                # Utility functions
│       ├── auth.py          # Authentication helpers
│       ├── pinecone.py      # Vector operations
│       └── bm25.py          # Keyword search
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   └── styles/          # CSS modules
│   └── package.json
└── requirements.txt
```

### **Key Algorithms**

#### **Hybrid Search System**

```python
# Combines semantic and keyword search
def retrieve_context(user_id, query_text):
    embedding = get_embedding(query_text)  # OpenAI
    bm25_docs = bm25_search(user_id, query_text)  # Keyword
    vector_matches = query_similar(user_id, embedding)  # Semantic
    return merge_results(bm25_docs, vector_matches)
```

#### **Personalized AI Responses**

```python
# Uses user's mood history for context
def generate_response(user_id, user_input):
    contexts = retrieve_context(user_id, user_input)
    psychology_context = get_psychology_context(keywords)
    # Combines personal history + psychology knowledge
    return ai_response_with_context(contexts, psychology_context)
```

## 🚀 Deployment

### **Docker Deployment**

```bash
# Build and run with Docker
docker-compose up --build
```

### **Cloud Deployment**

- **Backend**: Deploy to Heroku, AWS, or Google Cloud
- **Frontend**: Deploy to Vercel, Netlify, or AWS S3
- **Database**: Use managed PostgreSQL or MySQL
- **Vector DB**: Pinecone serverless (auto-scaling)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### **Development Guidelines**

- Follow PEP 8 for Python code
- Use ESLint for JavaScript/React code
- Write tests for new features
- Update documentation as needed
- Test on multiple screen sizes

## 🗺️ Roadmap

### **Phase 1: Enhanced AI** 🚀

- [ ] Custom AI model training on mental health data
- [ ] Multi-language support
- [ ] Voice chat integration

### **Phase 2: Advanced Analytics** 📊

- [ ] Mood trend analysis and insights
- [ ] Personalized recommendations
- [ ] Wellness score calculation
- [ ] Export data functionality

### **Phase 3: Mobile App** 📱

- [ ] React Native mobile application
- [ ] Push notifications
- [ ] Offline mood tracking
- [ ] Biometric integration

### **Phase 4: Professional Features** 👩‍⚕️

- [ ] Therapist dashboard
- [ ] Session scheduling system
- [ ] Progress reports
- [ ] HIPAA compliance

## 🐛 Troubleshooting

### **Common Issues**

**AI Chat Not Working:**

- Check if OPENAI_API_KEY is set in .env
- Verify OpenAI API key is valid and has credits
- Check backend logs for error messages

**Pinecone Not Working:**

- Ensure PINECONE_API_KEY is set in .env
- Verify Pinecone account has serverless enabled
- Check if index was created successfully

**Database Issues:**

- Ensure database is initialized: `python backend/seed_data.py`
- Check if SQLite file exists in backend directory
- Verify database permissions

**Frontend Not Loading:**

- Check if backend is running on port 5001
- Verify frontend is running on port 3000
- Check browser console for errors

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing the AI capabilities
- **Pinecone** for vector search functionality
- **TailwindCSS** for the beautiful UI framework
- **Lucide** for the comprehensive icon set
- **Flask** and **React** communities for excellent documentation

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/mental-wellness-assistant/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/mental-wellness-assistant/discussions)
- **Email**: support@mindcare.app

---

**Made with ❤️ for mental wellness and community support**

_Remember: This application is for educational and supportive purposes. Always consult with qualified mental health professionals for serious mental health concerns._

## 🌟 What Makes MindCare Special

### **Beyond Generic Chatbots**

Unlike ChatGPT or other generic AI assistants, MindCare:

- **Remembers your journey** - Builds a relationship over time
- **Understands mental health** - Trained on psychology principles
- **Provides continuity** - Tracks your progress and patterns
- **Offers community** - Connects you with others facing similar challenges
- **Includes professionals** - Bridges to real mental health support

### **The Science Behind It**

- **Evidence-based psychology** - Uses proven therapeutic techniques
- **Personalized learning** - Adapts to your unique patterns
- **Crisis intervention** - Recognizes when you need immediate help
- **Progress tracking** - Celebrates wins and identifies concerns
- **Privacy-first** - Your mental health data stays secure

**This isn't just another chatbot - it's your personal mental wellness companion.** 🧠✨
