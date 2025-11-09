-- init.sql  (place in project root, same level as docker‑compose.yml)
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY '5s4dUEb41234!2';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;