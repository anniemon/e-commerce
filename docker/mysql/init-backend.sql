CREATE DATABASE IF NOT EXISTS `e-commerce_local` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
DROP DATABASE IF EXISTS `e-commerce_test`;
CREATE DATABASE IF NOT EXISTS `e-commerce_test` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'root';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
CREATE USER IF NOT EXISTS 'anniemon'@'%' IDENTIFIED BY 'anniemon';
GRANT ALL PRIVILEGES ON *.* TO 'anniemon'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
