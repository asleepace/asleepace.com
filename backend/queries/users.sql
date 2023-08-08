--! fetch_users
SELECT username, email, avatar, id, created_at::text, updated_at::text FROM users;

--! create_user(username, pass, salt, email, first_name, last_name, avatar)
INSERT INTO users (username, pass, salt, email, first_name, last_name, avatar)
VALUES (:username, :pass, :salt, :email, :first_name, :last_name, :avatar);
