
# Thomian Library System - Deployment Guide (Updated)

## 1. The "Hybrid Single-App" Strategy

-   **Frontend:** Serves the Kiosk UI and Admin Dashboard via a secure HTTPS domain (required for camera/AI features).
-   **Backend:** Local server handles heavy database operations and direct socket communication with Zebra printers.
-   **AI Integration:** Communication with Google Gemini requires the `process.env.API_KEY` to be configured in the execution environment.

---

## 2. Enterprise Self-Hosting (Recommended)

This stack uses **Nginx** as the traffic controller, serving the React frontend instantly while routing API requests to Django.

**Stack:**
*   **Web Server:** Nginx
*   **App Server:** Gunicorn (Django)
*   **Database:** PostgreSQL
*   **Security/DNS:** Cloudflare

### Nginx Configuration (`/etc/nginx/sites-available/thomian`)

```nginx
server {
    server_name library.stthomas.edu; # Your Cloudflare Domain

    # FRONTEND: Serve React Static Files
    location / {
        root /var/www/thomian-library/dist;
        try_files $uri $uri/ /index.html; # SPA Routing
        expires 1h;
    }

    # BACKEND: Proxy API to Django/Gunicorn
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # STATIC: Django Admin/Rest Framework Assets
    location /static/ {
        alias /var/www/thomian-library/backend/staticfiles/;
    }
}
```

### Environment Variables (`.env`)
For a **Desktop/On-Premise** deployment, use Local Storage (default). This is faster and works without internet.

```bash
# Core Configuration
ALLOWED_HOSTS=library.stthomas.edu,localhost
CSRF_TRUSTED_ORIGINS=https://library.stthomas.edu
DB_NAME=thomian_db
DB_USER=postgres
DB_PASSWORD=secret

# Optional: Cloudflare R2 (Only if you want off-site storage)
# Leave USE_S3=False to use the local hard drive for images/assets.
USE_S3=False
```

### Default Credentials (Mock/Demo)
The system includes two pre-configured accounts for initial access:
- **Administrator:** `admin` / `admin123`
- **Librarian:** `librarian` / `lib123`

### Data Backup (Crucial)
Since you are using **Local Storage**, all book covers and patron photos live in the `/media` folder on your desktop.
**Recommendation:** Set up a nightly cron job to sync this folder to Google Drive or a USB drive.

---

## 3. Frontend Configuration

### AI Vision Support
To enable the "AI Auto-Map" and blueprint analysis features:
1.  Ensure an API Key from Google AI Studio is provided.
2.  The application expects this via the standard `API_KEY` environment variable.

### HTTPS Requirement
The **Mobile Scanner** and **AI Vision Uploads** strictly require a Secure Context (HTTPS). 
-   **Local Development:** Use `mkcert` or access via `localhost`.
-   **Production:** Use a Cloudflare Tunnel or an SSL-certified Nginx reverse proxy.

---

## 4. Hardware Configuration

### Zebra Printer Setup (Labels & Cards & Slips)
The system generates three types of print streams:
1.  **Spine Labels:** Optimized for 1.5" x 1" continuous or die-cut labels.
2.  **Patron IDs:** Optimized for CR80 standard PVC cards (3.375" x 2.125").
3.  **Registration Slips:** Standard receipt printer format for initial patron registration (includes ID and generated PIN).

**Printer Connection:**
-   Ensure the printer is reachable on the local network.
-   Port: **9100** (Raw TCP/IP).
-   Set a Static IP to ensure the Backend `services.py` can consistently route print jobs.

### Barcode Scanners (Kiosk & Desk)
-   **Config:** HID Keyboard Emulation mode.
-   **Suffix:** Ensure the scanner sends a Carriage Return (`CR` / `\n`) after every scan.
-   **Inter-Character Delay:** Minimal (0ms) to ensure the high-speed listeners catch the full string.
