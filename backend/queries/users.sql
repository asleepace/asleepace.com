--! fetch_users
SELECT username, password, email, avatar, id, created_at::text, updated_at::text FROM users;