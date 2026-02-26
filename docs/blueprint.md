
# Thomian Library: Master AI-Generation Blueprint

## 1. Project Overview
**Name:** Thomian Library (St. Thomas Secondary School)  
**Purpose:** Professional-grade Library Information System (ILS) with Wayfinding Kiosk.

## 2. Technical Architecture
### Professional Cataloging (MARC-Lite)
*   **Biblio vs Holdings:** Differentiates between bibliographic metadata (Title, Series) and item-level data (Barcode, Value).
*   **Financial Integration:** Every book has a `value` (Replacement Cost) which feeds the automated "Assess Loss" logic.

## 4. Extended Schema (Updated)
*   **Book:** `id`, `title`, `author`, `isbn`, `ddc_code`, `call_number`, `barcode_id`, `shelf_location`, `status`, `value` (Price), `series`, `edition`, `language`, `pages`, `vendor`, `acquisition_date`, `summary`, `publisher`, `pub_year`, `format`, `material_type`, `loan_count`, `created_at`, `cover_url`.
*   **Patron:** `student_id`, `full_name`, `patron_group`, `class_name`, `email`, `phone`, `is_blocked`, `fines`, `is_archived`, `photo_url`, `pin`.
*   **Transaction:** `id`, `patron_id`, `amount`, `type` (FINE_PAYMENT, REPLACEMENT, etc), `method`, `timestamp`, `librarian_id` (Audit trail).

## 5. Recent Feature Additions
*   **Librarian Command Dashboard:** A central "Mission Control" for staff with real-time KPIs, system health monitoring, and a live circulation stream.
*   **Undo Functionality:** Temporary rollback option for critical actions like deleting a book or patron.
*   **Book Summaries:** Added `summary` field to Book type, displayed in Kiosk search results and BookPosterCard.
*   **Registration Slip:** Auto-generated Patron ID and printable registration slip with ID and PIN upon patron registration.
*   **Profile Management:** Patrons can update their PIN via the ProfileEditModal in the Kiosk.
*   **Role-Based Access:** Support for Administrator and Librarian roles with filtered access to system settings.

## 6. Professional Standards
*   **Koha Compliance:** Alignment with standard ILS fields for future migration.
*   **Zebra Labeling:** 300dpi ZPL streams for 1.5x1 spine labels and CR80 PVC identity cards.
