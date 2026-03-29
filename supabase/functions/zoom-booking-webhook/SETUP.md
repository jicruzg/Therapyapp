# Configuración del Webhook de Zoom Scheduler

## 1. Despliega la Edge Function en Supabase

```bash
supabase functions deploy zoom-booking-webhook
```

La URL del webhook será:
```
https://<TU_PROJECT_REF>.supabase.co/functions/v1/zoom-booking-webhook
```

Puedes ver tu `project ref` en: https://supabase.com/dashboard → tu proyecto → Settings → General

## 2. Configura el webhook en Zoom

1. Ve a https://marketplace.zoom.us/ → **Develop** → **Build App** (o accede con tu cuenta)
2. Crea una app tipo **"Webhook Only"**
3. En **Feature** → **Event Subscriptions**, agrega una suscripción:
   - **Event notification endpoint URL**: la URL de tu Edge Function (paso 1)
   - Activa los eventos de **Zoom Scheduler**:
     - `scheduler.booking_created` (o el equivalente disponible)
4. Copia el **Secret Token** que genera Zoom

## 3. Agrega el Secret Token como variable de entorno en Supabase

En el dashboard de Supabase → **Edge Functions** → **zoom-booking-webhook** → **Secrets**:

```
ZOOM_WEBHOOK_SECRET_TOKEN = <el token copiado de Zoom>
```

## 4. Verifica que funciona

- Zoom enviará una solicitud de verificación al registrar el webhook
- La función responde automáticamente con el hash correcto
- Cuando un paciente agende en Zoom, la sesión se creará automáticamente en Supabase

## Notas

- El paciente debe estar registrado en la app con el mismo correo que usa al agendar en Zoom
- La función ignora duplicados (misma cita dos veces)
- Los logs se pueden ver en Supabase Dashboard → Edge Functions → Logs
