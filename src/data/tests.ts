export interface TestDefinition {
  code: string
  name: string
  description: string
  instructions: string
  questions: {
    id: number
    text: string
    subscale?: string
    options: { value: number; label: string }[]
  }[]
  scoring: (answers: Record<number, number>) => Record<string, number>
  interpretation: (scores: Record<string, number>) => { label: string; color: string; description: string }
}

const likert0to3 = [
  { value: 0, label: 'Nunca' },
  { value: 1, label: 'A veces' },
  { value: 2, label: 'Bastante' },
  { value: 3, label: 'Siempre' },
]

const likert0to4 = [
  { value: 0, label: 'Nada' },
  { value: 1, label: 'Un poco' },
  { value: 2, label: 'Moderadamente' },
  { value: 3, label: 'Bastante' },
  { value: 4, label: 'Extremadamente' },
]

export const TESTS: Record<string, TestDefinition> = {
  DASS21: {
    code: 'DASS21',
    name: 'DASS-21',
    description: 'Escala de Depresión, Ansiedad y Estrés',
    instructions: 'Por favor, lea cada enunciado y marque la opción que indica cuánto le ha aplicado cada situación durante la última semana.',
    questions: [
      { id: 1, text: 'Me costó mucho relajarme.', subscale: 'stress', options: likert0to3 },
      { id: 2, text: 'Me di cuenta que tenía la boca seca.', subscale: 'anxiety', options: likert0to3 },
      { id: 3, text: 'No podía sentir ningún sentimiento positivo.', subscale: 'depression', options: likert0to3 },
      { id: 4, text: 'Tuve dificultad en respirar (ej. respiración excesivamente rápida, falta de aliento sin haber hecho esfuerzo físico).', subscale: 'anxiety', options: likert0to3 },
      { id: 5, text: 'Me costó mucho tomar la iniciativa para hacer cosas.', subscale: 'depression', options: likert0to3 },
      { id: 6, text: 'Reaccioné de manera exagerada en ciertas situaciones.', subscale: 'stress', options: likert0to3 },
      { id: 7, text: 'Sentí que me temblaban las manos.', subscale: 'anxiety', options: likert0to3 },
      { id: 8, text: 'Sentí que estaba usando mucha energía nerviosa.', subscale: 'stress', options: likert0to3 },
      { id: 9, text: 'Estaba preocupado/a por situaciones en las que podría entrar en pánico o en las que podría hacer el ridículo.', subscale: 'anxiety', options: likert0to3 },
      { id: 10, text: 'Sentí que no tenía nada por qué vivir.', subscale: 'depression', options: likert0to3 },
      { id: 11, text: 'Noté que me agitaba.', subscale: 'stress', options: likert0to3 },
      { id: 12, text: 'Me costó mucho relajarme.', subscale: 'stress', options: likert0to3 },
      { id: 13, text: 'Me sentí triste y deprimido/a.', subscale: 'depression', options: likert0to3 },
      { id: 14, text: 'Me molestó que algo me impidiera seguir con lo que estaba haciendo.', subscale: 'stress', options: likert0to3 },
      { id: 15, text: 'Sentí que estaba al punto de pánico.', subscale: 'anxiety', options: likert0to3 },
      { id: 16, text: 'No me pude entusiasmar con nada.', subscale: 'depression', options: likert0to3 },
      { id: 17, text: 'Sentí que como persona no valía mucho.', subscale: 'depression', options: likert0to3 },
      { id: 18, text: 'Sentí que estaba muy irritable.', subscale: 'stress', options: likert0to3 },
      { id: 19, text: 'Sentí los latidos de mi corazón a pesar de no haber hecho ningún esfuerzo físico.', subscale: 'anxiety', options: likert0to3 },
      { id: 20, text: 'Tuve miedo sin razón.', subscale: 'anxiety', options: likert0to3 },
      { id: 21, text: 'Sentí que la vida no tenía ningún sentido.', subscale: 'depression', options: likert0to3 },
    ],
    scoring: (answers) => {
      const depression = [3, 5, 10, 13, 16, 17, 21].reduce((s, id) => s + (answers[id] ?? 0), 0) * 2
      const anxiety = [2, 4, 7, 9, 15, 19, 20].reduce((s, id) => s + (answers[id] ?? 0), 0) * 2
      const stress = [1, 6, 8, 11, 12, 14, 18].reduce((s, id) => s + (answers[id] ?? 0), 0) * 2
      return { depression, anxiety, stress, total: depression + anxiety + stress }
    },
    interpretation: (scores) => {
      const { depression, anxiety, stress } = scores
      const levels = []
      if (depression >= 28) levels.push('Depresión extremadamente severa')
      else if (depression >= 21) levels.push('Depresión severa')
      else if (depression >= 14) levels.push('Depresión moderada')
      else if (depression >= 10) levels.push('Depresión leve')
      if (anxiety >= 20) levels.push('Ansiedad extremadamente severa')
      else if (anxiety >= 15) levels.push('Ansiedad severa')
      else if (anxiety >= 10) levels.push('Ansiedad moderada')
      else if (anxiety >= 8) levels.push('Ansiedad leve')
      if (stress >= 34) levels.push('Estrés extremadamente severo')
      else if (stress >= 26) levels.push('Estrés severo')
      else if (stress >= 19) levels.push('Estrés moderado')
      else if (stress >= 15) levels.push('Estrés leve')
      const isHigh = depression >= 21 || anxiety >= 15 || stress >= 26
      const isMod = depression >= 14 || anxiety >= 10 || stress >= 19
      return {
        label: levels.length === 0 ? 'Normal' : levels.join(', '),
        color: isHigh ? 'red' : isMod ? 'yellow' : 'green',
        description: levels.length === 0
          ? 'Los puntajes están dentro del rango normal.'
          : `Se observa: ${levels.join('; ')}.`
      }
    }
  },

  DERS: {
    code: 'DERS',
    name: 'DERS-16',
    description: 'Escala de Dificultades en la Regulación Emocional (versión corta)',
    instructions: 'Indique con qué frecuencia se aplican a usted las siguientes afirmaciones.',
    questions: [
      { id: 1, text: 'Cuando estoy molesto/a, reconozco mis emociones.', subscale: 'awareness', options: [{ value: 5, label: 'Casi nunca' }, { value: 4, label: 'A veces' }, { value: 3, label: 'La mitad del tiempo' }, { value: 2, label: 'La mayoría del tiempo' }, { value: 1, label: 'Casi siempre' }] },
      { id: 2, text: 'Cuando estoy molesto/a, me es difícil concentrarme.', subscale: 'goals', options: [{ value: 1, label: 'Casi nunca' }, { value: 2, label: 'A veces' }, { value: 3, label: 'La mitad del tiempo' }, { value: 4, label: 'La mayoría del tiempo' }, { value: 5, label: 'Casi siempre' }] },
      { id: 3, text: 'Cuando estoy molesto/a, no me quedo quieto/a.', subscale: 'impulse', options: [{ value: 1, label: 'Casi nunca' }, { value: 2, label: 'A veces' }, { value: 3, label: 'La mitad del tiempo' }, { value: 4, label: 'La mayoría del tiempo' }, { value: 5, label: 'Casi siempre' }] },
      { id: 4, text: 'Cuando estoy molesto/a, tengo conciencia de mis emociones.', subscale: 'awareness', options: [{ value: 5, label: 'Casi nunca' }, { value: 4, label: 'A veces' }, { value: 3, label: 'La mitad del tiempo' }, { value: 2, label: 'La mayoría del tiempo' }, { value: 1, label: 'Casi siempre' }] },
      { id: 5, text: 'Cuando estoy molesto/a, me cuesta trabajo pensar en cualquier otra cosa.', subscale: 'goals', options: [{ value: 1, label: 'Casi nunca' }, { value: 2, label: 'A veces' }, { value: 3, label: 'La mitad del tiempo' }, { value: 4, label: 'La mayoría del tiempo' }, { value: 5, label: 'Casi siempre' }] },
      { id: 6, text: 'Cuando estoy molesto/a, me siento abrumado/a.', subscale: 'strategies', options: [{ value: 1, label: 'Casi nunca' }, { value: 2, label: 'A veces' }, { value: 3, label: 'La mitad del tiempo' }, { value: 4, label: 'La mayoría del tiempo' }, { value: 5, label: 'Casi siempre' }] },
      { id: 7, text: 'Cuando estoy molesto/a, me avergüenzo de sentirme así.', subscale: 'nonacceptance', options: [{ value: 1, label: 'Casi nunca' }, { value: 2, label: 'A veces' }, { value: 3, label: 'La mitad del tiempo' }, { value: 4, label: 'La mayoría del tiempo' }, { value: 5, label: 'Casi siempre' }] },
      { id: 8, text: 'Cuando estoy molesto/a, sé que puedo encontrar la forma de sentirme mejor.', subscale: 'strategies', options: [{ value: 5, label: 'Casi nunca' }, { value: 4, label: 'A veces' }, { value: 3, label: 'La mitad del tiempo' }, { value: 2, label: 'La mayoría del tiempo' }, { value: 1, label: 'Casi siempre' }] },
      { id: 9, text: 'Cuando estoy molesto/a, me siento culpable por sentirme así.', subscale: 'nonacceptance', options: [{ value: 1, label: 'Casi nunca' }, { value: 2, label: 'A veces' }, { value: 3, label: 'La mitad del tiempo' }, { value: 4, label: 'La mayoría del tiempo' }, { value: 5, label: 'Casi siempre' }] },
      { id: 10, text: 'Cuando estoy molesto/a, tengo dificultades para hacer el trabajo.', subscale: 'goals', options: [{ value: 1, label: 'Casi nunca' }, { value: 2, label: 'A veces' }, { value: 3, label: 'La mitad del tiempo' }, { value: 4, label: 'La mayoría del tiempo' }, { value: 5, label: 'Casi siempre' }] },
      { id: 11, text: 'Cuando estoy molesto/a, no puedo controlarme.', subscale: 'impulse', options: [{ value: 1, label: 'Casi nunca' }, { value: 2, label: 'A veces' }, { value: 3, label: 'La mitad del tiempo' }, { value: 4, label: 'La mayoría del tiempo' }, { value: 5, label: 'Casi siempre' }] },
      { id: 12, text: 'Cuando estoy molesto/a, mis emociones se sienten abrumadoras.', subscale: 'clarity', options: [{ value: 1, label: 'Casi nunca' }, { value: 2, label: 'A veces' }, { value: 3, label: 'La mitad del tiempo' }, { value: 4, label: 'La mayoría del tiempo' }, { value: 5, label: 'Casi siempre' }] },
      { id: 13, text: 'Cuando estoy molesto/a, me preocupo de no ser capaz de controlarme.', subscale: 'impulse', options: [{ value: 1, label: 'Casi nunca' }, { value: 2, label: 'A veces' }, { value: 3, label: 'La mitad del tiempo' }, { value: 4, label: 'La mayoría del tiempo' }, { value: 5, label: 'Casi siempre' }] },
      { id: 14, text: 'Cuando estoy molesto/a, nada me ayuda a sentirme mejor.', subscale: 'strategies', options: [{ value: 1, label: 'Casi nunca' }, { value: 2, label: 'A veces' }, { value: 3, label: 'La mitad del tiempo' }, { value: 4, label: 'La mayoría del tiempo' }, { value: 5, label: 'Casi siempre' }] },
      { id: 15, text: 'Cuando estoy molesto/a, me molesto conmigo mismo/a por sentirme así.', subscale: 'nonacceptance', options: [{ value: 1, label: 'Casi nunca' }, { value: 2, label: 'A veces' }, { value: 3, label: 'La mitad del tiempo' }, { value: 4, label: 'La mayoría del tiempo' }, { value: 5, label: 'Casi siempre' }] },
      { id: 16, text: 'Cuando estoy molesto/a, creo que quedarme así es algo malo.', subscale: 'nonacceptance', options: [{ value: 1, label: 'Casi nunca' }, { value: 2, label: 'A veces' }, { value: 3, label: 'La mitad del tiempo' }, { value: 4, label: 'La mayoría del tiempo' }, { value: 5, label: 'Casi siempre' }] },
    ],
    scoring: (answers) => {
      const total = Object.values(answers).reduce((s, v) => s + v, 0)
      return { total }
    },
    interpretation: (scores) => {
      const { total } = scores
      if (total >= 59) return { label: 'Dificultades severas', color: 'red', description: 'Dificultades severas en la regulación emocional.' }
      if (total >= 43) return { label: 'Dificultades moderadas', color: 'yellow', description: 'Dificultades moderadas en la regulación emocional.' }
      return { label: 'Sin dificultades significativas', color: 'green', description: 'Sin dificultades significativas en la regulación emocional.' }
    }
  },

  AAQII: {
    code: 'AAQII',
    name: 'AAQ-II',
    description: 'Cuestionario de Aceptación y Acción II (Flexibilidad/Inflexibilidad Psicológica)',
    instructions: 'A continuación encontrará una lista de afirmaciones. Por favor puntúe el grado en que cada afirmación es verdadera para usted.',
    questions: [
      { id: 1, text: 'Mis experiencias y recuerdos dolorosos me hacen difícil vivir la vida que quiero llevar.', options: [{ value: 1, label: 'Nunca verdadero' }, { value: 2, label: 'Muy raramente verdadero' }, { value: 3, label: 'Raramente verdadero' }, { value: 4, label: 'A veces verdadero' }, { value: 5, label: 'Frecuentemente verdadero' }, { value: 6, label: 'Casi siempre verdadero' }, { value: 7, label: 'Siempre verdadero' }] },
      { id: 2, text: 'Me preocupa no ser capaz de controlar mis preocupaciones y sentimientos.', options: [{ value: 1, label: 'Nunca verdadero' }, { value: 2, label: 'Muy raramente verdadero' }, { value: 3, label: 'Raramente verdadero' }, { value: 4, label: 'A veces verdadero' }, { value: 5, label: 'Frecuentemente verdadero' }, { value: 6, label: 'Casi siempre verdadero' }, { value: 7, label: 'Siempre verdadero' }] },
      { id: 3, text: 'Tengo miedo de mis sentimientos.', options: [{ value: 1, label: 'Nunca verdadero' }, { value: 2, label: 'Muy raramente verdadero' }, { value: 3, label: 'Raramente verdadero' }, { value: 4, label: 'A veces verdadero' }, { value: 5, label: 'Frecuentemente verdadero' }, { value: 6, label: 'Casi siempre verdadero' }, { value: 7, label: 'Siempre verdadero' }] },
      { id: 4, text: 'Me dejo llevar por mis sentimientos.', options: [{ value: 1, label: 'Nunca verdadero' }, { value: 2, label: 'Muy raramente verdadero' }, { value: 3, label: 'Raramente verdadero' }, { value: 4, label: 'A veces verdadero' }, { value: 5, label: 'Frecuentemente verdadero' }, { value: 6, label: 'Casi siempre verdadero' }, { value: 7, label: 'Siempre verdadero' }] },
      { id: 5, text: 'Mis pensamientos y sentimientos son un obstáculo en mi vida.', options: [{ value: 1, label: 'Nunca verdadero' }, { value: 2, label: 'Muy raramente verdadero' }, { value: 3, label: 'Raramente verdadero' }, { value: 4, label: 'A veces verdadero' }, { value: 5, label: 'Frecuentemente verdadero' }, { value: 6, label: 'Casi siempre verdadero' }, { value: 7, label: 'Siempre verdadero' }] },
      { id: 6, text: 'Mis pensamientos y sentimientos me resultan muy molestos y no puedo controlar cuánto influyen en mi vida.', options: [{ value: 1, label: 'Nunca verdadero' }, { value: 2, label: 'Muy raramente verdadero' }, { value: 3, label: 'Raramente verdadero' }, { value: 4, label: 'A veces verdadero' }, { value: 5, label: 'Frecuentemente verdadero' }, { value: 6, label: 'Casi siempre verdadero' }, { value: 7, label: 'Siempre verdadero' }] },
      { id: 7, text: 'Cuando me siento mal, me preocupa que yo esté "enganchado/a" a mis pensamientos y sentimientos.', options: [{ value: 1, label: 'Nunca verdadero' }, { value: 2, label: 'Muy raramente verdadero' }, { value: 3, label: 'Raramente verdadero' }, { value: 4, label: 'A veces verdadero' }, { value: 5, label: 'Frecuentemente verdadero' }, { value: 6, label: 'Casi siempre verdadero' }, { value: 7, label: 'Siempre verdadero' }] },
    ],
    scoring: (answers) => {
      const total = Object.values(answers).reduce((s, v) => s + v, 0)
      return { total }
    },
    interpretation: (scores) => {
      const { total } = scores
      if (total >= 28) return { label: 'Inflexibilidad psicológica alta', color: 'red', description: 'Puntuación alta indica mayor evitación experiencial e inflexibilidad psicológica.' }
      if (total >= 18) return { label: 'Inflexibilidad psicológica moderada', color: 'yellow', description: 'Puntuación moderada en evitación experiencial.' }
      return { label: 'Flexibilidad psicológica adecuada', color: 'green', description: 'Buena flexibilidad psicológica y aceptación.' }
    }
  },

  BSL23: {
    code: 'BSL23',
    name: 'BSL-23',
    description: 'Lista de Síntomas del Trastorno Límite de Personalidad',
    instructions: 'Por favor indique cómo se ha sentido durante la última semana. Responda marcando el número correspondiente.',
    questions: Array.from({ length: 23 }, (_, i) => ({
      id: i + 1,
      text: [
        'Estar solo/a me resultó muy difícil de soportar.',
        'Me sentí sin valor.',
        'Estuve enojado/a.',
        'Me sentí avergonzado/a o humillado/a.',
        'Estuve deprimido/a.',
        'Tuve dificultades con la memoria.',
        'Me lastimé a propósito (ej. cortarme, golpearme, quemarme).',
        'Tuve pensamientos de suicidio.',
        'Me sentí vacío/a.',
        'Sentí que era responsable de todo lo malo que sucedió.',
        'Me sentí disociado/a.',
        'Me pareció difícil soportar el paso del tiempo.',
        'Me sentí como si estuviera viviendo en una montaña rusa emocional.',
        'No fui capaz de tolerar situaciones de estrés.',
        'Tuve cambios de humor repentinos e impredecibles.',
        'Tuve pensamientos de hacerme daño.',
        'Me sentí incomprendido/a.',
        'Mis relaciones personales fueron inestables.',
        'No supe quién soy realmente o qué quiero.',
        'Me sentí muy impulsivo/a.',
        'Tuve miedo de ser abandonado/a.',
        'Me preocupé demasiado.',
        'Me sentí profundamente inseguro/a.',
      ][i],
      options: likert0to4
    })),
    scoring: (answers) => {
      const total = Object.values(answers).reduce((s, v) => s + v, 0)
      const mean = total / 23
      return { total, mean: Math.round(mean * 100) / 100 }
    },
    interpretation: (scores) => {
      const { mean } = scores
      if (mean >= 2.5) return { label: 'Sintomatología severa', color: 'red', description: 'Puntuación elevada. Se recomienda evaluación clínica detallada.' }
      if (mean >= 1.5) return { label: 'Sintomatología moderada', color: 'yellow', description: 'Puntuación moderada en síntomas de TLP.' }
      return { label: 'Sintomatología leve o ausente', color: 'green', description: 'Puntuación baja en síntomas de TLP.' }
    }
  },
}
