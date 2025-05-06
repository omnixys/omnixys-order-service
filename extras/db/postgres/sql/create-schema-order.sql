    --    psql --dbname=bitnami_keycloak --username=bn_keycloak --file=/sql/order/create-db-order.sql
    --    psql --dbname=order_db --username=order_db_user --file=/sql/order/create-schema-order.sql

CREATE SCHEMA IF NOT EXISTS order_schema AUTHORIZATION order_db_user;

ALTER ROLE order_db_user SET search_path = 'order_schema';