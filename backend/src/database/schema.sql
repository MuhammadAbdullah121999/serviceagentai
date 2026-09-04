-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service Requests table
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  priority VARCHAR(50),
  status VARCHAR(50) DEFAULT 'New',
  location VARCHAR(255),
  photo_url VARCHAR(500),
  ai_summary TEXT,
  ai_next_action TEXT,
  ai_confidence DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_requests ON service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_email ON users(email);

-- Attachments: any file type, metadata in Postgres, binary in object storage
CREATE TABLE IF NOT EXISTS request_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_filename VARCHAR(255) NOT NULL,
  storage_key VARCHAR(500) NOT NULL,
  storage_url VARCHAR(1000),
  mime_type VARCHAR(150) NOT NULL,
  file_size BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_attachment_request ON request_attachments(request_id);
CREATE INDEX IF NOT EXISTS idx_attachment_user ON request_attachments(user_id);

-- AI observability
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMP;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS ai_model VARCHAR(100);