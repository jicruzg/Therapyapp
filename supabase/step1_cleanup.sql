-- PASO 1: Limpieza
-- Corre este script primero. Borra todo si existe de intentos anteriores.

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.notifications cascade;
drop table if exists public.mood_entries cascade;
drop table if exists public.assigned_tests cascade;
drop table if exists public.sessions cascade;
drop table if exists public.availability cascade;
drop table if exists public.patients cascade;
drop table if exists public.profiles cascade;
