ALTER TABLE users DROP CONSTRAINT users_role_check;

ALTER TABLE users ADD CONSTRAINT users_role_check
CHECK (role IN (
    'SUPERADMIN',
    'ADMIN',
    'COUNSELOR',
    'OPERATIONS',
    'TRAINER',
    'STUDENT'
));
