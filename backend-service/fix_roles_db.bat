@echo off
echo Fixing MySQL roles table - removing duplicates...
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pPravee@2005 urbantwindb -e "DELETE FROM user_roles; DELETE FROM roles; ALTER TABLE roles AUTO_INCREMENT = 1; INSERT INTO roles(id, name) VALUES(1, 'ROLE_USER'), (2, 'ROLE_MODERATOR'), (3, 'ROLE_ADMIN');"
echo Done! Roles table:
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pPravee@2005 urbantwindb -e "SELECT id, name FROM roles;"
