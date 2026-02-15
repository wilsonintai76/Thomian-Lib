
# Thomian Library: Master AI-Generation Blueprint

## 1. Project Overview
**Name:** Thomian Library (St. Thomas Secondary School)  
**Purpose:** Professional-grade Library Information System (ILS) with Wayfinding Kiosk.

## 2. Technical Architecture
### Professional Cataloging (MARC-Lite)
*   **Biblio vs Holdings:** Differentiates between bibliographic metadata (Title, Series) and item-level data (Barcode, Value).
*   **Financial Integration:** Every book has a `value` (Replacement Cost) which feeds the automated "Assess Loss" logic.

## 4. Extended Schema (Updated)
*   **Book:** `id`, `title`, `author`, `isbn`, `ddc_code`, `call_number`, `barcode_id`, `shelf_location`, `status`, `value` (Price), `series`, `edition`, `language`, `pages`, `vendor`, `acquisition_date`, `summary`.
*   **Patron:** `student_id`, `full_name`, `patron_group`, `class_name`, `email`, `phone`, `is_blocked`, `fines`.
*   **Transaction:** `id`, `patron_id`, `amount`, `type` (FINE_PAYMENT, REPLACEMENT, etc), `method`, `timestamp`, `librarian_id` (Audit trail).

## 5. Professional Standards
*   **Koha Compliance:** Alignment with standard ILS fields for future migration.
*   **Zebra Labeling:** 300dpi ZPL streams for 1.5x1 spine labels and CR80 PVC identity cards.
