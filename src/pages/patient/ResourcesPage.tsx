import { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { BookOpen, Shield, Wind, Heart, ChevronRight, Star, ArrowLeft } from 'lucide-react'

interface Resource {
  id: string
  title: string
  subtitle: string
  icon: typeof BookOpen
  accent: string
  bg: string
  content: React.ReactNode
}

/* ── Shared accordion item ── */
function AccordionItem({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-[#dce5ec] rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#f8fafc] transition-colors text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div>
          <p className="font-semibold text-[#0d1b2a] text-sm">{title}</p>
          <p className="text-xs text-[#526070] mt-0.5">{subtitle}</p>
        </div>
        <ChevronRight
          size={17}
          className={`text-[#8096a7] transition-transform duration-200 flex-shrink-0 ml-3 ${open ? 'rotate-90' : ''}`}
        />
      </button>
      {open && (
        <div className="border-t border-[#f0f4f8]">
          {children}
        </div>
      )}
    </div>
  )
}

/* ── DBT Skills ── */
function DBTContent() {
  const skills = [
    {
      category: 'TIPP',
      description: 'Cambia tu química corporal rápidamente',
      items: [
        { name: 'T — Temperatura', desc: 'Sumerge tu cara en agua fría por 30 segundos o sostén hielo. Activa el reflejo de buceo y ralentiza tu corazón.' },
        { name: 'I — Ejercicio Intenso', desc: 'Corre, haz saltos de tijera o ejercicio intenso por 20 minutos. Quema la adrenalina del cuerpo.' },
        { name: 'P — Respiración pausada', desc: 'Inhala 4 seg, retén 4, exhala 6-8 seg. Activa el sistema nervioso parasimpático.' },
        { name: 'P — Relajación Muscular Progresiva', desc: 'Tensa cada grupo muscular 5 seg y relájalo, comenzando por los pies.' },
      ]
    },
    {
      category: 'ACCEPTS',
      description: 'Distracción con actividades saludables',
      items: [
        { name: 'A — Actividades', desc: 'Haz algo que requiera tu atención: cocinar, leer, jugar, limpiar.' },
        { name: 'C — Contribuir', desc: 'Ayuda a alguien más. Envía un mensaje amable, haz voluntariado, pequeños actos de bondad.' },
        { name: 'C — Comparaciones', desc: 'Compárate con cómo estabas antes o con personas que tienen más dificultades.' },
        { name: 'E — Emociones opuestas', desc: 'Ve una película cómica si estás triste, escucha música alegre si estás ansioso/a.' },
        { name: 'P — Pensar en otras cosas', desc: 'Cuenta hacia atrás de 3 en 3 desde 100, recuerda letras de canciones.' },
        { name: 'T — Sensaciones fuertes', desc: 'Sostén un cubo de hielo, come algo muy ácido, escucha música fuerte.' },
        { name: 'S — Salir de tu espacio', desc: 'Cambia de ambiente, ve a un lugar público, sal de tu rutina.' },
      ]
    },
    {
      category: 'PLEASE',
      description: 'Cuida tu salud física para mejorar la emocional',
      items: [
        { name: 'PL — Trata enfermedades', desc: 'Atiende tus problemas físicos de salud. Visita al médico cuando sea necesario.' },
        { name: 'E — Alimentación equilibrada', desc: 'Come a horas regulares, evita saltarte comidas y mantén una dieta balanceada.' },
        { name: 'A — Evita sustancias', desc: 'Evita alcohol, drogas y cafeína en exceso que alteren tu estado emocional.' },
        { name: 'S — Sueño equilibrado', desc: 'Mantén un horario de sueño regular. Dormir 7-9 horas mejora la regulación emocional.' },
        { name: 'E — Ejercicio regular', desc: 'Actividad física al menos 20 minutos al día. El ejercicio reduce el estrés y mejora el ánimo.' },
      ]
    },
    {
      category: 'Habilidades de Mindfulness',
      description: 'Observa sin juzgar el momento presente',
      items: [
        { name: 'Observar', desc: 'Nota tus pensamientos, sensaciones y emociones sin intentar cambiarlos. Solo observa.' },
        { name: 'Describir', desc: 'Pon palabras a lo que observas: "Siento tensión en el pecho", "Noto que estoy pensando en..."' },
        { name: 'Participar', desc: 'Involúcrate completamente en el momento presente sin distracciones.' },
        { name: 'Sin juzgar', desc: 'Evita evaluar tus experiencias como buenas o malas. Simplemente son.' },
        { name: 'Una cosa a la vez', desc: 'Concéntrate en una sola actividad. Cuando tu mente divague, vuelve amablemente.' },
        { name: 'Efectividad', desc: 'Haz lo que funciona en la situación. Enfócate en los hechos, no en lo que "debería ser".' },
      ]
    }
  ]

  return (
    <div className="space-y-3">
      <div className="bg-[#e8f0f7] border border-[#194067]/15 text-[#526070] text-sm p-4 rounded-2xl">
        La Terapia Dialéctica Conductual (DBT) te ayuda a regular emociones intensas. Estas habilidades pueden usarse en momentos de crisis.
      </div>
      {skills.map(cat => (
        <AccordionItem key={cat.category} title={cat.category} subtitle={cat.description}>
          <div className="divide-y divide-[#f0f4f8]">
            {cat.items.map(item => (
              <div key={item.name} className="px-5 py-4">
                <p className="font-semibold text-sm text-[#0d1b2a] mb-1">{item.name}</p>
                <p className="text-sm text-[#526070] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </AccordionItem>
      ))}
    </div>
  )
}

/* ── Safety Plan ── */
function SafetyPlanContent() {
  const steps = [
    { step: '1', title: 'Señales de alerta', desc: 'Reconoce las señales de que una crisis puede estar comenzando:', examples: ['Pensamientos de hacerme daño', 'Sentirme desesperanzado/a', 'Aislarme de personas cercanas', 'Dejar de cuidarme (no comer, no dormir)', 'Pensar que no hay salida'] },
    { step: '2', title: 'Estrategias internas', desc: 'Cosas que puedo hacer yo solo/a para distraerme:', examples: ['Escuchar música', 'Caminar', 'Escribir en un diario', 'Dibujar o pintar', 'Técnicas de respiración'] },
    { step: '3', title: 'Personas y lugares de distracción', desc: 'Contactar a alguien o ir a un lugar que me ayude:', examples: ['Llamar a un amigo/a', 'Visitar a un familiar', 'Ir a un lugar concurrido', 'Asistir a una actividad social'] },
    { step: '4', title: 'Personas de confianza', desc: 'Con quienes puedo hablar abiertamente sobre mi crisis:', examples: ['Mi terapeuta', 'Familiar de confianza', 'Amigo/a cercano/a', 'Médico de cabecera'] },
    { step: '5', title: 'Profesionales y líneas de crisis', desc: 'Contactos de emergencia:', examples: ['Mi terapeuta: [número de contacto]', 'Emergencias: 911', 'Línea de salud mental: según tu país', 'Sala de urgencias más cercana'] },
    { step: '6', title: 'Hacer el ambiente más seguro', desc: 'Reducir el acceso a medios de riesgo:', examples: ['Guardar medicamentos con un familiar', 'Entregar objetos peligrosos', 'No estar solo/a durante la crisis', 'Desactivar acceso a sitios de riesgo'] },
  ]

  return (
    <div className="space-y-3">
      <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-2xl">
        <p className="font-semibold mb-1">⚠️ Si estás en peligro inmediato</p>
        <p>Llama al número de emergencias de tu país (911 o equivalente) o ve a urgencias.</p>
      </div>
      <div className="bg-[#f0f4f8] text-[#526070] text-sm p-4 rounded-2xl">
        Un plan de seguridad es un conjunto de pasos que te ayudan a mantenerte a salvo. Es mejor completarlo con tu terapeuta.
      </div>
      {steps.map(s => (
        <div key={s.step} className="border border-[#dce5ec] rounded-2xl p-5">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-red-600 font-bold text-sm">{s.step}</span>
            </div>
            <div>
              <p className="font-semibold text-[#0d1b2a] mb-1 text-sm">{s.title}</p>
              <p className="text-xs text-[#526070] mb-2.5">{s.desc}</p>
              <ul className="space-y-1.5">
                {s.examples.map((ex, i) => (
                  <li key={i} className="text-sm text-[#526070] flex items-start gap-2">
                    <span className="text-[#f9a825] mt-0.5 leading-none">•</span>{ex}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Relaxation Techniques ── */
function RelaxationContent() {
  const techniques = [
    { name: 'Respiración 4-7-8', duration: '5 min', level: 'Fácil', desc: 'Activa el sistema nervioso parasimpático y reduce la ansiedad rápidamente.', steps: ['Siéntate con la espalda recta', 'Exhala completamente por la boca', 'Inhala por la nariz contando 4', 'Retén la respiración contando 7', 'Exhala por la boca contando 8', 'Repite el ciclo 3-4 veces'] },
    { name: 'Relajación Muscular Progresiva', duration: '15-20 min', level: 'Moderado', desc: 'Reduce la tensión física que acompaña a la ansiedad tensando y relajando cada grupo muscular.', steps: ['Acuéstate o siéntate cómodamente', 'Cierra los ojos y respira profundo', 'Tensa los pies 5 segundos, luego relaja', 'Sube por pantorrillas, muslos, abdomen, pecho', 'Continúa con brazos, manos, cuello y cara', 'Termina con una respiración profunda'] },
    { name: 'Técnica 5-4-3-2-1 (Grounding)', duration: '5 min', level: 'Fácil', desc: 'Ancla tu mente al presente usando los 5 sentidos. Ideal en momentos de pánico o disociación.', steps: ['5 cosas que puedes VER', '4 cosas que puedes TOCAR', '3 cosas que puedes OÍR', '2 cosas que puedes OLER', '1 cosa que puedes SABOREAR', 'Respira profundo y nota cómo te sientes'] },
    { name: 'Visualización Guiada', duration: '10 min', level: 'Moderado', desc: 'Usa la imaginación para transportarte a un lugar seguro y tranquilo.', steps: ['Siéntate en un lugar tranquilo', 'Cierra los ojos y respira lentamente', 'Imagina un lugar donde te sientas seguro/a', 'Agrega detalles: colores, luz, paisajes', 'Añade sonidos y texturas agradables', 'Permanece 5-10 minutos respirando con calma', 'Vuelve al presente contando del 1 al 5'] },
    { name: 'Respiración de Caja (Box Breathing)', duration: '5 min', level: 'Fácil', desc: 'Usada por militares y atletas para reducir el estrés agudo de forma inmediata.', steps: ['Siéntate erguido/a con los pies en el suelo', 'Exhala todo el aire', 'Inhala contando 4 segundos', 'Mantén el aire 4 segundos', 'Exhala contando 4 segundos', 'Pulmones vacíos 4 segundos', 'Repite 4 veces'] },
  ]

  return (
    <div className="space-y-3">
      <div className="bg-emerald-50 border border-emerald-200/60 text-[#526070] text-sm p-4 rounded-2xl">
        Practica estas técnicas regularmente para mayor efectividad. Son especialmente útiles cuando sientes ansiedad o tensión creciente.
      </div>
      {techniques.map(t => (
        <AccordionItem key={t.name} title={t.name} subtitle={`${t.duration} · ${t.desc}`}>
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${t.level === 'Fácil' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{t.level}</span>
              <span className="text-xs text-[#8096a7]">{t.duration}</span>
            </div>
            <ol className="space-y-2.5">
              {t.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                  <span className="text-[#526070]">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </AccordionItem>
      ))}
    </div>
  )
}

/* ── Main page ── */
export default function ResourcesPage() {
  const [activeResource, setActiveResource] = useState<string | null>(null)

  const resources: Resource[] = [
    { id: 'dbt',        title: 'Habilidades DBT',          subtitle: 'Regulación emocional · Tolerancia al malestar · Mindfulness', icon: Heart,   accent: 'text-purple-600', bg: 'bg-purple-50',  content: <DBTContent /> },
    { id: 'safety',     title: 'Plan de Seguridad',         subtitle: 'Pasos para mantenerte seguro/a en momentos de crisis',         icon: Shield,  accent: 'text-red-600',    bg: 'bg-red-50',     content: <SafetyPlanContent /> },
    { id: 'relaxation', title: 'Técnicas de Relajación',    subtitle: 'Ejercicios para reducir la ansiedad y calmar el sistema nervioso', icon: Wind, accent: 'text-emerald-600', bg: 'bg-emerald-50', content: <RelaxationContent /> },
  ]

  const active = resources.find(r => r.id === activeResource)

  /* ── Detail view ── */
  if (active) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <button
          onClick={() => setActiveResource(null)}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#526070] hover:text-[#194067] transition-colors"
        >
          <ArrowLeft size={16} /> Volver a recursos
        </button>
        <div>
          <div className={`w-14 h-14 ${active.bg} rounded-2xl flex items-center justify-center mb-4`}>
            <active.icon size={26} className={active.accent} />
          </div>
          <h1 className="text-2xl font-bold text-[#0d1b2a] tracking-tight">{active.title}</h1>
          <p className="text-[#526070] text-sm mt-1">{active.subtitle}</p>
        </div>
        {active.content}
      </div>
    )
  }

  /* ── List view ── */
  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      <div className="pt-1">
        <p className="text-xs font-bold text-[#f9a825] uppercase tracking-[0.15em] mb-1.5">Apoyo</p>
        <h1 className="text-3xl font-bold text-[#0d1b2a] tracking-tight">Recursos</h1>
        <p className="text-[#526070] mt-1 text-sm">Material de apoyo para tu bienestar</p>
      </div>

      <div className="grid gap-3">
        {resources.map(r => (
          <button key={r.id} className="text-left w-full" onClick={() => setActiveResource(r.id)}>
            <Card hover className="p-5">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 ${r.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                  <r.icon size={26} className={r.accent} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-base font-bold text-[#0d1b2a]">{r.title}</p>
                  <p className="text-sm text-[#526070] mt-0.5 leading-snug">{r.subtitle}</p>
                </div>
                <div className="w-9 h-9 bg-[#f0f4f8] rounded-xl flex items-center justify-center flex-shrink-0">
                  <ChevronRight size={17} className="text-[#526070]" />
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>

      {/* Affirmation banner */}
      <div className="bg-[#194067] rounded-3xl p-5 sm:p-6 flex items-center gap-4 shadow-[0_8px_32px_rgba(25,64,103,0.2)]">
        <div className="w-10 h-10 bg-[#f9a825] rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_4px_10px_rgba(249,168,37,0.35)]">
          <Star size={18} className="text-[#0d1b2a]" />
        </div>
        <p className="text-white/75 text-sm italic leading-relaxed">
          "El camino hacia el bienestar es un proceso. Cada pequeño paso que das importa."
        </p>
      </div>
    </div>
  )
}
