# Web Prompt Wizard 🧙

AI-powered prompt optimization tool with copy, regenerate, and structured output features. A complete web application for optimizing, generating, and enhancing AI prompts with a mobile-responsive and user-friendly interface.

## Features ✨

- **Prompt Optimization**: Enhance existing prompts for better clarity and effectiveness
- **Prompt Generation**: Create new prompts based on your requirements
- **Prompt Regeneration**: Generate multiple variations of existing prompts
- **Copy-Ready Output**: All prompts are structured and ready to copy-paste
- **Mobile Responsive**: Fully optimized for mobile and tablet devices
- **Template Library**: Pre-built templates for different categories
- **Real-time Validation**: Input validation with character counters
- **Error Handling**: Comprehensive error handling and user feedback
- **Security**: Built-in security measures and rate limiting

## Quick Start 🚀

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/web-prompt-wizard.git
   cd web-prompt-wizard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```bash
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # OpenAI API Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-3.5-turbo
   OPENAI_MAX_TOKENS=1000
   OPENAI_TEMPERATURE=0.7
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   
   # Security
   CORS_ORIGIN=http://localhost:3000
   API_SECRET_KEY=your_secret_key_here
   ```

4. **Start the application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage Guide 📖

### Optimize Mode
- Enter your existing prompt
- Select category and complexity
- Click "Optimize Prompt"
- Copy the improved, structured prompt

### Generate Mode
- Describe your requirements
- Select category and complexity
- Click "Generate Prompt"
- Get a completely new prompt

### Regenerate Mode
- Enter your prompt
- Get multiple variations
- Choose the best variation

### Copy Functionality
- **Single Copy**: Click copy button next to any prompt
- **Main Copy**: Copy the primary result
- **Keyboard Shortcut**: Ctrl/Cmd + C when results are visible

### Templates
- Click "Templates" button
- Browse by category
- Click any template to use it

## API Documentation 📚

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Optimize Prompt
```http
POST /prompts/optimize
Content-Type: application/json

{
  "prompt": "Your prompt text (10-2000 characters)",
  "type": "optimize",
  "category": "creative|technical|business|educational|general",
  "complexity": "simple|intermediate|advanced"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "original": "Original prompt",
    "optimized": "Optimized prompt text",
    "improvements": ["List of improvements"],
    "structure": {
      "context": "Context section",
      "task": "Task definition",
      "format": "Output format",
      "examples": "Examples"
    },
    "copyReady": true,
    "timestamp": "2025-10-09T20:18:11.000Z"
  }
}
```

#### Generate Prompt
```http
POST /prompts/generate
Content-Type: application/json

{
  "requirements": "Your requirements (5-500 characters)",
  "category": "creative|technical|business|educational|general",
  "complexity": "simple|intermediate|advanced"
}
```

#### Regenerate Prompt
```http
POST /prompts/regenerate
Content-Type: application/json

{
  "prompt": "Your prompt text (10-2000 characters)",
  "type": "regenerate",
  "category": "creative|technical|business|educational|general",
  "complexity": "simple|intermediate|advanced"
}
```

#### Get Templates
```http
GET /prompts/templates
```

#### Health Check
```http
GET /health
```

## Development 🛠️

### Project Structure
```
web-prompt-wizard/
├── public/                 # Frontend files
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript
│   └── index.html         # Main HTML
├── src/                   # Backend source
│   ├── middleware/        # Express middleware
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── utils/            # Utilities
├── tests/                # Test files
├── logs/                 # Log files
├── server.js             # Main server file
└── package.json          # Dependencies
```

### Scripts

```bash
# Development
npm run dev          # Start with nodemon
npm start            # Start production server

# Testing
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm run audit        # Security audit
npm run audit-fix    # Fix security issues
```

### Security 🔒

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing protection
- **Rate Limiting**: Prevents abuse
- **Input Validation**: Joi schema validation
- **Input Sanitization**: XSS prevention
- **Environment Variables**: Secure configuration

## Testing 🧪

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test tests/api.test.js
```

## License 📄

MIT License

---

**Built with ❤️ by MiniMax Agent**