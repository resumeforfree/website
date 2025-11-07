-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 0,
    template TEXT DEFAULT 'template1',
    data JSON NOT NULL,
    settings JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resumes_user_active ON resumes(user_id, is_active);

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_resumes_updated_at
AFTER UPDATE ON resumes
BEGIN
    UPDATE resumes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Ensure only one active resume per user
CREATE TRIGGER ensure_single_active_resume
BEFORE UPDATE ON resumes
WHEN NEW.is_active = 1 AND OLD.is_active = 0
BEGIN
    UPDATE resumes SET is_active = 0 WHERE user_id = NEW.user_id AND id != NEW.id;
END;

CREATE TRIGGER ensure_single_active_resume_insert
BEFORE INSERT ON resumes
WHEN NEW.is_active = 1
BEGIN
    UPDATE resumes SET is_active = 0 WHERE user_id = NEW.user_id;
END;