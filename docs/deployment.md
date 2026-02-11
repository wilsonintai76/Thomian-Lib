
# Thomian Library System - Deployment Guide (Updated)

## 1. The "Hybrid Single-App" Strategy

-   **Frontend:** Serves the Kiosk UI and Admin Dashboard via a secure HTTPS domain (required for camera/AI features).
-   **Backend:** Local server handles heavy database operations and direct socket communication with Zebra printers.
-   **AI Integration:** Communication with Google Gemini requires the `process.env.API_KEY` to be configured in the execution environment.

---

## 2. Frontend Configuration

### AI Vision Support
To enable the "AI Auto-Map" and blueprint analysis features:
1.  Ensure an API Key from Google AI Studio is provided.
2.  The application expects this via the standard `API_KEY` environment variable.

### HTTPS Requirement
The **Mobile Scanner** and **AI Vision Uploads** strictly require a Secure Context (HTTPS). 
-   **Local Development:** Use `mkcert` or access via `localhost`.
-   **Production:** Use a Cloudflare Tunnel or an SSL-certified Nginx reverse proxy.

---

## 3. Hardware Configuration

### Zebra Printer Setup (Labels & Cards)
The system generates two types of ZPL streams:
1.  **Spine Labels:** Optimized for 1.5" x 1" continuous or die-cut labels.
2.  **Patron IDs:** Optimized for CR80 standard PVC cards (3.375" x 2.125").

**Printer Connection:**
-   Ensure the printer is reachable on the local network.
-   Port: **9100** (Raw TCP/IP).
-   Set a Static IP to ensure the Backend `services.py` can consistently route print jobs.

### Barcode Scanners (Kiosk & Desk)
-   **Config:** HID Keyboard Emulation mode.
-   **Suffix:** Ensure the scanner sends a Carriage Return (`CR` / `\n`) after every scan.
-   **Inter-Character Delay:** Minimal (0ms) to ensure the high-speed listeners catch the full string.

## 4. Multi-Floor Map Deployment
When deploying a new library room:
1.  Upload a high-resolution JPG/PNG blueprint in the **Map Layout** tab.
2.  Use **AI Auto-Map** to detect potential shelving zones.
3.  Manually calibrate the **Kiosk Station** by entering "Set Kiosk" mode and clicking the map at the physical kiosk's location.
4.  **Save** to sync the spatial configuration to the Thomian Cloud.
