-- ENUM-Typ für Order Statuse
CREATE TYPE  orderStatus AS ENUM ('PAID','PROCESSING','SHIPPED','DELIVERED','UNPAID');


CREATE TABLE orders
(
    id           UUID    PRIMARY KEY USING INDEX TABLESPACE orderspace DEFAULT uuid_generate_v4(),
    version      INTEGER NOT NULL,
    order_number TEXT UNIQUE,
    status orderStatus NOT NULL,
    username  text,
    total_amount DECIMAL,
    created TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) TABLESPACE orderspace;
CREATE INDEX IF NOT EXISTS order_id_idx ON orders(id) TABLESPACE orderspace;


CREATE TABLE item
(
    id       UUID    PRIMARY KEY USING INDEX TABLESPACE orderspace DEFAULT uuid_generate_v4(),
    inventory_id UUID,
    price    DECIMAL,
    quantity INTEGER,
    order_id UUID references orders(id),
    idx      INTEGER DEFAULT 0
) TABLESPACE orderspace;
CREATE INDEX IF NOT EXISTS item_order_id_idx ON item(order_id) TABLESPACE orderspace;
