begin;
create schema if not exists extensions;
-- Existing exclusion constraints retain their operator-class references.
alter extension btree_gist set schema extensions;
commit;
