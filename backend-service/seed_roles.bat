@echo off
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pPravee@2005 urbantwindb -e "INSERT INTO roles(name) VALUES('ROLE_USER') ON DUPLICATE KEY UPDATE name=name; INSERT INTO roles(name) VALUES('ROLE_MODERATOR') ON DUPLICATE KEY UPDATE name=name; INSERT INTO roles(name) VALUES('ROLE_ADMIN') ON DUPLICATE KEY UPDATE name=name; SELECT id,name FROM roles; SELECT id,username,email FROM users;"
echo Done. Roles seeded.
pause
