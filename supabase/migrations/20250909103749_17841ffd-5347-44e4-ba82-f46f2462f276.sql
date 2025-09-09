-- Insert test profiles (these would normally be created when users sign up)
-- Using realistic UUIDs for test users
INSERT INTO public.profiles (user_id, email, display_name, department, job_title) VALUES
  ('11111111-1111-1111-1111-111111111111', 'john.doe@kmrl.co.in', 'John Doe', 'Finance Department', 'Senior Finance Officer'),
  ('22222222-2222-2222-2222-222222222222', 'sarah.smith@kmrl.co.in', 'Sarah Smith', 'Human Resources', 'HR Manager'),
  ('33333333-3333-3333-3333-333333333333', 'mike.johnson@kmrl.co.in', 'Mike Johnson', 'Operations', 'Operations Supervisor'),
  ('44444444-4444-4444-4444-444444444444', 'lisa.chen@kmrl.co.in', 'Lisa Chen', 'IT Department', 'System Administrator'),
  ('55555555-5555-5555-5555-555555555555', 'david.kumar@kmrl.co.in', 'David Kumar', 'Legal', 'Legal Counsel')
ON CONFLICT (user_id) DO NOTHING;

-- Insert test documents for the test users
INSERT INTO public.documents (user_id, title, description, file_name, file_size, file_type, storage_path, is_public) VALUES
  -- John Doe (Finance) documents
  ('11111111-1111-1111-1111-111111111111', 'Q4 Financial Report', 'Quarterly financial analysis and projections', 'Q4_Financial_Report_2024.pdf', 2048576, 'application/pdf', '11111111-1111-1111-1111-111111111111/financial_report.pdf', false),
  ('11111111-1111-1111-1111-111111111111', 'Budget Proposal 2025', 'Annual budget proposal for next fiscal year', 'Budget_Proposal_2025.xlsx', 1536000, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '11111111-1111-1111-1111-111111111111/budget_proposal.xlsx', false),
  ('11111111-1111-1111-1111-111111111111', 'Expense Guidelines', 'Updated expense reimbursement guidelines', 'Expense_Guidelines_v3.docx', 512000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '11111111-1111-1111-1111-111111111111/expense_guidelines.docx', true),
  
  -- Sarah Smith (HR) documents
  ('22222222-2222-2222-2222-222222222222', 'Employee Handbook 2025', 'Comprehensive employee policies and procedures', 'Employee_Handbook_2025.pdf', 3072000, 'application/pdf', '22222222-2222-2222-2222-222222222222/employee_handbook.pdf', true),
  ('22222222-2222-2222-2222-222222222222', 'Training Schedule', 'Q1 employee training and development schedule', 'Training_Schedule_Q1.pdf', 768000, 'application/pdf', '22222222-2222-2222-2222-222222222222/training_schedule.pdf', false),
  ('22222222-2222-2222-2222-222222222222', 'Performance Review Template', 'Updated performance evaluation template', 'Performance_Review_Template.docx', 256000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '22222222-2222-2222-2222-222222222222/performance_template.docx', false),
  
  -- Mike Johnson (Operations) documents
  ('33333333-3333-3333-3333-333333333333', 'Safety Protocols', 'Updated workplace safety procedures and protocols', 'Safety_Protocols_2025.pdf', 1024000, 'application/pdf', '33333333-3333-3333-3333-333333333333/safety_protocols.pdf', true),
  ('33333333-3333-3333-3333-333333333333', 'Equipment Maintenance Log', 'Monthly equipment maintenance and inspection records', 'Equipment_Maintenance_Jan2025.xlsx', 1280000, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '33333333-3333-3333-3333-333333333333/maintenance_log.xlsx', false),
  ('33333333-3333-3333-3333-333333333333', 'Operational Procedures', 'Standard operating procedures documentation', 'Operational_Procedures_v2.pdf', 2560000, 'application/pdf', '33333333-3333-3333-3333-333333333333/operational_procedures.pdf', false),
  
  -- Lisa Chen (IT) documents
  ('44444444-4444-4444-4444-444444444444', 'IT Security Policy', 'Information security policies and best practices', 'IT_Security_Policy_2025.pdf', 1792000, 'application/pdf', '44444444-4444-4444-4444-444444444444/security_policy.pdf', true),
  ('44444444-4444-4444-4444-444444444444', 'System Backup Report', 'Monthly system backup and recovery status report', 'Backup_Report_Jan2025.pdf', 640000, 'application/pdf', '44444444-4444-4444-4444-444444444444/backup_report.pdf', false),
  ('44444444-4444-4444-4444-444444444444', 'Network Configuration', 'Network infrastructure configuration documentation', 'Network_Config_Diagram.png', 2048000, 'image/png', '44444444-4444-4444-4444-444444444444/network_diagram.png', false),
  
  -- David Kumar (Legal) documents
  ('55555555-5555-5555-5555-555555555555', 'Contract Templates', 'Standard contract templates for various agreements', 'Contract_Templates_2025.docx', 1024000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '55555555-5555-5555-5555-555555555555/contract_templates.docx', false),
  ('55555555-5555-5555-5555-555555555555', 'Compliance Checklist', 'Regulatory compliance requirements checklist', 'Compliance_Checklist_2025.pdf', 896000, 'application/pdf', '55555555-5555-5555-5555-555555555555/compliance_checklist.pdf', true),
  ('55555555-5555-5555-5555-555555555555', 'Legal Updates Summary', 'Summary of recent legal and regulatory changes', 'Legal_Updates_Q4_2024.pdf', 512000, 'application/pdf', '55555555-5555-5555-5555-555555555555/legal_updates.pdf', false);

-- Update the created_at timestamps to have some variation (last 30 days)
UPDATE public.documents 
SET created_at = NOW() - (INTERVAL '1 day' * FLOOR(RANDOM() * 30))
WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222', 
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
);