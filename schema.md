# Database Schema

## 1. `users` table

- `id`: Primary key (auto-incrementing)
- `name`: String
- `email`: String (unique)
- `email_verified_at`: Timestamp (nullable)
- `password`: String
- `remember_token`: String (nullable)
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `role`: Enum (`admin`, `technician`, `custodian`) (default: `admin`)
- `status`: Enum (`active`, `inactive`) (default: `active`)

## 2. `password_reset_tokens` table

- `email`: String (primary key)
- `token`: String
- `created_at`: Timestamp (nullable)

## 3. `sessions` table

- `id`: String (primary key)
- `user_id`: Foreign key to `users` table (nullable, indexed)
- `ip_address`: String (max 45 characters, nullable)
- `user_agent`: Text (nullable)
- `payload`: LongText
- `last_activity`: Integer (indexed)

## 4. `cache` table

- `key`: String (primary key)
- `value`: MediumText
- `expiration`: Integer

## 5. `cache_locks` table

- `key`: String (primary key)
- `owner`: String
- `expiration`: Integer

## 6. `jobs` table

- `id`: Primary key (auto-incrementing)
- `queue`: String (indexed)
- `payload`: LongText
- `attempts`: Unsigned Tiny Integer
- `reserved_at`: Unsigned Integer (nullable)
- `available_at`: Unsigned Integer
- `created_at`: Unsigned Integer

## 7. `job_batches` table

- `id`: String (primary key)
- `name`: String
- `total_jobs`: Integer
- `pending_jobs`: Integer
- `failed_jobs`: Integer
- `failed_job_ids`: LongText
- `options`: MediumText (nullable)
- `cancelled_at`: Integer (nullable)
- `created_at`: Integer
- `finished_at`: Integer (nullable)

## 8. `failed_jobs` table

- `id`: Primary key (auto-incrementing)
- `uuid`: String (unique)
- `connection`: Text
- `queue`: Text
- `payload`: LongText
- `exception`: LongText
- `failed_at`: Timestamp (current timestamp as default)

## 9. `logs` table

- `id`: Primary key (auto-incrementing)
- `user_id`: Foreign key to `users` table (nullable, cascade on delete)
- `issue_id`: Foreign key to `issues` table (nullable, cascade on delete)
- `action_taken`: Text (nullable)
- `status`: Enum (`pending`, `in_progress`, `resolved`, `closed`) (default: `pending`)
- `priority`: Enum (`low`, `medium`, `high`) (default: `low`)
- `created_at`: Timestamp
- `updated_at`: Timestamp

## 10. `issues` table

- `id`: Primary key (auto-incrementing)
- `user_id`: Foreign key to `users` table (nullable, set null on delete)
- `assigned_to`: Foreign key to `users` table (nullable, set null on delete)
- `location`: String
- `atm_id`: String
- `category`: Enum (`dispenser_errors`, `card_reader_errors`, `receipt_printer_errors`, `epp_errors`, `pc_core_errors`, `journal_printer_errors`, `recycling_module_errors`, `other`)
- `description`: Text (nullable)
- `status`: Enum (`pending`, `in_progress`, `acknowledged`, `resolved`, `closed`) (default: `pending`)
- `priority`: Enum (`low`, `medium`, `high`) (default: `low`)
- `created_at`: Timestamp
- `updated_at`: Timestamp

## 11. `personal_access_tokens` table

- `id`: Primary key (auto-incrementing)
- `tokenable_type`: String (morphs)
- `tokenable_id`: Big Integer (morphs)
- `name`: String
- `token`: String (max 64 characters, unique)
- `abilities`: Text (nullable)
- `last_used_at`: Timestamp (nullable)
- `expires_at`: Timestamp (nullable)
- `created_at`: Timestamp
- `updated_at`: Timestamp
