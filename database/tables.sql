CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  hashed_password VARCHAR(255) NOT NULL,
  email VARCHAR(255)
);

CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  user_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  category_id INTEGER,
  due_date TIMESTAMP,
  create_at TIMESTAMP, 
  priority VARCHAR(50) CHECK (priority IN ('low', 'medium', 'high')),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE subtasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  todos_id INTEGER,
  FOREIGN KEY (todos_id) REFERENCES todos(id)
);

CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  subtasks_id INTEGER,
  content TEXT,
  FOREIGN KEY (subtasks_id) REFERENCES subtasks(id)
);

CREATE TABLE notificates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  todos_id INTEGER,
  scheduled TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (todos_id) REFERENCES todos(id)
);