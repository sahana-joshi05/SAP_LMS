-- Align receipt amount columns with Java Double mappings
ALTER TABLE receipts
    ALTER COLUMN total_amount TYPE DOUBLE PRECISION
    USING total_amount::DOUBLE PRECISION;

ALTER TABLE receipts
    ALTER COLUMN amount_paid TYPE DOUBLE PRECISION
    USING amount_paid::DOUBLE PRECISION;

ALTER TABLE receipts
    ALTER COLUMN balance_amount TYPE DOUBLE PRECISION
    USING balance_amount::DOUBLE PRECISION;