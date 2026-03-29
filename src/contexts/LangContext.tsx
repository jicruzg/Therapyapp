import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

type Lang = 'es' | 'pt'

const translations = {
  es: {
    // Brand
    brand_name: 'Centro de Terapia',
    brand_subtitle: 'Conductual Contextual',

    // Auth - Login
    login_title: 'Iniciar sesión',
    login_subtitle: 'Accede a tu cuenta profesional',
    email: 'Correo electrónico',
    email_placeholder: 'correo@ejemplo.com',
    password: 'Contraseña',
    password_placeholder: '••••••••',
    submit_login: 'Ingresar',
    have_invite: '¿Recibiste una invitación?',
    create_account_link: 'Crea tu cuenta aquí',
    login_error: 'Correo o contraseña incorrectos. Por favor, intenta de nuevo.',

    // Auth - Register
    register_therapist: 'Registro de terapeuta',
    register_patient: 'Crear cuenta de paciente',
    full_name: 'Nombre completo',
    full_name_placeholder: 'Tu nombre completo',
    password_min: 'Mínimo 6 caracteres',
    confirm_password: 'Confirmar contraseña',
    confirm_placeholder: 'Repite tu contraseña',
    submit_register: 'Crear cuenta',
    have_account: '¿Ya tienes cuenta?',
    signin_link: 'Inicia sesión',
    passwords_no_match: 'Las contraseñas no coinciden.',
    password_too_short: 'La contraseña debe tener al menos 6 caracteres.',
    account_created: '¡Cuenta creada exitosamente!',
    redirecting: 'Redirigiendo...',
    invite_for: 'Invitación para:',
    invalid_token: 'El enlace de invitación no es válido o ya fue utilizado.',
    verifying: 'Verificando invitación...',
    error_creating: 'Error al crear la cuenta.',

    // Navigation - Therapist
    nav_home: 'Inicio',
    nav_patients: 'Pacientes',
    nav_appointments: 'Citas',
    nav_tests: 'Pruebas',
    nav_availability: 'Disponibilidad',

    // Navigation - Patient
    nav_my_appointments: 'Mis Citas',
    nav_mood: 'Estado de Ánimo',
    nav_resources: 'Recursos',
    nav_notifications: 'Notificaciones',

    // Common
    signout: 'Cerrar sesión',
    role_therapist: 'Terapeuta',
    role_patient: 'Paciente',
    see_all: 'Ver todas',
    minutes: 'min',
    today: 'Hoy',
    tomorrow: 'Mañana',
    save: 'Guardar',
    cancel: 'Cancelar',
    loading: 'Cargando...',

    // Greetings
    good_morning: 'Buenos días',
    good_afternoon: 'Buenas tardes',
    good_evening: 'Buenas noches',

    // Therapist Home
    therapist_subtitle: 'Aquí tienes un resumen de tu jornada',
    active_patients: 'Pacientes activos',
    today_appointments: 'Citas hoy',
    pending_tests: 'Pruebas pendientes',
    upcoming_appointments: 'Próximas citas',
    no_upcoming: 'No hay citas próximas',

    // Patient Home
    patient_subtitle: 'Bienvenido/a a tu espacio de bienestar',
    next_appointment: 'Próxima cita',

    // Login brand panel
    brand_tagline: 'Tu plataforma de salud mental de confianza',
    brand_desc: 'Gestión integral de pacientes, citas y seguimiento terapéutico en un solo lugar.',

    // Lang toggle
    lang_label: 'ES',
  },
  pt: {
    // Brand
    brand_name: 'Centro de Terapia',
    brand_subtitle: 'Comportamental Contextual',

    // Auth - Login
    login_title: 'Entrar',
    login_subtitle: 'Acesse sua conta profissional',
    email: 'E-mail',
    email_placeholder: 'email@exemplo.com',
    password: 'Senha',
    password_placeholder: '••••••••',
    submit_login: 'Acessar',
    have_invite: 'Recebeu um convite?',
    create_account_link: 'Crie sua conta aqui',
    login_error: 'E-mail ou senha incorretos. Por favor, tente novamente.',

    // Auth - Register
    register_therapist: 'Cadastro de terapeuta',
    register_patient: 'Criar conta de paciente',
    full_name: 'Nome completo',
    full_name_placeholder: 'Seu nome completo',
    password_min: 'Mínimo 6 caracteres',
    confirm_password: 'Confirmar senha',
    confirm_placeholder: 'Repita sua senha',
    submit_register: 'Criar conta',
    have_account: 'Já tem conta?',
    signin_link: 'Faça login',
    passwords_no_match: 'As senhas não coincidem.',
    password_too_short: 'A senha deve ter pelo menos 6 caracteres.',
    account_created: 'Conta criada com sucesso!',
    redirecting: 'Redirecionando...',
    invite_for: 'Convite para:',
    invalid_token: 'O link de convite é inválido ou já foi utilizado.',
    verifying: 'Verificando convite...',
    error_creating: 'Erro ao criar conta.',

    // Navigation - Therapist
    nav_home: 'Início',
    nav_patients: 'Pacientes',
    nav_appointments: 'Consultas',
    nav_tests: 'Avaliações',
    nav_availability: 'Disponibilidade',

    // Navigation - Patient
    nav_my_appointments: 'Minhas Consultas',
    nav_mood: 'Humor',
    nav_resources: 'Recursos',
    nav_notifications: 'Notificações',

    // Common
    signout: 'Sair',
    role_therapist: 'Terapeuta',
    role_patient: 'Paciente',
    see_all: 'Ver todas',
    minutes: 'min',
    today: 'Hoje',
    tomorrow: 'Amanhã',
    save: 'Salvar',
    cancel: 'Cancelar',
    loading: 'Carregando...',

    // Greetings
    good_morning: 'Bom dia',
    good_afternoon: 'Boa tarde',
    good_evening: 'Boa noite',

    // Therapist Home
    therapist_subtitle: 'Aqui está um resumo do seu dia',
    active_patients: 'Pacientes ativos',
    today_appointments: 'Consultas hoje',
    pending_tests: 'Avaliações pendentes',
    upcoming_appointments: 'Próximas consultas',
    no_upcoming: 'Não há consultas próximas',

    // Patient Home
    patient_subtitle: 'Bem-vindo(a) ao seu espaço de bem-estar',
    next_appointment: 'Próxima consulta',

    // Login brand panel
    brand_tagline: 'Sua plataforma de saúde mental de confiança',
    brand_desc: 'Gestão integrada de pacientes, consultas e acompanhamento terapêutico em um só lugar.',

    // Lang toggle
    lang_label: 'PT',
  },
}

export type TranslationKey = keyof typeof translations.es

interface LangContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: TranslationKey) => string
}

const LangContext = createContext<LangContextType | undefined>(undefined)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() =>
    (localStorage.getItem('ctcc_lang') as Lang) || 'es'
  )

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('ctcc_lang', l)
  }

  function t(key: TranslationKey): string {
    return translations[lang][key] ?? translations.es[key] ?? key
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}
