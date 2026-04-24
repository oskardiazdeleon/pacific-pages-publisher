CREATE TYPE public.import_job_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE public.import_item_status AS ENUM ('pending', 'processing', 'done', 'failed');

CREATE TABLE public.import_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  section_url text NOT NULL,
  kind text NOT NULL,
  search text,
  publish boolean NOT NULL DEFAULT true,
  status public.import_job_status NOT NULL DEFAULT 'pending',
  total int NOT NULL DEFAULT 0,
  done_count int NOT NULL DEFAULT 0,
  failed_count int NOT NULL DEFAULT 0,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.import_job_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.import_jobs(id) ON DELETE CASCADE,
  url text NOT NULL,
  status public.import_item_status NOT NULL DEFAULT 'pending',
  attempts int NOT NULL DEFAULT 0,
  last_error text,
  result_kind text,
  result_slug text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, url)
);

CREATE INDEX idx_import_job_items_job_status ON public.import_job_items(job_id, status);
CREATE INDEX idx_import_jobs_created_at ON public.import_jobs(created_at DESC);

ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_job_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and editors view jobs" ON public.import_jobs
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins and editors create jobs" ON public.import_jobs
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins and editors update jobs" ON public.import_jobs
  FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins delete jobs" ON public.import_jobs
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins and editors view items" ON public.import_job_items
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins and editors create items" ON public.import_job_items
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins and editors update items" ON public.import_job_items
  FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

CREATE TRIGGER trg_import_jobs_updated_at
  BEFORE UPDATE ON public.import_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_import_job_items_updated_at
  BEFORE UPDATE ON public.import_job_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();