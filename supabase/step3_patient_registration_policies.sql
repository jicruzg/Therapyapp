-- PASO 3: Politicas para registro de pacientes via invitacion
-- Corre este script en el SQL Editor de Supabase.

-- Permite que usuarios NO autenticados puedan verificar un token de invitacion
-- (necesario para que el paciente vea su nombre en la pagina de registro)
create policy "Public can verify invitation token" on public.patients
  for select using (status = 'pending' and profile_id is null);

-- Permite que alguien se "auto-registre" como paciente al usar un token valido
-- (necesario para vincular profile_id al aceptar la invitacion)
create policy "Allow patient self-registration" on public.patients
  for update using (status = 'pending' and profile_id is null)
  with check (true);
