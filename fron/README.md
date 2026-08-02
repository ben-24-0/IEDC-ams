# FISAT AMS - Build Log

## Stack Decisions
- DB: PostgreSQL (relational fits FK/unique constraints in doc)
- ORM: Prisma
- Backend: Node + Express
- Frontend: React + Vite
- Learning mode: user codes, Claude teaches + reviews, "pass" = Claude writes it

## Build Order
1. [ ] Prisma schema (students, attendance_logs, admin_users)
2. [ ] Prisma migrate + generate client
3. [ ] Express server skeleton (server.js, db.js)
4. [ ] Student CRUD routes
5. [ ] Auth (JWT, admin login)
6. [ ] Attendance routes (today, bulk sync)
7. [ ] MQTT listener (scan/sync/response/command topics)
8. [ ] React dashboard - live view
9. [ ] React student mgmt CRUD
10. [ ] React device mgmt panel (wifi push)
11. [ ] Export module (csv/pdf)

## Current Step
Not started - about to write prisma/schema.prisma

## Key Concepts Covered
- PK/FK basics (introduced, not yet applied)
- ORM tradeoffs (mongo vs postgres, sync via prisma)

## Decisions Log
- Chose postgres over mongo: relational data, FK integrity > raw scale
- Chose Prisma: speed + still teaches schema thinking

## Notes / Gotchas
(empty - fill as we hit issues)

fisat-ams/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # db models
│   ├── src/
│   │   ├── routes/
│   │   │   ├── students.js
│   │   │   ├── attendance.js
│   │   │   └── auth.js
│   │   ├── controllers/
│   │   │   ├── studentController.js
│   │   │   ├── attendanceController.js
│   │   │   └── authController.js
│   │   ├── mqtt/
│   │   │   └── listener.js     # esp32 bridge, later
│   │   ├── middleware/
│   │   │   └── auth.js         # jwt check
│   │   ├── db.js               # prisma client init
│   │   └── server.js           # express app entry
│   ├── .env                    # DATABASE_URL, JWT_SECRET
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Students.jsx
│   │   │   └── Login.jsx
│   │   ├── components/
│   │   ├── api/
│   │   │   └── client.js       # axios/fetch wrapper
│   │   └── App.jsx
│   └── package.json
└── README.md                   # our shared memory

# FISAT Attendance System (AMS) v1.5
## Backend, Database, and Web Server Requirements Document

### 1. System Architecture Overview
The AMS v1.5 relies on a distributed IoT architecture. The ESP32 edge node handles hardware interfacing (RFID, LEDs) and local WiFi management, while the backend stack assumes all responsibilities for data validation, user management, and long-term storage. 

**The stack consists of four primary components:**
1. **MQTT Broker:** The real-time messaging layer.
2. **Backend Application Server:** The logic engine bridging MQTT and the database.
3. **Database:** The persistent storage layer.
4. **Web Dashboard:** The frontend GUI for administrators and faculty.

---

### 2. MQTT Broker Requirements
The broker is responsible for maintaining persistent TCP connections with the ESP32 nodes and routing telemetry.

* **Recommended Tech:** Eclipse Mosquitto or EMQX.
* **Ports:** 1883 (Standard TCP), 8883 (TLS/SSL - Recommended for production).
* **QoS (Quality of Service):** * QoS 0 (At most once) is sufficient for live scans.
  * QoS 1 (At least once) should be used for the `fisat/ams/sync` topic to ensure offline cached scans are not lost.
* **Topics to Support:**
  * `fisat/ams/scan`: Incoming real-time RFID UIDs.
  * `fisat/ams/sync`: Incoming bulk UIDs from offline caches.
  * `fisat/ams/response`: Outgoing validation status (`ACCEPTED`, `REJECTED`, `DUPLICATE`).
  * `fisat/ams/command`: Outgoing remote commands (e.g., `ADD_WIFI:ssid:pass`).

---

### 3. Database Architecture
A relational database is highly recommended due to the structured nature of students, classes, and attendance logs. 

* **Recommended Tech:** PostgreSQL, MySQL, or SQLite (for early development).
* **Core Tables & Schema Requirements:**

  **Table: Students**
  * `id` (Primary Key, UUID/Int)
  * `roll_number` (String, Unique)
  * `name` (String)
  * `rfid_uid` (String, Unique, Indexed for fast lookups)
  * `is_active` (Boolean)

  **Table: Attendance_Logs**
  * `log_id` (Primary Key)
  * `student_id` (Foreign Key referencing Students)
  * `scan_timestamp` (DateTime)
  * `status` (Enum: 'PRESENT', 'LATE')
  * *Note: Must support bulk inserts for when the ESP32 dumps its offline RAM cache.*

  **Table: Admin_Users**
  * `admin_id` (Primary Key)
  * `username` (String)
  * `password_hash` (String, bcrypt/argon2)
  * `rfid_uid` (String, Optional for physical admin cards)

---

### 4. Backend Application Server Requirements
The backend server acts as the "brain." It must simultaneously run an MQTT client to listen to the ESP32 and an HTTP/REST server to serve the frontend dashboard.

* **Recommended Tech:** Node.js (Express + MQTT.js) or Python (Flask/FastAPI + Paho-MQTT).
* **Core Responsibilities:**
  1. **MQTT Listener Service:** * Subscribe to `fisat/ams/scan`.
     * Upon receiving a UID, instantly query the database.
     * Within <50ms, publish the result (`UID:ACCEPTED`, `UID:REJECTED`, or `UID:DUPLICATE`) back to `fisat/ams/response`.
  2. **Offline Sync Handler:**
     * Subscribe to `fisat/ams/sync`.
     * Parse incoming historical timestamps/UIDs and execute bulk SQL inserts.
  3. **REST API:**
     * `GET /api/students`: Fetch all registered students.
     * `POST /api/students`: Register a new student/RFID pair.
     * `GET /api/attendance/today`: Fetch today's live attendance list.
     * `POST /api/device/command`: Trigger MQTT commands (e.g., Add WiFi).

---

### 5. Web Dashboard (Frontend) Requirements
The web interface allows faculty to manage the system without touching the hardware.

* **Recommended Tech:** React, Vue.js, or plain HTML/CSS/JS with Bootstrap/Tailwind.
* **Core Views / Features:**
  * **Live Dashboard:** A real-time view that updates automatically (via WebSockets or Server-Sent Events) as students scan their cards.
  * **Student Management:** A CRUD (Create, Read, Update, Delete) interface to tie physical RFID UIDs to student Roll Numbers.
  * **Device Management Panel:** * Input fields for `SSID` and `Password`.
    * A "Push to Device" button that triggers the backend to publish `ADD_WIFI:ssid:pass` to the `fisat/ams/command` MQTT topic.
  * **Export Module:** Generate and download `.csv` or `.pdf` reports of absentees/attendees for specific date ranges.

---

### 6. Deployment & Infrastructure Notes
* **Network Latency:** To maintain the <300ms response time required for the ESP32's LED animations to feel natural, the server should be geographically close to the device, or ideally hosted on the same Local Area Network (LAN).
* **Security:** * MQTT traffic over the internet should be encrypted via MQTTS (Port 8883).
  * The Web Dashboard must be protected by standard authentication (JWT or session cookies) to prevent unauthorized UID assignments or WiFi command injections.