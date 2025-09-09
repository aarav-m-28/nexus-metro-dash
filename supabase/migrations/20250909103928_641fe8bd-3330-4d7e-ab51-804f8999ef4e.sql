-- Create some sample documents that will be visible once users sign up
-- These will be assigned to users when they authenticate

-- First, let's create a temporary table for sample data that can be used by any user
CREATE TABLE IF NOT EXISTS public.sample_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  department TEXT,
  job_title TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample documents by department
INSERT INTO public.sample_documents (title, description, file_name, file_size, file_type, department, job_title, is_public) VALUES
  -- Finance Department samples
  ('Q4 Financial Report', 'Quarterly financial analysis and projections', 'Q4_Financial_Report_2024.pdf', 2048576, 'application/pdf', 'Finance Department', 'Senior Finance Officer', true),
  ('Budget Proposal 2025', 'Annual budget proposal for next fiscal year', 'Budget_Proposal_2025.xlsx', 1536000, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Finance Department', 'Finance Manager', false),
  ('Expense Guidelines', 'Updated expense reimbursement guidelines', 'Expense_Guidelines_v3.docx', 512000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Finance Department', 'Finance Officer', true),
  
  -- HR Department samples  
  ('Employee Handbook 2025', 'Comprehensive employee policies and procedures', 'Employee_Handbook_2025.pdf', 3072000, 'application/pdf', 'Human Resources', 'HR Manager', true),
  ('Training Schedule', 'Q1 employee training and development schedule', 'Training_Schedule_Q1.pdf', 768000, 'application/pdf', 'Human Resources', 'Training Coordinator', false),
  ('Performance Review Template', 'Updated performance evaluation template', 'Performance_Review_Template.docx', 256000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Human Resources', 'HR Specialist', false),
  
  -- Operations Department samples
  ('Safety Protocols', 'Updated workplace safety procedures and protocols', 'Safety_Protocols_2025.pdf', 1024000, 'application/pdf', 'Operations', 'Operations Supervisor', true),
  ('Equipment Maintenance Log', 'Monthly equipment maintenance and inspection records', 'Equipment_Maintenance_Jan2025.xlsx', 1280000, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Operations', 'Maintenance Technician', false),
  ('Operational Procedures', 'Standard operating procedures documentation', 'Operational_Procedures_v2.pdf', 2560000, 'application/pdf', 'Operations', 'Operations Manager', false),
  
  -- IT Department samples
  ('IT Security Policy', 'Information security policies and best practices', 'IT_Security_Policy_2025.pdf', 1792000, 'application/pdf', 'IT Department', 'System Administrator', true),
  ('System Backup Report', 'Monthly system backup and recovery status report', 'Backup_Report_Jan2025.pdf', 640000, 'application/pdf', 'IT Department', 'Network Administrator', false),
  ('Network Configuration', 'Network infrastructure configuration documentation', 'Network_Config_Diagram.png', 2048000, 'image/png', 'IT Department', 'IT Manager', false),
  
  -- Legal Department samples
  ('Contract Templates', 'Standard contract templates for various agreements', 'Contract_Templates_2025.docx', 1024000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Legal', 'Legal Counsel', false),
  ('Compliance Checklist', 'Regulatory compliance requirements checklist', 'Compliance_Checklist_2025.pdf', 896000, 'application/pdf', 'Legal', 'Compliance Officer', true),
  ('Legal Updates Summary', 'Summary of recent legal and regulatory changes', 'Legal_Updates_Q4_2024.pdf', 512000, 'application/pdf', 'Legal', 'Legal Assistant', false);

-- Create a function to populate user documents from samples when they sign up
CREATE OR REPLACE FUNCTION public.populate_user_documents()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert 3-5 random sample documents for the new user
  INSERT INTO public.documents (user_id, title, description, file_name, file_size, file_type, storage_path, is_public)
  SELECT 
    NEW.user_id,
    title,
    description,
    file_name,
    file_size,
    file_type,
    NEW.user_id::text || '/' || file_name,
    is_public
  FROM public.sample_documents
  ORDER BY RANDOM()
  LIMIT 4;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-populate documents when a profile is created
DROP TRIGGER IF EXISTS populate_documents_on_profile_creation ON public.profiles;
CREATE TRIGGER populate_documents_on_profile_creation
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.populate_user_documents();

-- Also create some sample department/job title combinations for profiles
CREATE TABLE IF NOT EXISTS public.sample_departments (
  id SERIAL PRIMARY KEY,
  department TEXT NOT NULL,
  job_titles TEXT[] NOT NULL
);

INSERT INTO public.sample_departments (department, job_titles) VALUES
  ('Finance Department', ARRAY['Finance Officer', 'Senior Finance Officer', 'Finance Manager', 'Accounts Manager', 'Budget Analyst']),
  ('Human Resources', ARRAY['HR Manager', 'HR Specialist', 'Training Coordinator', 'Recruitment Specialist', 'HR Assistant']),
  ('Operations', ARRAY['Operations Manager', 'Operations Supervisor', 'Operations Coordinator', 'Process Manager', 'Quality Assurance']),
  ('IT Department', ARRAY['System Administrator', 'Network Administrator', 'IT Manager', 'Software Developer', 'Database Administrator']),
  ('Legal', ARRAY['Legal Counsel', 'Legal Assistant', 'Compliance Officer', 'Contract Manager', 'Legal Advisor']),
  ('Administration', ARRAY['Administrative Officer', 'Office Manager', 'Executive Assistant', 'Administrative Coordinator', 'General Manager']);

-- Update the existing handle_new_user function to include random department and job title
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  dept_record RECORD;
  selected_job_title TEXT;
BEGIN
  -- Get a random department and job title
  SELECT department, job_titles INTO dept_record
  FROM public.sample_departments
  ORDER BY RANDOM()
  LIMIT 1;
  
  -- Pick a random job title from the selected department
  selected_job_title := dept_record.job_titles[floor(random() * array_length(dept_record.job_titles, 1) + 1)];
  
  INSERT INTO public.profiles (user_id, email, display_name, department, job_title)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    dept_record.department,
    selected_job_title
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;