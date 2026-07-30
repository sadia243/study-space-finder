# Study Space Finder

A full-stack web app that helps university students find and book available study spaces in the
library — individual desks, group rooms, quiet zones, and computer pods — and gives library staff
a dashboard to manage spaces and see usage patterns.

Built for the *Full Stack Application Development* unit (CMS22204).

## Problem statement

Students often walk between library floors looking for somewhere to study, only to find every
desk or room already taken, with no way to check availability or reserve a spot in advance. This
wastes students' time and leaves the library unable to see which spaces are actually in demand.

**Target users:** students (browse and book spaces) and library staff/admins (manage spaces,
monitor usage).

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Tailwind CSS, Recharts |
| Backend | Node.js, Express |
| Database | MongoDB, via Mongoose |
| Auth | JWT (JSON Web Tokens), bcrypt password hashing |

## Architecture

```
Browser (React SPA)
      │  REST calls (JWT in Authorization header)
      ▼
Node.js / Express API  →  /api/auth, /api/spaces, /api/bookings
      │  Mongoose queries
      ▼
MongoDB  →  users, spaces, bookings collections
```

## Core features

- **Authentication & role-based access** — JWT login/register, `student` and `admin` roles,
  protected routes on both frontend and backend.
- **Search, filter, and sort** — search spaces by name/building, filter by type and minimum
  capacity, sort by name, capacity, or newest.
- **Booking with conflict detection** — the API rejects a booking if the same space is already
  booked for an overlapping time slot.
- **Admin dashboard** — full CRUD for spaces, plus reporting: total bookings, active spaces,
  unique students who've booked, and a bar chart of the most-booked spaces.

## Project structure

```
study-space-finder/
├── backend/
│   ├── config/db.js          MongoDB connection
│   ├── models/                User, Space, Booking (Mongoose schemas)
│   ├── middleware/auth.js     JWT verification + admin-only guard
│   ├── routes/                auth, spaces, bookings route handlers
│   ├── seed.js                 populates demo data
│   └── server.js               Express app entry point
└── frontend/
    └── src/
        ├── api/client.js       axios instance, auto-attaches JWT
        ├── context/            AuthContext (global auth state)
        ├── components/          Navbar, SpaceCard, BookingModal, ProtectedRoute
        ├── pages/                Login, Register, BrowseSpaces, MyBookings, AdminDashboard
        └── App.jsx               routing
```

## Setup

### 1. Database

Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register), then get
your connection string from **Database → Connect → Drivers**.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env and paste in your MONGO_URI + a JWT_SECRET (any long random string)

npm run seed   # optional: populates demo users, spaces, and one sample booking
npm run dev    # starts the API on http://localhost:5000
```

Demo accounts created by the seed script:
- Admin: `admin@uni.ac.uk` / `password123`
- Student: `sam@uni.ac.uk` / `password123`

### 3. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev    # starts the app on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`, so both servers need to be
running at the same time.

## API endpoints

### Auth (`/api/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | – | Create an account, returns a JWT |
| POST | `/login` | – | Log in, returns a JWT |
| GET | `/me` | required | Get the logged-in user's profile |

### Spaces (`/api/spaces`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | – | List spaces. Query params: `search`, `type`, `building`, `minCapacity`, `sort` |
| GET | `/:id` | – | Get one space |
| POST | `/` | admin | Create a space |
| PUT | `/:id` | admin | Update a space |
| DELETE | `/:id` | admin | Delete a space |

### Bookings (`/api/bookings`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/mine` | required | List the logged-in user's bookings |
| POST | `/` | required | Create a booking (rejects overlapping time slots) |
| DELETE | `/:id` | required | Cancel a booking (owner or admin) |
| GET | `/admin/all` | admin | List all bookings |
| GET | `/admin/stats` | admin | Aggregate stats for the dashboard |

## Data models

**User** — `name`, `email` (unique), `password` (hashed), `role` (`student` \| `admin`)

**Space** — `name`, `building`, `floor`, `type` (`individual_desk` \| `group_room` \|
`quiet_zone` \| `computer_pod`), `capacity`, `amenities[]`, `description`, `isActive`

**Booking** — `user` (ref), `space` (ref), `date`, `startTime`, `endTime`,
`status` (`confirmed` \| `cancelled`)

## Not yet implemented (optional deliverables)

Deployment, automated tests, and Docker packaging were treated as optional per the brief and are
not included in this submission, to prioritize the mandatory core features within the project
timeline.
