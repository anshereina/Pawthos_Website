# Reports and Alerts Setup

This document explains the new Reports and Alerts functionality that has been added to the Pawthos system.

## Database Changes

### New Tables Created

1. **reports** - Stores submitted reports
   - `id` (Primary Key)
   - `report_id` (Unique identifier in REP-0001 format)
   - `title` (Report title)
   - `description` (Report description)
   - `status` (New, In Progress, Resolved)
   - `submitted_by` (Name of person who submitted)
   - `submitted_by_email` (Email of person who submitted)
   - `created_at` (Timestamp)
   - `updated_at` (Timestamp)

2. **alerts** - Stores submitted alerts
   - `id` (Primary Key)
   - `alert_id` (Unique identifier in ALT-0001 format)
   - `title` (Alert title)
   - `message` (Alert message)
   - `priority` (Low, Medium, High, Critical)
   - `submitted_by` (Name of person who submitted)
   - `submitted_by_email` (Email of person who submitted)
   - `created_at` (Timestamp)
   - `updated_at` (Timestamp)

## API Endpoints

### Reports Endpoints
- `GET /reports` - Get all reports
- `POST /reports` - Create a new report
- `GET /reports/{report_id}` - Get a specific report
- `PUT /reports/{report_id}` - Update a report
- `DELETE /reports/{report_id}` - Delete a report
- `GET /reports/search/?query={search_term}` - Search reports

### Alerts Endpoints
- `GET /alerts` - Get all alerts
- `POST /alerts` - Create a new alert
- `GET /alerts/{alert_id}` - Get a specific alert
- `PUT /alerts/{alert_id}` - Update an alert
- `DELETE /alerts/{alert_id}` - Delete an alert
- `GET /alerts/search/?query={search_term}` - Search alerts
- `GET /alerts/priority/{priority}` - Get alerts by priority

## Running the Migration

To apply the database changes, run the following command in the backend directory:

```bash
alembic upgrade head
```

This will create the new `reports` and `alerts` tables in your database.

## Frontend Changes

### New Components
- `AddReportModal.tsx` - Modal for creating new reports
- `AddAlertModal.tsx` - Modal for creating new alerts

### New Services
- `reportService.ts` - API service for reports
- `alertService.ts` - API service for alerts

### New Hooks
- `useReports.ts` - Custom hook for managing reports state
- `useAlerts.ts` - Custom hook for managing alerts state

### Updated Pages
- `ReportsAlertsPage.tsx` - Now uses real data from backend instead of dummy data

## Features

### Reports
- Create new reports with title, description, and status
- View all submitted reports in a table format
- Update report status (New, In Progress, Resolved)
- Delete reports
- Search reports by title or description

### Alerts
- Create new alerts with title, message, and priority level
- View all submitted alerts in a table format
- Delete alerts
- Search alerts by title or message
- Filter alerts by priority level
- Priority levels: Low, Medium, High, Critical (with color coding)

## Usage

1. Navigate to the Reports & Alerts page
2. Use the "Generate Report" button to create a new report
3. Use the "Send New Alert" button to create a new alert
4. Use the search functionality to find specific reports or alerts
5. Use the status dropdown to update report status
6. Use the delete buttons to remove reports or alerts

## Authentication

All API endpoints require authentication. The frontend automatically includes the JWT token in the Authorization header for all requests. 