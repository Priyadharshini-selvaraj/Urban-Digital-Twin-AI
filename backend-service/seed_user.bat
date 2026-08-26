@echo off
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pPravee@2005 urbantwindb -e "DELETE FROM user_roles; DELETE FROM users; INSERT INTO users(id, username, email, password) VALUES(1, 'admin', 'admin@digitaltwin.ai', '$2a$10$7Qe0G9nF.W1ZJ4pZ8bX6e.zYtYg4K/.bS1K8r8LwL2kZ1sH.6K8e2'); INSERT INTO user_roles(user_id, role_id) VALUES(1, 1);"
echo Ready-to-use user created!
