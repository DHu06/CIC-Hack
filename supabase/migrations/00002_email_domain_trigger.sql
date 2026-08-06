-- StudyHall UBC: Email Domain Enforcement Trigger
-- This migration creates a Postgres trigger on auth.users that rejects
-- any INSERT where the email does not end with @student.ubc.ca.
-- This is the database-level security gate (defense in depth).

-- ============================================================================
-- TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.enforce_ubc_email_domain()
RETURNS trigger AS $$
BEGIN
  -- Reject null emails
  IF NEW.email IS NULL THEN
    RAISE EXCEPTION 'Email address is required';
  END IF;

  -- Case-insensitive check: email must end with @student.ubc.ca
  IF lower(NEW.email) NOT LIKE '%@student.ubc.ca' THEN
    RAISE EXCEPTION 'Only @student.ubc.ca email addresses are allowed';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER
-- ============================================================================

CREATE TRIGGER trg_enforce_ubc_email_domain
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_ubc_email_domain();
