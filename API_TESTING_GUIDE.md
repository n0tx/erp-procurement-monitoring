# Panduan Testing API E-Procurement

Dokumen ini berisi panduan cara menjalankan aplikasi dan melakukan simulasi *workflow* menggunakan Postman.

## 1. Cara Menjalankan Server
Pastikan kamu sudah berada di dalam folder `backend`, lalu jalankan:
```bash
php artisan serve
```
Server akan berjalan di **`http://127.0.0.1:8000`**. Gunakan URL ini sebagai *Base URL* di Postman.

---

## 2. Akun Login Tersedia (Password semua: `password`)
Kita sudah menyiapkan user dari Seeder dengan masing-masing *role*:
1. **Project User** (Site Engineer) 👉 `project@demo-epc.com` *(Tugas: Bikin & Submit PR)*
2. **Approver** (Project Manager) 👉 `manager@demo-epc.com` *(Tugas: Approve/Reject PR)*
3. **Procurement** (Procurement Staff) 👉 `procurement@demo-epc.com` *(Tugas: Bikin Quotation, Pilih Vendor, Bikin PO)*
4. **Admin** 👉 `admin@demo-epc.com` *(Bisa lihat semua Report & Master Data)*

*(Saat testing, kamu perlu berganti-ganti akun dengan melakukan Login dan memasukkan `access_token` yang didapat ke dalam tab **Authorization ➔ Bearer Token** di Postman).*

---

## 3. Skenario Testing Workflow Utama

Berikut adalah langkah-langkah mensimulasikan proses dari *Request* barang dari lapangan sampai *Order* ke pabrik baja.

### Tahap 1: Bikin Purchase Request (Role: Project User)
1. **Login:** `POST /api/auth/login` (email: `project@demo-epc.com`)
2. Set *Bearer Token* di Postman.
3. **Buat PR:** `POST /api/purchase-requests`
   **Body JSON:**
   ```json
   {
       "project_id": 2,
       "department_id": 3,
       "request_date": "2026-05-18",
       "notes": "Request material untuk struktur",
       "details": [
           {
               "item_id": 1,
               "qty": 20,
               "estimated_price": 3500000,
               "remarks": "Butuh cepat"
           }
       ]
   }
   ```
   *(Catat ID PR yang didapat dari response, misalnya ID: `2`)*
4. **Submit PR:** `POST /api/purchase-requests/2/submit` (PR sekarang berstatus `submitted`).

### Tahap 2: Approval (Role: Approver)
1. **Login:** `POST /api/auth/login` (email: `manager@demo-epc.com`)
2. Ganti *Bearer Token*.
3. **Approve PR:** `POST /api/purchase-requests/2/approve`
   **Body JSON:**
   ```json
   {
       "notes": "Oke setuju, segera proses"
   }
   ```
   *(PR sekarang berstatus `approved` dan siap dilempar ke Procurement).*

### Tahap 3: Vendor & Quotation (Role: Procurement)
1. **Login:** `POST /api/auth/login` (email: `procurement@demo-epc.com`)
2. Ganti *Bearer Token*.
3. **Buat Penawaran Vendor (Quotation):** `POST /api/vendor-quotations`
   **Body JSON:**
   ```json
   {
       "purchase_request_id": 2,
       "vendor_id": 1,
       "quotation_date": "2026-05-19",
       "details": [
           {
               "item_id": 1,
               "qty": 20,
               "price": 3400000
           }
       ]
   }
   ```
   *(Catat ID Quotation yang didapat, misalnya ID: `2`)*
4. **Pilih Penawaran (Select Vendor):** `POST /api/vendor-quotations/2/select`
   *(PR akan berubah jadi `processed`, dan Quotation jadi `selected`)*.

### Tahap 4: Purchase Order (Role: Procurement)
1. Masih pakai token **Procurement**.
2. **Buat PO:** `POST /api/purchase-orders`
   **Body JSON:**
   ```json
   {
       "purchase_request_id": 2,
       "vendor_id": 1,
       "po_date": "2026-05-20"
   }
   ```
   *(Perhatikan: Items dan harga otomatis disalin sistem dari Quotation yang berstatus `selected` tadi. Catat ID PO, misal: `2`)*
3. **Issue PO (Kirim ke vendor):** `POST /api/purchase-orders/2/issue`
4. **Deliver (Barang sampai):** `POST /api/purchase-orders/2/deliver`
5. **Close PO (Selesai):** `POST /api/purchase-orders/2/close`

---

## 4. API Pelengkap (Bisa di-cek kapan saja)
- **Lihat Rekap Dashboard:** `GET /api/dashboard/procurement`
- **Lihat Audit Trail (Siapa nge-klik apa):** `GET /api/approval-logs`
- **Lihat Daftar Vendor:** `GET /api/vendors`
