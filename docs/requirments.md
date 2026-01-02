# Just Store - Setup Requirements

## Project Overview

**Just Store** is a Java-based implementation of the Infinite-Storage-Glitch concept with a modern React frontend. It allows users to store files by encoding them into videos and uploading them to YouTube, then retrieve them later by decoding the videos.

### Technology Stack

**Backend:**
- Java 25
- Spring Boot 4.0.1
- PostgreSQL Database
- Spring Data JPA
- YouTube Data API v3
- Maven for dependency management

**Frontend:**
- React 19.2.0
- TypeScript
- Vite 7.2.4
- Redux Toolkit for state management
- TailwindCSS 4.1.18 for styling
- Axios for API calls
- React Router for navigation

---

## Prerequisites

Before setting up the project, ensure you have the following installed:

### Required Software

1. **Java Development Kit (JDK) 25 or higher**
   - Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or use OpenJDK
   - Verify installation: `java -version`

2. **Maven 3.6+**
   - Download from [Apache Maven](https://maven.apache.org/download.cgi)
   - Verify installation: `mvn -version`

3. **Node.js 18+ and npm**
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node -v` and `npm -v`

4. **PostgreSQL 12+**
   - Download from [postgresql.org](https://www.postgresql.org/download/)
   - Create a database named `just_store_db` (or your preferred name)
   - Note your database credentials

5. **yt-dlp**
   - Install from [yt-dlp GitHub](https://github.com/yt-dlp/yt-dlp)
   - **Linux/Mac:** `brew install yt-dlp` or download binary
   - **Windows:** Download executable and add to PATH environment variable
   - Verify installation: `yt-dlp --version`

---

## Environment Configuration

### Server Environment Setup

1. **Navigate to the server directory:**
   ```bash
   cd server
   ```

2. **Create `.env` file from example:**
   ```bash
   cp .env.example .env
   ```

3. **Configure the following variables in `server/.env`:**

   ```env
   # Database Configuration
   SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/just_store_db
   SPRING_DATASOURCE_USERNAME=postgres
   SPRING_DATASOURCE_PASSWORD=your-database-password
   
   # CORS Configuration
   ALLOWED_ORIGINS=http://localhost:5173
   
   # Application URLs
   APP_BASE_URL=http://localhost:8080
   APP_FRONTEND_URL=http://localhost:5173
   
   # YouTube OAuth Configuration
   YOUTUBE_CLIENT_SECRET_FILE=your_client_secret_file.apps.googleusercontent.com.json
   
   # yt-dlp Path
   YT_DLP_PATH=/path/to/yt-dlp
   ```

   **Variable Descriptions:**
   
   - `SPRING_DATASOURCE_URL`: PostgreSQL connection URL (change database name if needed)
   - `SPRING_DATASOURCE_USERNAME`: PostgreSQL username
   - `SPRING_DATASOURCE_PASSWORD`: PostgreSQL password
   - `ALLOWED_ORIGINS`: Frontend URL for CORS (change if running on different port)
   - `APP_BASE_URL`: Backend server URL
   - `APP_FRONTEND_URL`: Frontend application URL
   - `YOUTUBE_CLIENT_SECRET_FILE`: Name of the OAuth client secret JSON file (see **Google OAuth Setup** section below)
   - `YT_DLP_PATH`: Full path to yt-dlp executable
     - Linux/Mac example: `/home/linuxbrew/.linuxbrew/bin/yt-dlp` or `/usr/local/bin/yt-dlp`
     - Windows example: `C:\Program Files\yt-dlp\yt-dlp.exe`

### Client Environment Setup

1. **Navigate to the client directory:**
   ```bash
   cd client
   ```

2. **Create `.env` file from example:**
   ```bash
   cp .env.example .env
   ```

3. **Configure the following variable in `client/.env`:**

   ```env
   VITE_API_URL=http://localhost:8080
   ```

   **Variable Description:**
   
   - `VITE_API_URL`: Backend API base URL (change if backend runs on different port)

---

## Google OAuth Setup for YouTube API

To enable YouTube video uploads, you need to set up Google OAuth credentials:

### Step-by-Step Guide

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**

2. **Create a New Project:**
   - Click "Select a project" → "New Project"
   - Name it `justStore` (or any name you prefer)
   - Click "Create"

3. **Enable YouTube Data API v3:**
   - Navigate to "APIs & Services" → "Library"
   - Search for "YouTube Data API v3"
   - Click on it and press "Enable"

4. **Configure OAuth Consent Screen:**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Select "External" user type (or "Internal" if using Google Workspace)
   - Fill in required fields:
     - App name: `justStore`
     - User support email: your email
     - Developer contact: your email
   - Add scopes: `https://www.googleapis.com/auth/youtube.upload`
   - Save and continue
   - **Important:** Go to "Test users" section and click "+ ADD USERS"
   - Add your YouTube account email address as a test user
   - This allows you to use the app while it's in testing mode

5. **Create OAuth Client Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - Application type: "Web application"
   - Name: `justStore Web Client`
   - **Authorized JavaScript origins:**
     - `http://localhost:5173` (frontend)
     - `http://localhost:8080` (backend)
   - **Authorized redirect URIs:**
     - `http://localhost:8080/auth/youtube/callback`
   - Click "Create"

6. **Download Client Secret:**
   - Click the download icon (⬇) next to your newly created OAuth client
   - Save the JSON file to `server/src/main/resources/`
   - **Keep the original filename** (e.g., `client_secret_123456.apps.googleusercontent.com.json`)
   - Update `YOUTUBE_CLIENT_SECRET_FILE` in `server/.env` with this exact filename

**Important Notes:**
- If you change the frontend or backend port, update the allowed origins and redirect URI accordingly
- The redirect URI must match exactly: `http://localhost:8080/auth/youtube/callback`
- Keep your client secret file secure and never commit it to version control

---

## Installation & Running

### Backend (Server)

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies and build:**
   ```bash
   mvn clean install
   ```

3. **Run the application:**
   ```bash
   mvn spring-boot:run
   ```

   The server will start on `http://localhost:8080`

### Frontend (Client)

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Run development server:**
   ```bash
   yarn dev
   ```

   The client will start on `http://localhost:5173`


---

## Database Configuration

### Using PostgreSQL (Default)

The project is configured to use PostgreSQL by default. Ensure:
- PostgreSQL is running
- Database `just_store_db` exists (or create it: `CREATE DATABASE just_store_db;`)
- Credentials in `server/.env` are correct

### Using Another Database

If you want to use a different database (MySQL, MariaDB, etc.):

1. Update `server/pom.xml` - replace PostgreSQL dependency:
   ```xml
   <!-- Remove or comment out -->
   <dependency>
       <groupId>org.postgresql</groupId>
       <artifactId>postgresql</artifactId>
       <scope>runtime</scope>
   </dependency>
   
   <!-- Add your database driver, e.g., MySQL -->
   <dependency>
       <groupId>com.mysql</groupId>
       <artifactId>mysql-connector-j</artifactId>
       <scope>runtime</scope>
   </dependency>
   ```

2. Update `SPRING_DATASOURCE_URL` in `server/.env`:
   ```env
   # MySQL example
   SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/just_store_db
   ```

---

## Troubleshooting

### Common Issues

**1. Database Connection Failed:**
- Verify PostgreSQL is running: `sudo systemctl status postgresql` (Linux) or check Services (Windows)
- Check database exists: `psql -U postgres -l`
- Verify credentials in `.env`

**2. YouTube OAuth Error:**
- Ensure OAuth client secret file is in `server/src/main/resources/`
- Verify filename matches `YOUTUBE_CLIENT_SECRET_FILE` in `.env`
- Check redirect URI matches exactly in Google Cloud Console

**3. yt-dlp Not Found:**
- Verify installation: `yt-dlp --version`
- Check path in `YT_DLP_PATH` environment variable
- Windows: Ensure yt-dlp is in system PATH

**4. CORS Errors:**
- Verify `ALLOWED_ORIGINS` in `server/.env` matches frontend URL
- Check `VITE_API_URL` in `client/.env` matches backend URL

**5. Port Already in Use:**
- Backend (8080): Change in `server/src/main/resources/application.properties`
- Frontend (5173): Vite will automatically use next available port

---

## Project Structure

```
just_store/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store & slices
│   │   └── App.tsx        # Main app component
│   ├── .env.example       # Client environment template
│   └── package.json       # Frontend dependencies
│
├── server/                # Spring Boot backend
│   ├── src/main/
│   │   ├── java/          # Java source code
│   │   └── resources/     # Configuration & OAuth files
│   ├── .env.example       # Server environment template
│   └── pom.xml            # Maven dependencies
│
└── docs/                  # Documentation
    └── requirements.md    # This file
```

---

## Now Enjoy Just Store :)

> [!NOTE]  
> If your uploaded file is too small ( < 10 MB ) then youtube might discard that video due to video length is less then 1s.

After successful setup:
1. Access the application at `http://localhost:5173`
2. Authenticate with Google/YouTube
3. Upload a file to test the encoding and upload process
4. Retrieve the file to verify the complete workflow

For more information, see the main [README.md](../README.md)
