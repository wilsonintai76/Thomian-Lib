
# Thomian Library: Master AI-Generation Blueprint (Updated)

## 1. Project Overview

**Name:** Thomian Library (St. Thomas Secondary School)  
**Purpose:** Professional-grade Library Information System & Multi-Floor Interactive Kiosk.  
**Environment:** Hybrid Web App (Cloud Frontend + Local Network Backend).  
**Stack:** React 19 (Frontend), Django 5 + DRF (Backend), Gemini API (AI Vision), PostgreSQL.

## 2. Technical Architecture

### Data Layer (PostgreSQL & LocalStorage)
*   **MARC21 Compliance:** Metadata stored in `JSONB` for flexibility.
*   **Map Configuration:** Multi-level JSON structure defining `MapLevel` (room details, background, kiosk position) and `ShelfDefinition` (DDC ranges, spatial coordinates).

### AI Vision Layer (Gemini Integration)
*   **Architectural Analysis:** Uses `gemini-2.5-flash-image` to analyze uploaded floor plan blueprints.
*   **Automated Mapping:** Parses architectural vectors to automatically identify shelving zones and assign logical DDC ranges (000-999) based on visual layout.

### Business Logic (The Matrix)
*   **Circulation Matrix:** Policy engine intersecting Patron Group and Material Type.
*   **Dynamic Wayfinding:** A DDC-to-Shelf routing algorithm that resolves book locations across multiple floors, auto-switching the Kiosk view to the relevant level.

## 3. User Experience (UX) Strategy

### Mode A: Student Kiosk (Wayfinding Focus)
*   **Multi-Floor Navigation:** Interactive level selector allowing students to view different rooms or floors.
*   **You Are Here (Kiosk Station):** Dynamic markers indicating the physical kiosk location relative to the collection.
*   **Contextual Highlighting:** Selecting a book triggers a "Target Shelf" glow effect on the map, providing a 2D path from the Kiosk to the asset.

### Mode B: Librarian Desk (Admin Management)
*   **Map Creator:** Dual-mode editor for (1) Defining spatial shelf zones and (2) Calibrating Kiosk station points via click-to-place interactions.
*   **Patron Hub:** Advanced directory with manual blocking/unblocking controls and bulk ZPL identity card generation.
*   **Stocktake Mode:** Real-time shelf auditing with hardware/mobile dual-input sync.

## 4. Extended Schema

*   **MapConfig:** `levels[]`, `shelves[]`, `lastUpdated`.
*   **MapLevel:** `id`, `name`, `customBackground` (Base64), `stationX`, `stationY`.
*   **ShelfDefinition:** `id`, `label`, `minDDC`, `maxDDC`, `x`, `y`, `width`, `height`, `levelId`.
*   **Patron:** `student_id`, `full_name`, `patron_group`, `is_blocked` (manual toggle), `fines`.

## 5. Hardware & AI Integration

*   **Zebra Labeling:** ZPL II generation for both 1.5" x 1" spine labels and CR80-sized Patron ID cards.
*   **AI Scan:** AI-assisted cataloging waterfall (Local -> Z39.50 -> Cloud) and AI-assisted floor plan mapping.
*   **Barcode Scanning:** Support for rapid hardware HID input and low-latency mobile camera scanning via `Html5Qrcode`.
