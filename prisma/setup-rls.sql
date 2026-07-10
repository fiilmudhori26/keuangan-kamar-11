-- ============================================
-- Keuangan Santri - Database Setup
-- Run this in the Supabase SQL Editor
-- ============================================

-- =====================
-- 1. Enable RLS on all tables
-- =====================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_students ENABLE ROW LEVEL SECURITY;

-- =====================
-- 2. RLS Policies for 'students'
-- =====================

-- Pengurus: Full CRUD access to all students
CREATE POLICY "pengurus_full_access_students" ON students
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'pengurus')
  );

-- Wali: Read-only access to linked students
CREATE POLICY "wali_read_own_students" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM guardian_students
      WHERE guardian_id = auth.uid() AND student_id = students.id
    )
  );

-- =====================
-- 3. RLS Policies for 'transactions'
-- =====================

-- Pengurus: Full CRUD access to all transactions
CREATE POLICY "pengurus_full_access_transactions" ON transactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'pengurus')
  );

-- Wali: Read-only access to linked student transactions
CREATE POLICY "wali_read_own_transactions" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM guardian_students
      WHERE guardian_id = auth.uid() AND student_id = transactions.student_id
    )
  );

-- =====================
-- 4. RLS Policies for 'profiles'
-- =====================

-- Users can read their own profile
CREATE POLICY "read_own_profile" ON profiles
  FOR SELECT USING (id = auth.uid());

-- Pengurus: Full access to all profiles
CREATE POLICY "pengurus_full_access_profiles" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'pengurus')
  );

-- =====================
-- 5. RLS Policies for 'guardian_students'
-- =====================

-- Wali: Read own links
CREATE POLICY "wali_read_own_links" ON guardian_students
  FOR SELECT USING (guardian_id = auth.uid());

-- Pengurus: Full access
CREATE POLICY "pengurus_full_access_guardian_students" ON guardian_students
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'pengurus')
  );

-- =====================
-- 6. Trigger: Auto-create profile on auth signup
-- =====================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'wali')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================
-- 7. Trigger: Auto-update student balance after transaction insert
-- =====================
CREATE OR REPLACE FUNCTION public.update_student_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'IN' THEN
    UPDATE students
    SET current_balance = current_balance + NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.student_id;
  ELSIF NEW.type = 'OUT' THEN
    UPDATE students
    SET current_balance = current_balance - NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.student_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_student_balance
  AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_student_balance();
