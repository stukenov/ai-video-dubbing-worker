# AI Video Dubbing Worker

An AI-powered video dubbing service featuring a Node.js web interface and Python-based video processing worker. The system provides multi-language video dubbing capabilities with user management and admin controls.

## Features

- **Web Interface**: Express.js-based web application with EJS templates
- **Video Upload & Management**: Secure video upload with user-specific storage
- **Multi-Language Support**: Dubbing for 10+ languages including Russian, English, Spanish, French, German, Italian, Portuguese, Japanese, Korean, and Chinese
- **User Management**: PIN-based authentication system with admin controls
- **Python Worker**: GPU-accelerated video processing using CUDA
- **Session Management**: Secure session handling with brute-force protection
- **Admin Panel**: User creation, access code management, and analytics

## Tech Stack

### Web Application
- **Backend**: Node.js, Express.js
- **Template Engine**: EJS
- **Session**: express-session
- **File Upload**: Multer
- **Environment**: dotenv

### Worker
- **Language**: Python 3
- **Deep Learning**: PyTorch, Lightning
- **Audio Processing**: librosa, pydub, demucs
- **Video Processing**: moviepy, opencv-python
- **Speech**: whisperx (transcription), edge-tts (synthesis)
- **Translation**: Various translation models
- **Container**: Docker with CUDA support

## Prerequisites

### For Web Application
- Node.js 14+
- npm or yarn

### For Worker
- Python 3.8+
- CUDA-capable GPU (for optimal performance)
- Docker (optional, for containerized deployment)

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/stukenov/ai-video-dubbing-worker.git
cd ai-video-dubbing-worker
```

### 2. Web Application Setup

```bash
cd web
cp ../.env.example .env
```

Edit `.env` and configure:
```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=your_random_session_secret
ADMIN_PIN=your_admin_pin
```

Install dependencies:
```bash
npm install
```

Start the server:
```bash
npm start
```

The web interface will be available at `http://localhost:3000`

### 3. Worker Setup

#### Option A: Local Installation

```bash
pip install -r requirements.txt
python my_worker.py
```

#### Option B: Docker

```bash
docker build -t ai-dubbing-worker .
docker run --gpus all -e MODEL_URL=your_model_url ai-dubbing-worker
```

## Project Structure

```
.
├── web/                      # Web application
│   ├── config/              # Configuration files
│   ├── middleware/          # Express middleware
│   ├── routes/              # Route handlers
│   ├── utils/               # Utility functions
│   ├── views/               # EJS templates
│   ├── public/              # Static assets
│   ├── storage/             # File storage
│   │   ├── uploads/         # Video uploads
│   │   └── data/            # User data
│   ├── index.js             # Main application
│   └── package.json         # Dependencies
├── my_worker.py             # Python worker (stub)
├── requirements.txt         # Python dependencies
├── Dockerfile              # Docker configuration
├── .env.example            # Environment template
└── README.md               # This file
```

## Usage

### User Authentication
1. Navigate to the web interface
2. Enter your PIN code to log in
3. Admin users can access the admin panel

### Video Upload
1. Log in with your PIN
2. Select a video file
3. Choose target language
4. Submit for processing

### Admin Functions
- Create new user access codes
- View all registered users
- Monitor system usage

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Web server port | 3000 |
| `NODE_ENV` | Environment (development/production) | development |
| `SESSION_SECRET` | Secret for session encryption | (required) |
| `ADMIN_PIN` | Admin access PIN | 5128 |
| `MODEL_URL` | AI model URL for worker | (required) |

## Security Features

- PIN-based authentication
- Session management with secure cookies
- Brute-force protection middleware
- User-isolated file storage
- Admin-only routes protection

## Supported Languages

- Russian (ru)
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Japanese (ja)
- Korean (ko)
- Chinese (zh)

## Development

### Running in Development Mode

```bash
cd web
npm run dev
```

### Adding New Languages

Edit `web/config/constants.js` and add to the `languageNames` object:

```javascript
languageNames: {
    'your_lang_code': 'Language Name',
    // ...
}
```

## Docker Deployment

The worker includes a Dockerfile for GPU-accelerated deployment:

```bash
docker build --build-arg MODEL_URL=your_model_url -t ai-dubbing-worker .
docker run --gpus all \
  -e PORT=3000 \
  -e SESSION_SECRET=your_secret \
  -e ADMIN_PIN=your_pin \
  -p 3000:3000 \
  ai-dubbing-worker
```

## Performance

The Python worker leverages:
- CUDA 11.6+ for GPU acceleration
- cuDNN 8+ for deep learning optimization
- Multiple audio/video processing libraries for high-quality output

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

Saken Tukenov

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Notes

- The current `my_worker.py` is a stub implementation. Integrate your actual video processing logic here.
- Ensure storage directories have appropriate permissions for file uploads.
- For production deployment, use HTTPS and set `NODE_ENV=production`.
