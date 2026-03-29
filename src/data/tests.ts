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

  BDIII: {
    code: 'BDIII',
    name: 'BDI-II',
    description: 'Inventario de Depresión de Beck II',
    instructions: 'Este cuestionario contiene grupos de afirmaciones. Lea cada grupo y elija la que mejor describe cómo se ha sentido durante las últimas dos semanas, incluyendo el día de hoy.',
    questions: [
      { id: 1, text: 'Tristeza', options: [{ value: 0, label: 'No me siento triste' }, { value: 1, label: 'Me siento triste gran parte del tiempo' }, { value: 2, label: 'Me siento triste continuamente' }, { value: 3, label: 'Me siento tan triste que no puedo soportarlo' }] },
      { id: 2, text: 'Pesimismo', options: [{ value: 0, label: 'No estoy desanimado sobre mi futuro' }, { value: 1, label: 'Me siento más desanimado sobre mi futuro que antes' }, { value: 2, label: 'No espero que las cosas mejoren' }, { value: 3, label: 'Siento que mi futuro es desesperanzador y que las cosas solo empeorarán' }] },
      { id: 3, text: 'Fracaso', options: [{ value: 0, label: 'No me siento fracasado/a' }, { value: 1, label: 'He fracasado más de lo que debería' }, { value: 2, label: 'Cuando miro atrás veo muchos fracasos' }, { value: 3, label: 'Siento que soy un fracaso total como persona' }] },
      { id: 4, text: 'Pérdida de placer', options: [{ value: 0, label: 'Obtengo tanto placer de las cosas como siempre' }, { value: 1, label: 'No disfruto de las cosas tanto como antes' }, { value: 2, label: 'Obtengo muy poco placer de las cosas que solía disfrutar' }, { value: 3, label: 'No puedo obtener ningún placer de las cosas que solía disfrutar' }] },
      { id: 5, text: 'Sentimientos de culpa', options: [{ value: 0, label: 'No me siento particularmente culpable' }, { value: 1, label: 'Me siento culpable de muchas cosas que he hecho o debería haber hecho' }, { value: 2, label: 'Me siento bastante culpable la mayor parte del tiempo' }, { value: 3, label: 'Me siento culpable constantemente' }] },
      { id: 6, text: 'Sentimientos de castigo', options: [{ value: 0, label: 'No creo que esté siendo castigado/a' }, { value: 1, label: 'Siento que podría ser castigado/a' }, { value: 2, label: 'Espero ser castigado/a' }, { value: 3, label: 'Siento que estoy siendo castigado/a' }] },
      { id: 7, text: 'Disconformidad con uno mismo', options: [{ value: 0, label: 'Siento lo mismo que siempre sobre mí mismo/a' }, { value: 1, label: 'He perdido confianza en mí mismo/a' }, { value: 2, label: 'Estoy decepcionado/a conmigo mismo/a' }, { value: 3, label: 'Me odio' }] },
      { id: 8, text: 'Autocrítica', options: [{ value: 0, label: 'No me critico ni me culpo más de lo habitual' }, { value: 1, label: 'Me critico más de lo que solía hacerlo' }, { value: 2, label: 'Me critico por todos mis errores' }, { value: 3, label: 'Me culpo de todo lo malo que me sucede' }] },
      { id: 9, text: 'Pensamientos suicidas', options: [{ value: 0, label: 'No tengo ningún pensamiento de hacerme daño' }, { value: 1, label: 'Tengo pensamientos de hacerme daño pero no los llevaría a cabo' }, { value: 2, label: 'Me gustaría suicidarme' }, { value: 3, label: 'Me suicidaría si tuviera la oportunidad' }] },
      { id: 10, text: 'Llanto', options: [{ value: 0, label: 'No lloro más de lo que solía hacerlo' }, { value: 1, label: 'Lloro más de lo que solía hacerlo' }, { value: 2, label: 'Lloro por cualquier cosa' }, { value: 3, label: 'Siento ganas de llorar constantemente pero no puedo' }] },
      { id: 11, text: 'Agitación', options: [{ value: 0, label: 'No estoy más agitado/a de lo habitual' }, { value: 1, label: 'Me siento más agitado/a de lo habitual' }, { value: 2, label: 'Estoy tan agitado/a que me cuesta quedarme quieto/a' }, { value: 3, label: 'Estoy tan agitado/a que tengo que estar moviéndome constantemente' }] },
      { id: 12, text: 'Pérdida de interés', options: [{ value: 0, label: 'No he perdido el interés en otras personas o actividades' }, { value: 1, label: 'Me intereso menos que antes por otras personas o actividades' }, { value: 2, label: 'He perdido la mayor parte del interés en los demás' }, { value: 3, label: 'Me resulta difícil interesarme en algo' }] },
      { id: 13, text: 'Indecisión', options: [{ value: 0, label: 'Tomo mis decisiones tan bien como siempre' }, { value: 1, label: 'Tomar decisiones me resulta más difícil que antes' }, { value: 2, label: 'Me cuesta mucho más tomar decisiones que antes' }, { value: 3, label: 'Tengo dificultades para tomar cualquier decisión' }] },
      { id: 14, text: 'Inutilidad', options: [{ value: 0, label: 'No me siento inútil' }, { value: 1, label: 'No me siento tan valioso/a como antes' }, { value: 2, label: 'Me siento más inútil comparado con otras personas' }, { value: 3, label: 'Me siento totalmente inútil' }] },
      { id: 15, text: 'Pérdida de energía', options: [{ value: 0, label: 'Tengo tanta energía como siempre' }, { value: 1, label: 'Tengo menos energía de la que solía tener' }, { value: 2, label: 'No tengo suficiente energía para hacer muchas cosas' }, { value: 3, label: 'No tengo energía para hacer nada' }] },
      { id: 16, text: 'Cambios en el sueño', options: [{ value: 0, label: 'No he experimentado cambios en mi sueño' }, { value: 1, label: 'Duermo algo más/menos de lo habitual' }, { value: 2, label: 'Duermo bastante más/menos de lo habitual' }, { value: 3, label: 'Duermo la mayor parte del día / me despierto 1-2 horas antes y no puedo volver a dormir' }] },
      { id: 17, text: 'Irritabilidad', options: [{ value: 0, label: 'No estoy más irritable de lo habitual' }, { value: 1, label: 'Estoy más irritable de lo habitual' }, { value: 2, label: 'Estoy mucho más irritable de lo habitual' }, { value: 3, label: 'Estoy irritable constantemente' }] },
      { id: 18, text: 'Cambios en el apetito', options: [{ value: 0, label: 'No he experimentado cambios en mi apetito' }, { value: 1, label: 'Mi apetito es algo mayor/menor de lo habitual' }, { value: 2, label: 'Mi apetito es bastante mayor/menor de lo habitual' }, { value: 3, label: 'No tengo nada de apetito / tengo mucha más hambre de lo habitual' }] },
      { id: 19, text: 'Dificultad de concentración', options: [{ value: 0, label: 'Puedo concentrarme tan bien como siempre' }, { value: 1, label: 'No puedo concentrarme tan bien como antes' }, { value: 2, label: 'Me cuesta concentrarme durante mucho tiempo' }, { value: 3, label: 'No puedo concentrarme en nada' }] },
      { id: 20, text: 'Cansancio o fatiga', options: [{ value: 0, label: 'No estoy más cansado/a de lo habitual' }, { value: 1, label: 'Me canso más fácilmente de lo habitual' }, { value: 2, label: 'Estoy demasiado cansado/a para hacer muchas cosas' }, { value: 3, label: 'Estoy demasiado cansado/a para hacer la mayoría de cosas' }] },
      { id: 21, text: 'Pérdida de interés en el sexo', options: [{ value: 0, label: 'No he notado cambios en mi interés por el sexo' }, { value: 1, label: 'Me interesa menos el sexo que antes' }, { value: 2, label: 'Me interesa mucho menos el sexo ahora' }, { value: 3, label: 'He perdido completamente el interés en el sexo' }] },
    ],
    scoring: (answers) => {
      const total = Object.values(answers).reduce((s, v) => s + v, 0)
      return { total }
    },
    interpretation: (scores) => {
      const { total } = scores
      if (total >= 29) return { label: 'Depresión grave', color: 'red', description: 'Puntuación 29-63: depresión grave. Se recomienda atención clínica inmediata.' }
      if (total >= 20) return { label: 'Depresión moderada', color: 'yellow', description: 'Puntuación 20-28: depresión moderada. Se recomienda tratamiento.' }
      if (total >= 14) return { label: 'Depresión leve', color: 'yellow', description: 'Puntuación 14-19: depresión leve.' }
      return { label: 'Mínima o sin depresión', color: 'green', description: 'Puntuación 0-13: sin depresión clínicamente significativa.' }
    }
  },

  BAI: {
    code: 'BAI',
    name: 'BAI',
    description: 'Inventario de Ansiedad de Beck',
    instructions: 'A continuación se presenta una lista de síntomas. Indique cuánto le ha molestado cada síntoma durante la última semana.',
    questions: [
      { id: 1, text: 'Entumecimiento u hormigueo', options: likert0to3 },
      { id: 2, text: 'Sensación de calor', options: likert0to3 },
      { id: 3, text: 'Temblor en las piernas', options: likert0to3 },
      { id: 4, text: 'Incapaz de relajarse', options: likert0to3 },
      { id: 5, text: 'Miedo a que suceda lo peor', options: likert0to3 },
      { id: 6, text: 'Mareos o sensación de desmayo', options: likert0to3 },
      { id: 7, text: 'Palpitaciones o aceleración del corazón', options: likert0to3 },
      { id: 8, text: 'Sensación de inestabilidad o falta de equilibrio', options: likert0to3 },
      { id: 9, text: 'Terrorizado/a o espantado/a', options: likert0to3 },
      { id: 10, text: 'Nerviosismo', options: likert0to3 },
      { id: 11, text: 'Sensación de ahogo', options: likert0to3 },
      { id: 12, text: 'Temblores en las manos', options: likert0to3 },
      { id: 13, text: 'Cuerpo tembloroso o estremecido', options: likert0to3 },
      { id: 14, text: 'Miedo a perder el control', options: likert0to3 },
      { id: 15, text: 'Dificultad para respirar', options: likert0to3 },
      { id: 16, text: 'Miedo a morir', options: likert0to3 },
      { id: 17, text: 'Asustado/a', options: likert0to3 },
      { id: 18, text: 'Indigestión o molestia abdominal', options: likert0to3 },
      { id: 19, text: 'Sensación de desmayo o mareo', options: likert0to3 },
      { id: 20, text: 'Cara enrojecida', options: likert0to3 },
      { id: 21, text: 'Sudoración (no debida al calor)', options: likert0to3 },
    ],
    scoring: (answers) => {
      const total = Object.values(answers).reduce((s, v) => s + v, 0)
      return { total }
    },
    interpretation: (scores) => {
      const { total } = scores
      if (total >= 26) return { label: 'Ansiedad grave', color: 'red', description: 'Puntuación 26-63: ansiedad grave.' }
      if (total >= 16) return { label: 'Ansiedad moderada', color: 'yellow', description: 'Puntuación 16-25: ansiedad moderada.' }
      if (total >= 8) return { label: 'Ansiedad leve', color: 'yellow', description: 'Puntuación 8-15: ansiedad leve.' }
      return { label: 'Ansiedad mínima', color: 'green', description: 'Puntuación 0-7: ansiedad mínima.' }
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
