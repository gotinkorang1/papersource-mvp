-- Keep third-party extensions outside the exposed public schema.
alter extension pg_trgm set schema extensions;
