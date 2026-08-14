-- Indexes for transactions table (perf: dashboard count, transactions list,
-- student detail). Apply via Supabase SQL editor OR `prisma db push`.
-- Trade-off: slightly slower inserts + storage; removes sequential scans on
-- the two hottest filter/sort columns.

CREATE INDEX IF NOT EXISTS idx_transactions_transaction_date
  ON transactions (transaction_date);

CREATE INDEX IF NOT EXISTS idx_transactions_student_id
  ON transactions (student_id);
