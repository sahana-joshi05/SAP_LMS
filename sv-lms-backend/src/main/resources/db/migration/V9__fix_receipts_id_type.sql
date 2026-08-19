ALTER SEQUENCE public.receipts_id_seq
    AS BIGINT;

ALTER TABLE public.receipts
    ALTER COLUMN id TYPE BIGINT;
