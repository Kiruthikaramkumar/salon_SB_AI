# Salon AI Merged Backend (Flask Blueprint Architecture)

This project integrates the voice assistant booking agent (`agents-backend-integration-retell-ai`) and the modular MySQL backend (`agents-convert-salon-db-to-mysql`) into a single, cohesive, production-ready Flask application using a clean Blueprint architecture.

---

## 📂 Project Structure

```text
backend/
│
├── app/
│   ├── __init__.py          # App factory, extension and Blueprint registration
│   ├── config.py            # Loads configuration variables from environment
│   ├── extensions.py        # Global Flask extensions (SQLAlchemy, Celery)
│   ├── models.py            # Merged MySQL SQLAlchemy models
│   │
│   ├── api/                 # Blueprint Route Handlers
│   │   ├── admin.py         # Admin dashboard endpoints
│   │   ├── auth.py          # Admin/staff authentication (login)
│   │   ├── bookings.py      # Customer bookings (GET, POST, PUT, DELETE)
│   │   ├── calls.py         # Outbound calls & detailed call log querying
│   │   ├── customers.py     # Customers listing and creation
│   │   ├── services.py      # Salon services listing and registration
│   │   ├── stylists.py      # Stylist details and status check
│   │   └── webhooks.py      # Retell AI events/conversations & Exotel SIP/audio stream webhooks
│   │
│   ├── services/            # Business Logic Layers
│   │   ├── booking_engine.py# Business hours validation and slot conflict analysis
│   │   ├── nlp_service.py   # Intent, service keywords, and relative date extraction
│   │   ├── notification.py  # Mock notifications (SMS, Email, WhatsApp)
│   │   └── retell_service.py# Retell AI outbound calling & call details fetcher
│   │
│   ├── tasks/
│   │   └── async_tasks.py   # Background Celery tasks for transcript processing and SMS
│   │
│   └── utils/
│       ├── logger.py        # Log configuration
│       └── security.py      # X-API-Key and webhook verification middleware
│
├── requirements.txt         # Merged Python package requirements
├── .env                     # Current active credentials (MySQL, Retell, Exotel)
├── .env.example             # Environment template
└── run.py                   # Application entry point & DB tables seed script
```

---

## 🔧 Prerequisites

1. **Python 3.8+**
2. **MySQL Database Server** (make sure your instance is running and has a schema corresponding to `DB_NAME` in `.env`)
3. **Redis** (required if running background tasks with Celery)

---

## 🚀 Setup & Execution

### 1. Install Dependencies
Run the following command inside the `backend` directory:
```bash
pip install -r requirements.txt
```

### 2. Set Up Environment Variables
Create a `.env` file (copied from `.env.example`) and fill in your credentials. The project is pre-configured with:
- MySQL Server Configuration
- Retell AI Agent IDs and API Keys
- Exotel API credentials and virtual numbers
- Redis Celery Broker URLs

### 3. Run the Backend Server
Start the Flask application using:
```bash
python run.py
```
This will automatically:
- Connect to your MySQL database.
- Create all required tables (`customers`, `services`, `stylists`, `business_hours`, `bookings`, `call_logs`, `audit_logs`).
- Seed default services (Haircut, Beard Trim, Styling, etc.), default stylists (Ananya, Rahul, Priya), and default business hours (9 AM - 8 PM) if the tables are empty.
- Run on `http://localhost:3000`.

### 4. (Optional) Run the Celery Worker
To handle asynchronous voice transcripts and notifications:
```bash
celery -A run.celery worker --loglevel=info
```

---

## 📘 Interactive API Documentation

Once the server is running, you can access the interactive Swagger documentation interface at:
👉 **[http://localhost:3000/apidocs/](http://localhost:3000/apidocs/)**

---

## 🔗 Integrated Endpoints

### Auth
- `POST /api/login` - Authenticate admin/staff credentials.

### Bookings
- `GET /bookings` & `GET /api/bookings` - Get list of bookings (accepts `status` filter).
- `POST /bookings` & `POST /api/bookings` - Create a booking (accepts both SQLite customer_id/appointment_date format and MySQL customer_phone/appointment_start format).
- `PUT /bookings/<id>` & `PUT /api/bookings/<id>` - Update status or notes.
- `DELETE /bookings/<id>` & `DELETE /api/bookings/<id>` - Soft delete/cancel a booking.

### Customers
- `GET /customers` & `GET /api/customers` - Retrieve customer list.
- `POST /customers` & `POST /api/customers` - Create a new customer profile.

### Services
- `GET /services` & `GET /api/services` - Get available salon services.
- `POST /services` & `POST /api/services` - Register new salon service.

### Stylists
- `GET /stylists` & `GET /api/stylists` - Retrieve list of stylists and their availability.

### Admin
- `GET /api/admin/bookings` - Retrieve dashboard bookings listing.
- `PUT /api/admin/bookings/<id>` - Update booking status from dashboard.

### Webhooks (Exotel & Retell AI)
- `POST /exotel-sip` & `POST /api/webhooks/exotel-sip` - Route Exotel calls to Retell AI SIP URI.
- `POST /exotel-webhook` - Route Exotel calls using web audio streaming (WebSockets).
- `POST /exotel-hangup` - Log Exotel call hangup details.
- `POST /retell-event` & `POST /api/webhooks/retell-event` - Handle Retell AI lifecycle webhooks (completed call processing).
- `POST /retell-webhook` & `POST /webhook` - Conversational webhook processing (Custom LLM turns).
- `POST /retell-voice-handler` - Real-time conversational callback (transcript appending).

### Calls & Logs
- `POST /call/initiate` - Initiate outbound Retell AI call.
- `GET /call/<call_id>` - Query call details from Retell AI.
- `GET /call-logs` - Retrieve database logs of phone calls (includes filters).
- `GET /call-logs/<id>` - Retrieve detailed single call log, including full transcripts.
