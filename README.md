# just_store_anything
Java version of DvorakDwarf's  Infinite-Storage-Glitch with frontned


> [!NOTE]  
> If your uploaded file is too small ( < 10 MB ) then youtube might discard that video due to video length is less then 1s.

# Setup
follow [Requirements](docs/requirments.md) for setup.

## Core Flow
```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant E as Encryption Module
    participant B as Binary Converter
    participant V as Frame Generator & Video Combiner
    participant Y as YouTube API
    participant DB as PostgreSQL

    Note over C,DB: Upload Flow
    C->>S: Send File + Secret Key + Metadata
    S->>E: Send File + Secret Key
    E->>S: Return Encrypted File
    S->>B: Send Encrypted File
    B->>V: Stream Binary String
    V->>S: Return Video File
    S->>Y: Upload Video
    Y->>S: Return YT Response Data
    S->>DB: Store YT Response + File Details
    S->>C: Return Metadata Confirmation

    Note over C,DB: Retrieval Flow
    C->>S: Request File (with Metadata/ID)
    S->>DB: Query Stored Data
    DB->>S: Return YT Video ID & Details
    S->>Y: Request Video
    Y->>S: Return Video File
    S->>B: Convert Video to Binary
    B->>S: Return Binary Stream
    S->>E: Decrypt with Secret Key
    E->>S: Return Original File
    S->>C: Send Original File
```


## What implemented

### Frontend
- [x] YouTube access
- [x] Main page (file upload, other data)
- [x] Backend connectivity
- [x] retriever page

### Backend
- [ ] Encryption module
- [x] file to binary string
- [x] BS to image
- [x] images  to video
- [x] user oauth from Google for YouTube
- [x] YouTube upload
- [x] Database config and storing
- [x] retriever file base on metadata


- [ ] Clean code
- [ ] Better Examples
- [ ] All edge cases 
- [ ] Security
- [ ] Optimization (Threads)
- [ ] Improved UI


> [!NOTE]
> This project is **not intended for production use**. It is designed to run locally only.

> [!WARNING]
> **Security Risk:** This application is designed for single-user use and lacks authentication after YouTube authorization. Once you connect your YouTube account from any browser, the access token is stored in the database. This means that **anyone who can access your database** (including users on the same system or from different browsers/private tabs) can:
> - Access all your stored files
> - Obtain your YouTube access tokens
> - Perform actions on your YouTube account
> 
> **Only use this application in a trusted, local environment.**