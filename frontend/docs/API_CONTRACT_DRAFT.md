# DentQL API Contract Draft

This document outlines the expected REST JSON payloads for the primary clinical operations.

## 1. Patient CRUD
**`GET /api/patients/:id`**
```json
// Response (200 OK)
{
  "id": "pat_123",
  "name": "Jane Doe",
  "phone": "+63 917 123 4567",
  "balance": 500.00,
  "status": "ACTIVE"
}
```

**`POST /api/patients`**
```json
// Request payload
{
  "name": "Jane Doe",
  "phone": "+63 917 123 4567"
}
```

## 2. Appointment CRUD & Status
**`PATCH /api/appointments/:id/status`**
```json
// Request payload
{
  "status": "IN_CHAIR"
}
// Response (200 OK)
{
  "id": "apt_890",
  "status": "IN_CHAIR",
  "updatedAt": "2026-05-23T10:00:00Z"
}
```

## 3. Invoices & Payments
**`POST /api/invoices`**
```json
// Request payload
{
  "patientId": "pat_123",
  "items": [
    { "description": "Consultation", "price": 1000, "qty": 1 }
  ]
}
```

**`POST /api/invoices/:id/payments`**
```json
// Request payload
{
  "amount": 500,
  "method": "CREDIT_CARD"
}
// Response (200 OK)
{
  "paymentId": "pay_555",
  "invoiceNewBalance": 500
}
```

## 4. Claims
**`POST /api/claims/:id/transmit`**
```json
// Request payload (none, triggers action based on claim ID)
{}
// Response (202 Accepted)
{
  "status": "QUEUED_FOR_SUBMISSION",
  "gateway": "PHILHEALTH_ECLAIMS"
}
```

## 5. Kiosk / Public Booking
**`POST /api/kiosk/check-in`**
```json
// Request payload
{
  "clinicSlug": "dentease-main",
  "patientName": "John Smith",
  "phone": "09170000000",
  "appointmentId": "apt_111" // Optional
}
```
