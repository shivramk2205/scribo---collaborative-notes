# Scribo — Real-Time Collaborative Notes System

Scribo is a full-stack real-time collaborative note-taking application designed with a premium, dark editorial visual language. Users can create secure accounts, compose notes in a distraction-free editor, have their progress saved automatically using debounced asynchronous requests, and share notes with other users for co-authoring.

---

## Key Features

1. **Secure JWT Authentication**: Secure user registration and login with passwords hashed using BCrypt. Secure endpoints are guarded by a stateless Spring Security configuration and validated on every request via a custom JSON Web Token (JWT) interceptor.
2. **Distraction-Free Editor**: A beautiful, typography-focused writing view optimized for editorial note capture.
3. **Real-Time Asynchronous Auto-Save**: Dynamic auto-saving using client-side input debouncing. Typing events trigger an auto-save API call exactly 2 seconds after typing inactivity. A live save badge displays the current save status: `● Unsaved` → `↻ Saving...` → `✓ Saved` (with timestamp) or `✗ Failed`.
4. **Granular Collaboration & Sharing**: Owner-controlled sharing policies. Owners can share notes by searching for collaborators' usernames, view active collaborators, and revoke editing access at any time.
5. **Cookie-Persistent User Flow**: Remembers the last note the user was editing using a secure cookie (`last_note`). On subsequent logins, the dashboard renders a quick link banner allowing the user to seamlessly resume where they left off.

---

## Technology Stack

### Backend
- **Framework**: Spring Boot 2.7.18
- **Language**: Java 11
- **Security**: Spring Security 5.x + JJWT (JSON Web Token)
- **Data Access**: Spring Data JPA + Hibernate
- **Database**: MySQL (default) / H2 In-Memory (offline testing)

### Frontend
- **Framework**: React 18 (Vite SPA)
- **Styling**: Vanilla CSS (Premium Dark Editorial Theme)
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with Request Interceptor for JWT Header injection

---

## Database Design

The relational schema maps out user data and notes access using three SQL tables:

### 1. `users`
Represents registered users.
- `id` (BIGINT, Primary Key, Auto-Increment)
- `username` (VARCHAR, Unique, Not Null)
- `password` (VARCHAR, Not Null, BCrypt Hashed)

### 2. `notes`
Stores the note content, title, owner, and modification timestamps.
- `id` (BIGINT, Primary Key, Auto-Increment)
- `title` (VARCHAR)
- `content` (TEXT)
- `owner_id` (BIGINT, Foreign Key referencing `users(id)`)
- `last_updated` (TIMESTAMP, Managed by Hibernate `@UpdateTimestamp`)

### 3. `shared_notes`
Junction table mapping sharing permissions between notes and co-authoring users.
- `id` (BIGINT, Primary Key, Auto-Increment)
- `note_id` (BIGINT, Foreign Key referencing `notes(id)`)
- `shared_user_id` (BIGINT, Foreign Key referencing `users(id)`)

---

## Setup & Running the Application

### 1. Backend Setup

You can run the backend using either **MySQL** (default) or **H2** (embedded database, no installation required).

#### Configuration (Select Database)
Open `backend/src/main/resources/application.properties`:

- **To run with H2 (Recommended for zero-install testing)**:
  Comment out the MySQL properties and uncomment the H2 lines:
  ```properties
  spring.datasource.url=jdbc:h2:mem:scribodb;DB_CLOSE_DELAY=-1
  spring.datasource.driverClassName=org.h2.Driver
  spring.datasource.username=sa
  spring.datasource.password=
  spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
  spring.h2.console.enabled=true
  ```

- **To run with MySQL**:
  Ensure a MySQL instance is running locally on port `3306`. The application properties are preset to auto-create a database named `scribo` on startup:
  ```properties
  spring.datasource.url=jdbc:mysql://localhost:3306/scribo?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
  spring.datasource.username=root
  spring.datasource.password=your_mysql_password
  ```

#### Running the Backend
From the `backend/` directory, execute:
```bash
./mvnw spring-boot:run
```
The REST API will launch on `http://localhost:8080`.

---

### 2. Frontend Setup

From the `frontend/` directory, install packages and start the Vite dev server:

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

The web client will load on `http://localhost:5173`. Open this URL in your browser to interact with the system.

---

## Monorepo Project Structure

```text
├── backend/
│   ├── src/main/java/com/scribo/
│   │   ├── model/                  # User, Note, SharedNote JPA entities
│   │   ├── repository/             # UserRepository, NoteRepository, SharedNoteRepository
│   │   ├── security/               # JwtUtil, JwtRequestFilter, SecurityConfig (Web Security)
│   │   └── controller/             # AuthController, NoteController (REST API)
│   │   └── ScriboApplication.java  # Main App Class
│   ├── src/main/resources/
│   │   └── application.properties  # Database, Server & JWT settings
│   └── pom.xml                     # Maven project specifications (Java 11)
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js            # Axios client with JWT request interceptors
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Login view
│   │   │   ├── Register.jsx        # Registration view
│   │   │   ├── Dashboard.jsx       # Notes dashboard & "last opened note" loader
│   │   │   ├── Editor.jsx          # Live note editor with 2-second debounced auto-save
│   │   │   └── Share.jsx           # Share controller & collaborators board
│   │   ├── App.jsx                 # Routing configuration
│   │   ├── index.css               # Vanilla CSS variables, animations, and design tokens
│   │   └── main.jsx                # SPA entry mounting point
│   ├── index.html                  # HTML entry point (SEO metadata + fonts)
│   └── package.json                # Frontend dependencies configuration
└── README.md                       # Documentation and Setup instructions
```
