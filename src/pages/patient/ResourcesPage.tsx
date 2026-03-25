import { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { BookOpen, Shield, Wind, Heart, ChevronRight, Star, ArrowLeft } from 'lucide-react'

interface Resource {
  id: string
  title: string
  subtitle: string
  icon: typeof BookOpen
  color: string
  iconColor: string
  borderColor: string
  content: React.ReactNode
}

function DBTContent() {
  const skills = [
    {
      category: 'TIPP',
      description: 'Cambia tu química corporal rápidamente',
      items: [
        { name: 'T - Temperatura', desc: 'Sumerge tu cara en agua fría por 30 segundos o sostén hielo. Esto activa el reflejo de buceo y ralentiza tu corazón.' },
        { name: 'I - Ejercicio Intenso', desc: 'Corre, haz saltos de tijera, o ejercicio intenso por 20 minutos. Quema la adrenalina del cuerpo.' },
        { name: 'P - Respiración pausada', desc: 'Inhala 4 segundos, retén 4, exhala 6-8 segundos. Activa el sistema nervioso parasimpático.' },
        { name: 'P - Relajación Muscular Progresiva', desc: 'Tensa cada grupo muscular 5 segundos y luego relájalo, comenzando por los pies hacia arriba.' },
      ]
    },
    {
      category: 'ACCEPTS',
      description: 'Distracción con actividades saludables',
      items: [
        { name: 'A - Actividades', desc: 'Haz algo que requiera tu atención: cocinar, leer, jugar, limpiar.' },
        { name: 'C - Contribuir', desc: 'Ayuda a alguien más. Envía un mensaje amable, volunteering, pequeños actos de bondad.' },
        { name: 'C - Comparaciones', desc: 'Compárate con cómo estabas antes o con personas que tienen más dificultades.' },
        { name: 'E - Emociones opuestas', desc: 'Ve una película cómica si estás triste, música alegre si estás ansioso/a.' },
        { name: 'P - Pensar en otras cosas', desc: 'Cuenta hacia atrás de 3 en 3 desde 100, repite los estados del país, recuerda letras de canciones.' },
        { name: 'T - Sensaciones fuertes', desc: 'Sostén un cubo de hielo, come algo muy ácido, escucha música muy fuerte.' },
        { name: 'S - Empujarte hacia afuera', desc: 'Sal de tu espacio, cambia de ambiente, ve a un lugar público.' },
      ]
    },
    {
      category: 'PLEASE',
      description: 'Cuida tu salud física para mejorar tu salud emocional',
      items: [
        { name: 'PL - Trata enfermedades', desc: 'Atiende tus problemas físicos de salud. Visita al médico cuando sea necesario.' },
        { name: 'E - Alimentación equilibrada', desc: 'Come a horas regulares, evita saltarte comidas y mantén una dieta balanceada.' },
        { name: 'A - Evita sustancias', desc: 'Evita alcohol, drogas y cafeína en exceso que alteren tu estado emocional.' },
        { name: 'S - Sueño equilibrado', desc: 'Mantén un horario de sueño regular. Dormir entre 7-9 horas mejora la regulación emocional.' },
        { name: 'E - Ejercicio regular', desc: 'Realiza actividad física al menos 20 minutos al día. El ejercicio reduce el estrés y mejora el ánimo.' },
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

  const [openCat, setOpenCat] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 bg-indigo-50 p-4 rounded-xl">
        La Terapia Dialéctica Conductual (DBT) es una terapia cognitivo-conductual que te ayuda a regular emociones intensas. Estas habilidades pueden usarse en momentos de crisis.
      </p>
      {skills.map(cat => (
        <div key={cat.category} className="border border-gray-100 rounded-xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            onClick={() => setOpenCat(openCat === cat.category ? null : cat.category)}
          >
            <div className="text-left">
              <p className="font-semibold text-gray-900">{cat.category}</p>
              <p className="text-xs text-gray-500">{cat.description}</p>
            </div>
            <ChevronRight size={18} className={`text-gray-400 transition-transform ${openCat === cat.category ? 'rotate-90' : ''}`} />
          </button>
          {openCat === cat.category && (
            <div className="border-t border-gray-100 divide-y divide-gray-50">
              {cat.items.map(item => (
                <div key={item.name} className="p-4">
                  <p className="font-medium text-sm text-gray-900 mb-1">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function SafetyPlanContent() {
  const steps = [
    {
      step: '1',
      title: 'Señales de alerta',
      desc: 'Reconoce las señales de que una crisis puede estar comenzando:',
      examples: ['Pensamientos de hacerme daño', 'Sentirme desesperanzado/a', 'Aislarme de personas cercanas', 'Dejar de cuidarme (no comer, no dormir)', 'Pensar que no hay salida']
    },
    {
      step: '2',
      title: 'Estrategias de afrontamiento internas',
      desc: 'Cosas que puedo hacer yo solo/a para distraerme:',
      examples: ['Escuchar música', 'Caminar', 'Escribir en un diario', 'Dibujar o pintar', 'Hacer ejercicio', 'Técnicas de respiración']
    },
    {
      step: '3',
      title: 'Personas y lugares que me distraen',
      desc: 'Contactar a alguien o ir a un lugar que me ayude:',
      examples: ['Llamar a un amigo/a', 'Visitar a un familiar', 'Ir a un lugar público concurrido', 'Asistir a una actividad social']
    },
    {
      step: '4',
      title: 'Personas a quienes puedo pedir ayuda',
      desc: 'Hablar abiertamente sobre mi crisis:',
      examples: ['Mi terapeuta', 'Familiar de confianza', 'Amigo/a cercano/a', 'Médico de cabecera']
    },
    {
      step: '5',
      title: 'Profesionales y líneas de crisis',
      desc: 'Contactos de emergencia:',
      examples: ['Mi terapeuta: [número de contacto]', 'Servicios de emergencias: 911', 'Línea de salud mental: según tu país', 'Sala de urgencias del hospital más cercano']
    },
    {
      step: '6',
      title: 'Hacer el ambiente más seguro',
      desc: 'Reducir el acceso a medios letales:',
      examples: ['Guardar medicamentos con un familiar', 'Entregar objetos peligrosos a alguien de confianza', 'No estar solo/a durante la crisis', 'Desactivar acceso a sitios que aumenten el riesgo']
    }
  ]

  return (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl">
        <p className="font-semibold mb-1">⚠️ Si estás en peligro inmediato</p>
        <p>Llama al número de emergencias de tu país (911 o equivalente) o ve a la sala de urgencias más cercana.</p>
      </div>
      <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
        Un plan de seguridad es un conjunto de pasos que te ayudan a mantenerte a salvo cuando tienes pensamientos de suicidio. Es mejor completarlo con tu terapeuta.
      </p>
      {steps.map(s => (
        <div key={s.step} className="border border-gray-100 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-red-600 font-bold text-sm">{s.step}</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">{s.title}</p>
              <p className="text-sm text-gray-500 mb-2">{s.desc}</p>
              <ul className="space-y-1">
                {s.examples.map((ex, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5">•</span>{ex}
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

function RelaxationContent() {
  const techniques = [
    {
      name: 'Respiración 4-7-8',
      duration: '5 minutos',
      level: 'Fácil',
      desc: 'Esta técnica activa el sistema nervioso parasimpático y reduce la ansiedad rápidamente.',
      steps: [
        'Siéntate en una posición cómoda con la espalda recta',
        'Exhala completamente por la boca',
        'Cierra la boca e inhala silenciosamente por la nariz contando 4',
        'Retén la respiración contando hasta 7',
        'Exhala completamente por la boca contando hasta 8',
        'Repite el ciclo 3-4 veces',
      ]
    },
    {
      name: 'Relajación Muscular Progresiva',
      duration: '15-20 minutos',
      level: 'Moderado',
      desc: 'Reduce la tensión física que acompaña a la ansiedad tensando y relajando cada grupo muscular.',
      steps: [
        'Acuéstate o siéntate cómodamente',
        'Cierra los ojos y respira profundo',
        'Comienza por los pies: tensiona los músculos 5 segundos',
        'Relaja completamente y siente la diferencia por 10 segundos',
        'Sube por las pantorrillas, muslos, abdomen, pecho',
        'Continúa con brazos, manos, cuello y cara',
        'Termina con una respiración profunda y 2 minutos de descanso',
      ]
    },
    {
      name: 'Técnica 5-4-3-2-1 (Grounding)',
      duration: '5 minutos',
      level: 'Fácil',
      desc: 'Ancla tu mente al presente usando los 5 sentidos. Muy útil en momentos de pánico o disociación.',
      steps: [
        '5 cosas que puedes VER a tu alrededor',
        '4 cosas que puedes TOCAR (toca cada una)',
        '3 cosas que puedes OÍR en este momento',
        '2 cosas que puedes OLER',
        '1 cosa que puedes SABOREAR',
        'Respira profundo y nota cómo te sientes ahora',
      ]
    },
    {
      name: 'Visualización Guiada',
      duration: '10 minutos',
      level: 'Moderado',
      desc: 'Usa la imaginación para transportarte a un lugar seguro y tranquilo.',
      steps: [
        'Siéntate o acuéstate en un lugar tranquilo',
        'Cierra los ojos y respira lentamente',
        'Imagina un lugar donde te sientas completamente seguro/a (playa, bosque, habitación favorita)',
        'Agrega detalles visuales: colores, luz, paisajes',
        'Añade sonidos: olas del mar, viento entre árboles, silencio tranquilo',
        'Siente la temperatura, texturas agradables',
        'Permanece en ese lugar durante 5-10 minutos respirando con calma',
        'Vuelve gradualmente al presente contando del 1 al 5',
      ]
    },
    {
      name: 'Respiración de Caja (Box Breathing)',
      duration: '5 minutos',
      level: 'Fácil',
      desc: 'Técnica usada por militares y atletas para reducir el estrés agudo.',
      steps: [
        'Siéntate erguido/a con los pies en el suelo',
        'Exhala todo el aire de tus pulmones',
        'Inhala lentamente contando 4 segundos',
        'Mantén el aire contando 4 segundos',
        'Exhala lentamente contando 4 segundos',
        'Mantén los pulmones vacíos contando 4 segundos',
        'Repite 4 veces',
      ]
    },
  ]

  const [open, setOpen] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 bg-green-50 p-4 rounded-xl">
        Estas técnicas ayudan a calmar el sistema nervioso y reducir la ansiedad. Practícalas regularmente para mayor efectividad.
      </p>
      {techniques.map(t => (
        <div key={t.name} className="border border-gray-100 rounded-xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            onClick={() => setOpen(open === t.name ? null : t.name)}
          >
            <div className="text-left flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-semibold text-gray-900">{t.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${t.level === 'Fácil' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{t.level}</span>
                <span className="text-xs text-gray-400">{t.duration}</span>
              </div>
              <p className="text-xs text-gray-500">{t.desc}</p>
            </div>
            <ChevronRight size={18} className={`text-gray-400 transition-transform flex-shrink-0 ml-2 ${open === t.name ? 'rotate-90' : ''}`} />
          </button>
          {open === t.name && (
            <div className="border-t border-gray-100 p-4">
              <ol className="space-y-2">
                {t.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function ResourcesPage() {
  const [activeResource, setActiveResource] = useState<string | null>(null)

  const resources: Resource[] = [
    {
      id: 'dbt',
      title: 'Habilidades DBT',
      subtitle: 'Regulación emocional · Tolerancia al malestar · Mindfulness',
      icon: Heart,
      color: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200',
      content: <DBTContent />,
    },
    {
      id: 'safety',
      title: 'Plan de Seguridad',
      subtitle: 'Pasos para mantenerte seguro/a en momentos de crisis',
      icon: Shield,
      color: 'bg-red-50',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200',
      content: <SafetyPlanContent />,
    },
    {
      id: 'relaxation',
      title: 'Técnicas de Relajación',
      subtitle: 'Ejercicios para reducir la ansiedad y calmar el sistema nervioso',
      icon: Wind,
      color: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
      content: <RelaxationContent />,
    },
  ]

  const active = resources.find(r => r.id === activeResource)

  if (active) {
    return (
      <div className="max-w-2xl mx-auto">
        <button onClick={() => setActiveResource(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-6">
          <ArrowLeft size={16} /> Volver a recursos
        </button>
        <div className="mb-6">
          <div className={`w-12 h-12 ${active.color} rounded-2xl flex items-center justify-center mb-3`}>
            <active.icon size={24} className={active.iconColor} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{active.title}</h1>
          <p className="text-gray-500 text-sm mt-1">{active.subtitle}</p>
        </div>
        {active.content}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Recursos</h1>
        <p className="text-gray-500 text-sm mt-1">Material de apoyo para tu bienestar</p>
      </div>

      <div className="grid gap-4">
        {resources.map(r => (
          <button key={r.id} className="text-left" onClick={() => setActiveResource(r.id)}>
            <Card className={`p-5 hover:shadow-md transition-all border-2 ${r.borderColor} hover:scale-[1.01]`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 ${r.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                  <r.icon size={28} className={r.iconColor} />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-900">{r.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{r.subtitle}</p>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </Card>
          </button>
        ))}
      </div>

      {/* Affirmation */}
      <Card className="mt-6 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
        <div className="flex items-center gap-3">
          <Star size={20} className="text-indigo-500 flex-shrink-0" />
          <p className="text-sm text-indigo-800 italic">
            "El camino hacia el bienestar es un proceso. Cada pequeño paso que das importa."
          </p>
        </div>
      </Card>
    </div>
  )
}
