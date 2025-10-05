CREATE TABLE signature_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    faculty_advisor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    hod_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending_faculty_advisor', 'pending_hod', 'approved', 'rejected')) NOT NULL,
    faculty_advisor_approved_at TIMESTAMPTZ,
    hod_approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE signature_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can create signature requests"
ON signature_requests
FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can view their own signature requests"
ON signature_requests
FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = faculty_advisor_id OR auth.uid() = hod_id);

CREATE POLICY "Faculty advisors can update requests assigned to them"
ON signature_requests
FOR UPDATE
USING (auth.uid() = faculty_advisor_id)
WITH CHECK (status IN ('pending_hod', 'rejected'));

CREATE POLICY "HODs can update requests assigned to them"
ON signature_requests
FOR UPDATE
USING (auth.uid() = hod_id)
WITH CHECK (status IN ('approved', 'rejected'));
