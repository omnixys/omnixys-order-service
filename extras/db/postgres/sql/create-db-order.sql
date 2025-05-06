

-- psql --dbname=bitnami_keycloak --username=bn_keycloak --file=/sql/order/create-db-order.sql
-- psql --dbname=bitnami_keycloak --username=bn_keycloak --file=/sql/order/create-schema-order.sql


CREATE ROLE order_db_user LOGIN PASSWORD 'GentleCorp09.04.2025';

CREATE DATABASE order_db;

GRANT ALL ON DATABASE order_db TO order_db_user;

CREATE TABLESPACE orderspace OWNER order_db_user LOCATION '/var/lib/postgresql/tablespace/order';