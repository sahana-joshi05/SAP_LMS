schema.sql   - plain-SQL reference of the schema Hibernate auto-creates in development
seed-data.sql - optional demo data if you want to seed the DB manually instead of
                relying on DataSeeder.java (which runs automatically on backend startup)

These are references, not required for local development — `mvn spring-boot:run`
with `ddl-auto: update` handles table creation and the DataSeeder handles demo data
automatically.
