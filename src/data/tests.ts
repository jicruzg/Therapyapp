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

  PCL5: {
    code: 'PCL5',
    name: 'PCL-5',
    description: 'Lista Checable de Trastorno por Estrés Postraumático (DSM-5)',
    instructions: 'A continuación se presentan problemas que las personas a veces tienen en respuesta a una experiencia muy estresante. Por favor lea cada problema y seleccione cuánto le ha molestado en el último mes.',
    questions: [
      { id: 1, text: 'Recuerdos repetidos, perturbadores e involuntarios de la experiencia estresante', subscale: 'intrusion', options: likert0to4 },
      { id: 2, text: 'Sueños perturbadores repetidos de la experiencia estresante', subscale: 'intrusion', options: likert0to4 },
      { id: 3, text: 'Sentirse o actuar de repente como si la experiencia estresante estuviera ocurriendo de nuevo (como si la estuviera reviviendo)', subscale: 'intrusion', options: likert0to4 },
      { id: 4, text: 'Sentirse muy molesto/a cuando algo le recuerda la experiencia estresante', subscale: 'intrusion', options: likert0to4 },
      { id: 5, text: 'Tener reacciones físicas fuertes cuando algo le recuerda la experiencia estresante (palpitaciones, dificultad para respirar, sudoración)', subscale: 'intrusion', options: likert0to4 },
      { id: 6, text: 'Evitar recuerdos, pensamientos o sentimientos relacionados con la experiencia estresante', subscale: 'avoidance', options: likert0to4 },
      { id: 7, text: 'Evitar recordatorios externos de la experiencia estresante (personas, lugares, conversaciones, actividades, objetos o situaciones)', subscale: 'avoidance', options: likert0to4 },
      { id: 8, text: 'Dificultad para recordar partes importantes de la experiencia estresante', subscale: 'cognition', options: likert0to4 },
      { id: 9, text: 'Tener creencias negativas fuertes sobre usted mismo/a, otras personas o el mundo', subscale: 'cognition', options: likert0to4 },
      { id: 10, text: 'Culparse a sí mismo/a o a otros de la experiencia estresante o de sus consecuencias', subscale: 'cognition', options: likert0to4 },
      { id: 11, text: 'Tener sentimientos negativos fuertes como miedo, horror, rabia, culpa o vergüenza', subscale: 'cognition', options: likert0to4 },
      { id: 12, text: 'Perder interés en actividades que antes le gustaban', subscale: 'cognition', options: likert0to4 },
      { id: 13, text: 'Sentirse distante o ajeno/a de otras personas', subscale: 'cognition', options: likert0to4 },
      { id: 14, text: 'Dificultad para experimentar sentimientos positivos (por ejemplo, ser incapaz de sentir alegría o amor)', subscale: 'cognition', options: likert0to4 },
      { id: 15, text: 'Comportamiento irritable, arrebatos de enojo o actuar agresivamente', subscale: 'arousal', options: likert0to4 },
      { id: 16, text: 'Tomar riesgos excesivos o hacer cosas que podrían causarle daño', subscale: 'arousal', options: likert0to4 },
      { id: 17, text: 'Estar "en guardia", alerta o vigilante', subscale: 'arousal', options: likert0to4 },
      { id: 18, text: 'Sentirse sobresaltado/a o asustado/a fácilmente', subscale: 'arousal', options: likert0to4 },
      { id: 19, text: 'Dificultad para concentrarse', subscale: 'arousal', options: likert0to4 },
      { id: 20, text: 'Dificultad para conciliar o mantener el sueño', subscale: 'arousal', options: likert0to4 },
    ],
    scoring: (answers) => {
      const intrusion  = [1,2,3,4,5].reduce((s, id) => s + (answers[id] ?? 0), 0)
      const avoidance  = [6,7].reduce((s, id) => s + (answers[id] ?? 0), 0)
      const cognition  = [8,9,10,11,12,13,14].reduce((s, id) => s + (answers[id] ?? 0), 0)
      const arousal    = [15,16,17,18,19,20].reduce((s, id) => s + (answers[id] ?? 0), 0)
      const total = intrusion + avoidance + cognition + arousal
      return { total, intrusion, avoidance, cognition, arousal }
    },
    interpretation: (scores) => {
      const { total } = scores
      if (total >= 33) return { label: 'TEPT probable', color: 'red', description: 'Puntuación ≥33 sugiere diagnóstico probable de TEPT. Se recomienda evaluación clínica.' }
      if (total >= 20) return { label: 'Síntomas moderados', color: 'yellow', description: 'Síntomas postraumáticos moderados. Seguimiento clínico recomendado.' }
      return { label: 'Síntomas leves o ausentes', color: 'green', description: 'Puntuación por debajo del umbral clínico.' }
    }
  },

  MBI: {
    code: 'MBI',
    name: 'MBI',
    description: 'Inventario de Burnout de Maslach',
    instructions: 'A continuación hay una serie de enunciados sobre su trabajo. Por favor lea cada enunciado y decida con qué frecuencia se siente así.',
    questions: [
      { id: 1,  text: 'Me siento emocionalmente agotado/a por mi trabajo.', subscale: 'ee', options: [{ value: 0, label: 'Nunca' }, { value: 1, label: 'Pocas veces al año' }, { value: 2, label: 'Una vez al mes' }, { value: 3, label: 'Pocas veces al mes' }, { value: 4, label: 'Una vez a la semana' }, { value: 5, label: 'Pocas veces a la semana' }, { value: 6, label: 'Todos los días' }] },
      { id: 2,  text: 'Me siento cansado/a al final de la jornada laboral.', subscale: 'ee', options: [{ value: 0, label: 'Nunca' }, { value: 1, label: 'Pocas veces al año' }, { value: 2, label: 'Una vez al mes' }, { value: 3, label: 'Pocas veces al mes' }, { value: 4, label: 'Una vez a la semana' }, { value: 5, label: 'Pocas veces a la semana' }, { value: 6, label: 'Todos los días' }] },
      { id: 3,  text: 'Me siento fatigado/a cuando me levanto por las mañanas y tengo que enfrentarme a otro día de trabajo.', subscale: 'ee', options: [{ value: 0, label: 'Nunca' }, { value: 1, label: 'Pocas veces al año' }, { value: 2, label: 'Una vez al mes' }, { value: 3, label: 'Pocas veces al mes' }, { value: 4, label: 'Una vez a la semana' }, { value: 5, label: 'Pocas veces a la semana' }, { value: 6, label: 'Todos los días' }] },
      { id: 4,  text: 'Puedo entender fácilmente cómo se sienten mis pacientes/clientes.', subscale: 'pa', options: [{ value: 0, label: 'Nunca' }, { value: 1, label: 'Pocas veces al año' }, { value: 2, label: 'Una vez al mes' }, { value: 3, label: 'Pocas veces al mes' }, { value: 4, label: 'Una vez a la semana' }, { value: 5, label: 'Pocas veces a la semana' }, { value: 6, label: 'Todos los días' }] },
      { id: 5,  text: 'Creo que trato a algunos pacientes/clientes como si fueran objetos impersonales.', subscale: 'dp', options: [{ value: 0, label: 'Nunca' }, { value: 1, label: 'Pocas veces al año' }, { value: 2, label: 'Una vez al mes' }, { value: 3, label: 'Pocas veces al mes' }, { value: 4, label: 'Una vez a la semana' }, { value: 5, label: 'Pocas veces a la semana' }, { value: 6, label: 'Todos los días' }] },
      { id: 6,  text: 'Trabajar con personas todo el día es un esfuerzo para mí.', subscale: 'ee', options: [{ value: 0, label: 'Nunca' }, { value: 1, label: 'Pocas veces al año' }, { value: 2, label: 'Una vez al mes' }, { value: 3, label: 'Pocas veces al mes' }, { value: 4, label: 'Una vez a la semana' }, { value: 5, label: 'Pocas veces a la semana' }, { value: 6, label: 'Todos los días' }] },
      { id: 7,  text: 'Trato con mucha eficacia los problemas de mis pacientes/clientes.', subscale: 'pa', options: [{ value: 0, label: 'Nunca' }, { value: 1, label: 'Pocas veces al año' }, { value: 2, label: 'Una vez al mes' }, { value: 3, label: 'Pocas veces al mes' }, { value: 4, label: 'Una vez a la semana' }, { value: 5, label: 'Pocas veces a la semana' }, { value: 6, label: 'Todos los días' }] },
      { id: 8,  text: 'Me siento "quemado/a" por mi trabajo.', subscale: 'ee', options: [{ value: 0, label: 'Nunca' }, { value: 1, label: 'Pocas veces al año' }, { value: 2, label: 'Una vez al mes' }, { value: 3, label: 'Pocas veces al mes' }, { value: 4, label: 'Una vez a la semana' }, { value: 5, label: 'Pocas veces a la semana' }, { value: 6, label: 'Todos los días' }] },
      { id: 9,  text: 'Creo que estoy influyendo positivamente en la vida de otras personas a través de mi trabajo.', subscale: 'pa', options: [{ value: 0, label: 'Nunca' }, { value: 1, label: 'Pocas veces al año' }, { value: 2, label: 'Una vez al mes' }, { value: 3, label: 'Pocas veces al mes' }, { value: 4, label: 'Una vez a la semana' }, { value: 5, label: 'Pocas veces a la semana' }, { value: 6, label: 'Todos los días' }] },
      { id: 10, text: 'Me he vuelto más insensible con la gente desde que ejerzo esta profesión.', subscale: 'dp', options: [{ value: 0, label: 'Nunca' }, { value: 1, label: 'Pocas veces al año' }, { value: 2, label: 'Una vez al mes' }, { value: 3, label: 'Pocas veces al mes' }, { value: 4, label: 'Una vez a la semana' }, { value: 5, label: 'Pocas veces a la semana' }, { value: 6, label: 'Todos los días' }] },
      { id: 11, text: 'Me preocupa que este trabajo me esté endureciendo emocionalmente.', subscale: 'dp', options: [{ value: 0, label: 'Nunca' }, { value: 1, label: 'Pocas veces al año' }, { value: 2, label: 'Una vez al mes' }, { value: 3, label: 'Pocas veces al mes' }, { value: 4, label: 'Una vez a la semana' }, { value: 5, label: 'Pocas veces a la semana' }, { value: 6, label: 'Todos los días' }] },
      { id: 12, text: 'Me siento con mucha energía.', subscale: 'pa', options: [{ value: 0, label: 'Nunca' }, { value: 1, label: 'Pocas veces al año' }, { value: 2, label: 'Una vez al mes' }, { value: 3, label: 'Pocas veces al mes' }, { value: 4, label: 'Una vez a la semana' }, { value: 5, label: 'Pocas veces a la semana' }, { value: 6, label: 'Todos los días' }] },
      { id: 13, text: 'Me siento frustrado/a por mi trabajo.', subscale: 'ee', options: [{ value: 0, label: 'Nunca' }, { value: 1, label: 'Pocas veces al año' }, { value: 2, label: 'Una vez al mes' }, { value: 3, label: 'Pocas veces al mes' }, { value: 4, label: 'Una vez a la semana' }, { value: 5, label: 'Pocas veces a la semana' }, { value: 6, label: 'Todos los días' }] },
      { id: 14, text: 'Creo que estoy trabajando demasiado.', subscale: 'ee', options: [{ value: 0, label: 'Nunca' }, { value: 1, label: 'Pocas veces al año' }, { value: 2, label: 'Una vez al mes' }, { value: 3, label: 'Pocas veces al mes' }, { value: 4, label: 'Una vez a la semana' }, { value: 5, label: 'Pocas veces a la semana' }, { value: 6, label: 'Todos los días' }] },
      { id: 15, text: 'Realmente no me preocupa lo que les ocurre a algunos pacientes/clientes.', subscale: 'dp', options: [{ value: 0, label: 'Nunca' }, { value: 1, label: 'Pocas veces al año' }, { value: 2, label: 'Una vez al mes' }, { value: 3, label: 'Pocas veces al mes' }, { value: 4, label: 'Una vez a la semana' }, { value: 5, label: 'Pocas veces a la semana' }, { value: 6, label: 'Todos los días' }] },
      { id: 16, text: 'Trabajar directamente con personas me produce demasiado estrés.', subscale: 'ee', options: [{ value: 0, label: 'Nunca' }, { value: 1, label: 'Pocas veces al año' }, { value: 2, label: 'Una vez al mes' }, { value: 3, label: 'Pocas veces al mes' }, { value: 4, label: 'Una vez a la semana' }, { value: 5, label: 'Pocas veces a la semana' }, { value: 6, label: 'Todos los días' }] },
      { id: 17, text: 'Tengo facilidad para crear una atmósfera relajada con mis pacientes/clientes.', subscale: 'pa', options: [{ value: 0, label: 'Nunca' }, { value: 1, label: 'Pocas veces al año' }, { value: 2, label: 'Una vez al mes' }, { value: 3, label: 'Pocas veces al mes' }, { value: 4, label: 'Una vez a la semana' }, { value: 5, label: 'Pocas veces a la semana' }, { value: 6, label: 'Todos los días' }] },
      { id: 18, text: 'Me siento estimulado/a después de trabajar con mis pacientes/clientes.', subscale: 'pa', options: [{ value: 0, label: 'Nunca' }, { value: 1, label: 'Pocas veces al año' }, { value: 2, label: 'Una vez al mes' }, { value: 3, label: 'Pocas veces al mes' }, { value: 4, label: 'Una vez a la semana' }, { value: 5, label: 'Pocas veces a la semana' }, { value: 6, label: 'Todos los días' }] },
      { id: 19, text: 'He conseguido muchas cosas satisfactorias en mi profesión.', subscale: 'pa', options: [{ value: 0, label: 'Nunca' }, { value: 1, label: 'Pocas veces al año' }, { value: 2, label: 'Una vez al mes' }, { value: 3, label: 'Pocas veces al mes' }, { value: 4, label: 'Una vez a la semana' }, { value: 5, label: 'Pocas veces a la semana' }, { value: 6, label: 'Todos los días' }] },
      { id: 20, text: 'Me siento como si estuviera al límite de mis posibilidades.', subscale: 'ee', options: [{ value: 0, label: 'Nunca' }, { value: 1, label: 'Pocas veces al año' }, { value: 2, label: 'Una vez al mes' }, { value: 3, label: 'Pocas veces al mes' }, { value: 4, label: 'Una vez a la semana' }, { value: 5, label: 'Pocas veces a la semana' }, { value: 6, label: 'Todos los días' }] },
      { id: 21, text: 'En mi trabajo trato los problemas emocionales con mucha calma.', subscale: 'pa', options: [{ value: 0, label: 'Nunca' }, { value: 1, label: 'Pocas veces al año' }, { value: 2, label: 'Una vez al mes' }, { value: 3, label: 'Pocas veces al mes' }, { value: 4, label: 'Una vez a la semana' }, { value: 5, label: 'Pocas veces a la semana' }, { value: 6, label: 'Todos los días' }] },
      { id: 22, text: 'Siento que los pacientes/clientes me culpan de algunos de sus problemas.', subscale: 'dp', options: [{ value: 0, label: 'Nunca' }, { value: 1, label: 'Pocas veces al año' }, { value: 2, label: 'Una vez al mes' }, { value: 3, label: 'Pocas veces al mes' }, { value: 4, label: 'Una vez a la semana' }, { value: 5, label: 'Pocas veces a la semana' }, { value: 6, label: 'Todos los días' }] },
    ],
    scoring: (answers) => {
      const ee = [1,2,3,6,8,13,14,16,20].reduce((s, id) => s + (answers[id] ?? 0), 0)
      const dp = [5,10,11,15,22].reduce((s, id) => s + (answers[id] ?? 0), 0)
      const pa = [4,7,9,12,17,18,19,21].reduce((s, id) => s + (answers[id] ?? 0), 0)
      return { cansancio_emocional: ee, despersonalizacion: dp, realizacion_personal: pa }
    },
    interpretation: (scores) => {
      const { cansancio_emocional: ee, despersonalizacion: dp, realizacion_personal: pa } = scores
      const burnoutEE = ee >= 27
      const burnoutDP = dp >= 10
      const burnoutPA = pa <= 33
      const count = [burnoutEE, burnoutDP, burnoutPA].filter(Boolean).length
      if (count >= 2) return { label: 'Burnout alto', color: 'red', description: `CE: ${ee} (alto ≥27) · D: ${dp} (alto ≥10) · RP: ${pa} (bajo ≤33). Presencia de burnout en múltiples dimensiones.` }
      if (count === 1) return { label: 'Burnout moderado', color: 'yellow', description: `CE: ${ee} · D: ${dp} · RP: ${pa}. Indicadores de burnout en una dimensión.` }
      return { label: 'Sin burnout significativo', color: 'green', description: `CE: ${ee} · D: ${dp} · RP: ${pa}. Puntuaciones dentro del rango normal.` }
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

  CFQ: {
    code: 'CFQ',
    name: 'CFQ-7',
    description: 'Cuestionario de Fusión Cognitiva',
    instructions: 'A continuación encontrará una lista de afirmaciones. Por favor, puntúe cada una de ellas según cuánto se aplica a usted usando la escala del 1 (nunca es verdad) al 7 (siempre es verdad).',
    questions: [
      { id: 1, text: 'Mis pensamientos hacen que me sea difícil vivir la vida que quiero vivir.', options: [
        { value: 1, label: '1 - Nunca es verdad' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces es verdad' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre es verdad' }
      ]},
      { id: 2, text: 'Me quedo tan atrapado/a en mis pensamientos que soy incapaz de hacer las cosas que más me importan.', options: [
        { value: 1, label: '1 - Nunca es verdad' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces es verdad' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre es verdad' }
      ]},
      { id: 3, text: 'Me preocupo demasiado por los pensamientos que tengo.', options: [
        { value: 1, label: '1 - Nunca es verdad' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces es verdad' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre es verdad' }
      ]},
      { id: 4, text: 'Mis pensamientos son los que mandan en mi vida.', options: [
        { value: 1, label: '1 - Nunca es verdad' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces es verdad' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre es verdad' }
      ]},
      { id: 5, text: 'Me identifico con mis pensamientos al punto de que se convierten en "yo".', options: [
        { value: 1, label: '1 - Nunca es verdad' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces es verdad' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre es verdad' }
      ]},
      { id: 6, text: 'No me distancio de mis pensamientos.', options: [
        { value: 1, label: '1 - Nunca es verdad' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces es verdad' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre es verdad' }
      ]},
      { id: 7, text: 'Sigo creyendo en mis pensamientos negativos incluso cuando sé que no sirven de nada.', options: [
        { value: 1, label: '1 - Nunca es verdad' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces es verdad' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre es verdad' }
      ]},
    ],
    scoring: (answers) => {
      const total = Object.values(answers).reduce((s, v) => s + v, 0)
      return { total }
    },
    interpretation: (scores) => {
      const { total } = scores
      if (total >= 29) return { label: 'Fusión cognitiva elevada', color: 'red', description: 'Puntuación alta: los pensamientos influyen notablemente en el comportamiento. Se recomienda trabajo en defusión cognitiva.' }
      if (total >= 17) return { label: 'Fusión cognitiva moderada', color: 'yellow', description: 'Nivel moderado de fusión cognitiva.' }
      return { label: 'Fusión cognitiva baja', color: 'green', description: 'Bajo nivel de fusión cognitiva.' }
    }
  },

  BEAQ: {
    code: 'BEAQ',
    name: 'BEAQ-15',
    description: 'Cuestionario Breve de Evitación Experiencial',
    instructions: 'A continuación hay una serie de afirmaciones. Por favor, puntúe cada una según cuánto se aplica a usted, usando la escala del 1 (completamente en desacuerdo) al 6 (completamente de acuerdo).',
    questions: [
      { id: 1, text: 'Mis sentimientos negativos me impiden vivir una vida plena.', options: [
        { value: 1, label: '1 - Completamente en desacuerdo' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5' }, { value: 6, label: '6 - Completamente de acuerdo' }
      ]},
      { id: 2, text: 'Tengo miedo de mis sentimientos.', options: [
        { value: 1, label: '1 - Completamente en desacuerdo' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5' }, { value: 6, label: '6 - Completamente de acuerdo' }
      ]},
      { id: 3, text: 'Me preocupa no poder controlar mis preocupaciones y sentimientos.', options: [
        { value: 1, label: '1 - Completamente en desacuerdo' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5' }, { value: 6, label: '6 - Completamente de acuerdo' }
      ]},
      { id: 4, text: 'Recuerdos dolorosos me impiden tener una vida plena.', options: [
        { value: 1, label: '1 - Completamente en desacuerdo' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5' }, { value: 6, label: '6 - Completamente de acuerdo' }
      ]},
      { id: 5, text: 'Evito situaciones que me hacen sentir incómodo/a o ansioso/a.', options: [
        { value: 1, label: '1 - Completamente en desacuerdo' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5' }, { value: 6, label: '6 - Completamente de acuerdo' }
      ]},
      { id: 6, text: 'No puedo dejar de pensar en cosas que me han sucedido.', options: [
        { value: 1, label: '1 - Completamente en desacuerdo' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5' }, { value: 6, label: '6 - Completamente de acuerdo' }
      ]},
      { id: 7, text: 'Mis emociones interfieren con cómo me gustaría comportarme en mi vida.', options: [
        { value: 1, label: '1 - Completamente en desacuerdo' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5' }, { value: 6, label: '6 - Completamente de acuerdo' }
      ]},
      { id: 8, text: 'Me digo a mí mismo/a que no debo sentirme como me siento.', options: [
        { value: 1, label: '1 - Completamente en desacuerdo' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5' }, { value: 6, label: '6 - Completamente de acuerdo' }
      ]},
      { id: 9, text: 'Evito pensar en cosas perturbadoras.', options: [
        { value: 1, label: '1 - Completamente en desacuerdo' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5' }, { value: 6, label: '6 - Completamente de acuerdo' }
      ]},
      { id: 10, text: 'Las emociones negativas son malas y hay que librarse de ellas.', options: [
        { value: 1, label: '1 - Completamente en desacuerdo' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5' }, { value: 6, label: '6 - Completamente de acuerdo' }
      ]},
      { id: 11, text: 'No actúo de acuerdo con mis valores cuando siento emociones negativas.', options: [
        { value: 1, label: '1 - Completamente en desacuerdo' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5' }, { value: 6, label: '6 - Completamente de acuerdo' }
      ]},
      { id: 12, text: 'Trato de alejarme de los sentimientos desagradables que tengo.', options: [
        { value: 1, label: '1 - Completamente en desacuerdo' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5' }, { value: 6, label: '6 - Completamente de acuerdo' }
      ]},
      { id: 13, text: 'Las memorias del pasado dolorosas me preocupan todavía.', options: [
        { value: 1, label: '1 - Completamente en desacuerdo' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5' }, { value: 6, label: '6 - Completamente de acuerdo' }
      ]},
      { id: 14, text: 'Es difícil para mí estar presente cuando tengo sentimientos desagradables.', options: [
        { value: 1, label: '1 - Completamente en desacuerdo' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5' }, { value: 6, label: '6 - Completamente de acuerdo' }
      ]},
      { id: 15, text: 'Si no puedo dejar de tener un mal sentimiento, me pongo muy angustiado/a.', options: [
        { value: 1, label: '1 - Completamente en desacuerdo' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5' }, { value: 6, label: '6 - Completamente de acuerdo' }
      ]},
    ],
    scoring: (answers) => {
      const total = Object.values(answers).reduce((s, v) => s + v, 0)
      return { total }
    },
    interpretation: (scores) => {
      const { total } = scores
      if (total >= 60) return { label: 'Evitación experiencial alta', color: 'red', description: 'Nivel elevado de evitación experiencial. Se recomienda trabajar en la aceptación de experiencias internas.' }
      if (total >= 40) return { label: 'Evitación experiencial moderada', color: 'yellow', description: 'Nivel moderado de evitación experiencial.' }
      return { label: 'Evitación experiencial baja', color: 'green', description: 'Bajo nivel de evitación experiencial.' }
    }
  },

  CompACT: {
    code: 'CompACT',
    name: 'CompACT',
    description: 'Cuestionario Comprensivo de Flexibilidad Psicológica',
    instructions: 'A continuación encontrará una serie de afirmaciones. Indique en qué medida cada una es cierta para usted, usando la escala del 1 (nunca es cierto) al 7 (siempre es cierto). Algunas preguntas están formuladas de forma inversa.',
    questions: [
      { id: 1, text: 'Continúo haciendo lo que es importante para mí, incluso cuando me siento mal.', subscale: 'openness', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre' }
      ]},
      { id: 2, text: 'Soy capaz de tomar perspectiva de mis propios pensamientos.', subscale: 'awareness', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre' }
      ]},
      { id: 3, text: 'Mis pensamientos y sentimientos negativos interfieren con mi vida.', subscale: 'openness', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre' }
      ]},
      { id: 4, text: 'Me comprometo con acciones que reflejan mis valores.', subscale: 'action', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre' }
      ]},
      { id: 5, text: 'Evito situaciones que me producen ansiedad o malestar.', subscale: 'openness', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre' }
      ]},
      { id: 6, text: 'Soy consciente de lo que está ocurriendo dentro de mí en cada momento.', subscale: 'awareness', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre' }
      ]},
      { id: 7, text: 'Me quedo atrapado/a en mis pensamientos negativos.', subscale: 'openness', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre' }
      ]},
      { id: 8, text: 'Sé qué es lo más importante para mí en la vida.', subscale: 'action', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre' }
      ]},
      { id: 9, text: 'Estoy presente en el momento actual, sin distraerme con el pasado o el futuro.', subscale: 'awareness', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre' }
      ]},
      { id: 10, text: 'Mis emociones negativas me bloquean para actuar conforme a mis valores.', subscale: 'action', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre' }
      ]},
      { id: 11, text: 'Trato de entender mis pensamientos y sentimientos desde una perspectiva más amplia.', subscale: 'awareness', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre' }
      ]},
      { id: 12, text: 'Me es difícil aceptar las experiencias difíciles que tengo.', subscale: 'openness', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre' }
      ]},
      { id: 13, text: 'Actúo de acuerdo con lo que es importante para mí, aunque sea incómodo.', subscale: 'action', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre' }
      ]},
      { id: 14, text: 'Me preocupo por cosas que no puedo controlar.', subscale: 'openness', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre' }
      ]},
      { id: 15, text: 'Soy consciente de mis pensamientos sin quedar atrapado/a en ellos.', subscale: 'awareness', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre' }
      ]},
      { id: 16, text: 'Persisto en mis metas a largo plazo, a pesar de las dificultades.', subscale: 'action', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre' }
      ]},
      { id: 17, text: 'Me dejo dominar por mis sentimientos.', subscale: 'openness', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre' }
      ]},
      { id: 18, text: 'Presto atención plena a lo que hago en cada momento.', subscale: 'awareness', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre' }
      ]},
      { id: 19, text: 'Mi vida está guiada por mis valores personales.', subscale: 'action', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre' }
      ]},
      { id: 20, text: 'Me resulta difícil aceptar emociones dolorosas.', subscale: 'openness', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre' }
      ]},
      { id: 21, text: 'Noto mis pensamientos y sentimientos sin juzgarlos.', subscale: 'awareness', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre' }
      ]},
      { id: 22, text: 'Actúo con propósito, incluso cuando las cosas son difíciles.', subscale: 'action', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre' }
      ]},
      { id: 23, text: 'Me resulta difícil mantenerme enfocado/a en lo que hago.', subscale: 'awareness', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4 - A veces' }, { value: 5, label: '5' }, { value: 6, label: '6' },
        { value: 7, label: '7 - Siempre' }
      ]},
    ],
    scoring: (answers) => {
      const openItems = [1, 3, 5, 7, 12, 14, 17, 20]
      const awarenessItems = [2, 6, 9, 11, 15, 18, 21, 23]
      const actionItems = [4, 8, 10, 13, 16, 19, 22]
      const openness = openItems.reduce((s, i) => s + (answers[i] ?? 0), 0)
      const awareness = awarenessItems.reduce((s, i) => s + (answers[i] ?? 0), 0)
      const action = actionItems.reduce((s, i) => s + (answers[i] ?? 0), 0)
      const total = openness + awareness + action
      return { openness, awareness, action, total }
    },
    interpretation: (scores) => {
      const { total } = scores
      if (total >= 120) return { label: 'Alta flexibilidad psicológica', color: 'green', description: 'Puntuación alta: buena capacidad de aceptación, conciencia y acción comprometida.' }
      if (total >= 80) return { label: 'Flexibilidad psicológica moderada', color: 'yellow', description: 'Nivel moderado. Hay áreas de flexibilidad psicológica a desarrollar.' }
      return { label: 'Baja flexibilidad psicológica', color: 'red', description: 'Puntuación baja. Se recomienda trabajo en aceptación, mindfulness y valores.' }
    }
  },

  PG13: {
    code: 'PG13',
    name: 'PG-13',
    description: 'Escala de Duelo Prolongado-13',
    instructions: 'Este cuestionario hace referencia a la pérdida de un ser querido. Por favor, indique en qué medida ha experimentado cada uno de los siguientes síntomas en el último mes.',
    questions: [
      { id: 1, text: '¿Con qué frecuencia experimenta una añoranza o anhelo doloroso por la persona fallecida?', options: [
        { value: 1, label: '1 - Casi nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5 - Al menos una vez al día' }
      ]},
      { id: 2, text: '¿Con qué frecuencia tiene dificultades para aceptar la muerte?', options: [
        { value: 1, label: '1 - No en absoluto' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5 - Abrumadoramente' }
      ]},
      { id: 3, text: '¿Con qué frecuencia experimenta una sensación de que la vida no tiene sentido sin el fallecido?', options: [
        { value: 1, label: '1 - No en absoluto' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5 - Abrumadoramente' }
      ]},
      { id: 4, text: '¿Con qué frecuencia siente que una parte de sí mismo/a murió junto con el fallecido?', options: [
        { value: 1, label: '1 - No en absoluto' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5 - Completamente' }
      ]},
      { id: 5, text: '¿Con qué frecuencia evita los recordatorios de que el fallecido ha muerto?', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5 - Siempre' }
      ]},
      { id: 6, text: '¿Con qué frecuencia le resulta difícil confiar en otras personas desde la pérdida?', options: [
        { value: 1, label: '1 - No en absoluto' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5 - Extremadamente' }
      ]},
      { id: 7, text: '¿Con qué frecuencia siente amargura o rabia relacionada con la pérdida?', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5 - Extremadamente' }
      ]},
      { id: 8, text: '¿Con qué frecuencia tiene dificultades para relacionarse con otras personas o implicarse en actividades desde la muerte?', options: [
        { value: 1, label: '1 - No en absoluto' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5 - Extremadamente' }
      ]},
      { id: 9, text: '¿Con qué frecuencia experimenta dolor emocional, pena o angustia relacionada con el fallecido?', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5 - Abrumadoramente' }
      ]},
      { id: 10, text: '¿Con qué frecuencia oye la voz del fallecido o lo ve?', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5 - Continuamente' }
      ]},
      { id: 11, text: '¿Con qué frecuencia siente que el mundo parece vacío y sin sentido sin el fallecido?', options: [
        { value: 1, label: '1 - No en absoluto' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5 - Completamente' }
      ]},
      { id: 12, text: '¿Con qué frecuencia nota que los síntomas de duelo interfieren con su capacidad de trabajo, sus actividades sociales u otras áreas importantes de su vida?', options: [
        { value: 1, label: '1 - No en absoluto' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5 - Extremadamente' }
      ]},
      { id: 13, text: '¿Con qué frecuencia experimenta entumecimiento emocional (sentirse distante o desconectado de las propias emociones) desde la muerte?', options: [
        { value: 1, label: '1 - Nunca' }, { value: 2, label: '2' }, { value: 3, label: '3' },
        { value: 4, label: '4' }, { value: 5, label: '5 - Constantemente' }
      ]},
    ],
    scoring: (answers) => {
      const total = Object.values(answers).reduce((s, v) => s + v, 0)
      return { total }
    },
    interpretation: (scores) => {
      const { total } = scores
      if (total >= 35) return { label: 'Duelo prolongado probable', color: 'red', description: 'Puntuación elevada. Se sugiere evaluación clínica especializada en duelo complicado.' }
      if (total >= 25) return { label: 'Sintomatología de duelo significativa', color: 'yellow', description: 'Presencia notable de síntomas de duelo. Se recomienda acompañamiento terapéutico.' }
      return { label: 'Duelo en rango normal', color: 'green', description: 'Sintomatología dentro de los parámetros esperados del proceso de duelo.' }
    }
  },

  IDCRECEP: {
    code: 'IDCRECEP',
    name: 'IDC-R-ECEP',
    description: 'Inventario de Duelo Complicado Revisado',
    instructions: 'Las siguientes preguntas hacen referencia a sus pensamientos y sentimientos en torno a la muerte de un ser querido. Por favor, indique con qué frecuencia ha experimentado cada situación durante el último mes.',
    questions: [
      { id: 1, text: 'Pienso tanto en la persona fallecida que me resulta difícil hacer las cosas que hago normalmente.', options: [
        { value: 0, label: 'Nunca' }, { value: 1, label: 'Raramente' }, { value: 2, label: 'A veces' },
        { value: 3, label: 'Con frecuencia' }, { value: 4, label: 'Siempre' }
      ]},
      { id: 2, text: 'Los recuerdos de la persona fallecida me trastornan.', options: [
        { value: 0, label: 'Nunca' }, { value: 1, label: 'Raramente' }, { value: 2, label: 'A veces' },
        { value: 3, label: 'Con frecuencia' }, { value: 4, label: 'Siempre' }
      ]},
      { id: 3, text: 'Me siento atraído/a hacia lugares y cosas relacionadas con la persona fallecida.', options: [
        { value: 0, label: 'Nunca' }, { value: 1, label: 'Raramente' }, { value: 2, label: 'A veces' },
        { value: 3, label: 'Con frecuencia' }, { value: 4, label: 'Siempre' }
      ]},
      { id: 4, text: 'Me siento incapaz de aceptar la muerte de la persona fallecida.', options: [
        { value: 0, label: 'Nunca' }, { value: 1, label: 'Raramente' }, { value: 2, label: 'A veces' },
        { value: 3, label: 'Con frecuencia' }, { value: 4, label: 'Siempre' }
      ]},
      { id: 5, text: 'Desearía estar muerto/a para poder estar con la persona fallecida.', options: [
        { value: 0, label: 'Nunca' }, { value: 1, label: 'Raramente' }, { value: 2, label: 'A veces' },
        { value: 3, label: 'Con frecuencia' }, { value: 4, label: 'Siempre' }
      ]},
      { id: 6, text: 'Me resulta difícil disfrutar de las cosas desde que murió la persona fallecida.', options: [
        { value: 0, label: 'Nunca' }, { value: 1, label: 'Raramente' }, { value: 2, label: 'A veces' },
        { value: 3, label: 'Con frecuencia' }, { value: 4, label: 'Siempre' }
      ]},
      { id: 7, text: 'Me siento distante de las personas con las que me preocupaba antes de la muerte.', options: [
        { value: 0, label: 'Nunca' }, { value: 1, label: 'Raramente' }, { value: 2, label: 'A veces' },
        { value: 3, label: 'Con frecuencia' }, { value: 4, label: 'Siempre' }
      ]},
      { id: 8, text: 'Siento que la vida es vacía sin la persona fallecida.', options: [
        { value: 0, label: 'Nunca' }, { value: 1, label: 'Raramente' }, { value: 2, label: 'A veces' },
        { value: 3, label: 'Con frecuencia' }, { value: 4, label: 'Siempre' }
      ]},
      { id: 9, text: 'Escucho la voz de la persona fallecida hablándome.', options: [
        { value: 0, label: 'Nunca' }, { value: 1, label: 'Raramente' }, { value: 2, label: 'A veces' },
        { value: 3, label: 'Con frecuencia' }, { value: 4, label: 'Siempre' }
      ]},
      { id: 10, text: 'Veo a la persona fallecida ante mí.', options: [
        { value: 0, label: 'Nunca' }, { value: 1, label: 'Raramente' }, { value: 2, label: 'A veces' },
        { value: 3, label: 'Con frecuencia' }, { value: 4, label: 'Siempre' }
      ]},
      { id: 11, text: 'Siento que es injusto que tenga que seguir viviendo mientras que la persona fallecida ha muerto.', options: [
        { value: 0, label: 'Nunca' }, { value: 1, label: 'Raramente' }, { value: 2, label: 'A veces' },
        { value: 3, label: 'Con frecuencia' }, { value: 4, label: 'Siempre' }
      ]},
      { id: 12, text: 'Siento amargura por la muerte de la persona fallecida.', options: [
        { value: 0, label: 'Nunca' }, { value: 1, label: 'Raramente' }, { value: 2, label: 'A veces' },
        { value: 3, label: 'Con frecuencia' }, { value: 4, label: 'Siempre' }
      ]},
      { id: 13, text: 'Siento envidia de las personas que no han perdido a nadie cercano.', options: [
        { value: 0, label: 'Nunca' }, { value: 1, label: 'Raramente' }, { value: 2, label: 'A veces' },
        { value: 3, label: 'Con frecuencia' }, { value: 4, label: 'Siempre' }
      ]},
      { id: 14, text: 'Me siento solo/a gran parte del tiempo desde que murió la persona fallecida.', options: [
        { value: 0, label: 'Nunca' }, { value: 1, label: 'Raramente' }, { value: 2, label: 'A veces' },
        { value: 3, label: 'Con frecuencia' }, { value: 4, label: 'Siempre' }
      ]},
      { id: 15, text: 'Me resulta difícil confiar en las personas desde que murió la persona fallecida.', options: [
        { value: 0, label: 'Nunca' }, { value: 1, label: 'Raramente' }, { value: 2, label: 'A veces' },
        { value: 3, label: 'Con frecuencia' }, { value: 4, label: 'Siempre' }
      ]},
      { id: 16, text: 'Me resulta difícil interesarme en las actividades que antes me interesaban.', options: [
        { value: 0, label: 'Nunca' }, { value: 1, label: 'Raramente' }, { value: 2, label: 'A veces' },
        { value: 3, label: 'Con frecuencia' }, { value: 4, label: 'Siempre' }
      ]},
      { id: 17, text: 'Siento que nada tiene sentido sin la persona fallecida.', options: [
        { value: 0, label: 'Nunca' }, { value: 1, label: 'Raramente' }, { value: 2, label: 'A veces' },
        { value: 3, label: 'Con frecuencia' }, { value: 4, label: 'Siempre' }
      ]},
      { id: 18, text: 'Siento que el futuro no tiene sentido ni propósito sin la persona fallecida.', options: [
        { value: 0, label: 'Nunca' }, { value: 1, label: 'Raramente' }, { value: 2, label: 'A veces' },
        { value: 3, label: 'Con frecuencia' }, { value: 4, label: 'Siempre' }
      ]},
      { id: 19, text: 'Me siento aturdido/a o en shock por la muerte de la persona fallecida.', options: [
        { value: 0, label: 'Nunca' }, { value: 1, label: 'Raramente' }, { value: 2, label: 'A veces' },
        { value: 3, label: 'Con frecuencia' }, { value: 4, label: 'Siempre' }
      ]},
    ],
    scoring: (answers) => {
      const total = Object.values(answers).reduce((s, v) => s + v, 0)
      return { total }
    },
    interpretation: (scores) => {
      const { total } = scores
      if (total >= 30) return { label: 'Duelo complicado probable', color: 'red', description: 'Puntuación elevada. Se recomienda evaluación clínica especializada para duelo complicado.' }
      if (total >= 20) return { label: 'Sintomatología de duelo significativa', color: 'yellow', description: 'Presencia de síntomas de duelo que merecen atención terapéutica.' }
      return { label: 'Duelo en rango normal', color: 'green', description: 'Sintomatología dentro de los parámetros esperados del proceso de duelo.' }
    }
  },

  EGD: {
    code: 'EGD',
    name: 'EGD',
    description: 'Escala de Gravedad del Duelo',
    instructions: 'A continuación encontrará una serie de afirmaciones relacionadas con la pérdida de un ser querido. Por favor, indique en qué medida cada afirmación refleja cómo se ha sentido durante el último mes.',
    questions: [
      { id: 1, text: 'Echo terriblemente de menos a la persona fallecida.', options: [
        { value: 0, label: '0 - Nada' }, { value: 1, label: '1 - Algo' }, { value: 2, label: '2 - Bastante' },
        { value: 3, label: '3 - Mucho' }, { value: 4, label: '4 - Muchísimo' }
      ]},
      { id: 2, text: 'Lloro cuando pienso en la persona fallecida.', options: [
        { value: 0, label: '0 - Nada' }, { value: 1, label: '1 - Algo' }, { value: 2, label: '2 - Bastante' },
        { value: 3, label: '3 - Mucho' }, { value: 4, label: '4 - Muchísimo' }
      ]},
      { id: 3, text: 'Pienso en la persona fallecida aunque no quiera hacerlo.', options: [
        { value: 0, label: '0 - Nada' }, { value: 1, label: '1 - Algo' }, { value: 2, label: '2 - Bastante' },
        { value: 3, label: '3 - Mucho' }, { value: 4, label: '4 - Muchísimo' }
      ]},
      { id: 4, text: 'Me siento triste al pensar en la persona fallecida.', options: [
        { value: 0, label: '0 - Nada' }, { value: 1, label: '1 - Algo' }, { value: 2, label: '2 - Bastante' },
        { value: 3, label: '3 - Mucho' }, { value: 4, label: '4 - Muchísimo' }
      ]},
      { id: 5, text: 'Siento que la ausencia de la persona fallecida es insoportable.', options: [
        { value: 0, label: '0 - Nada' }, { value: 1, label: '1 - Algo' }, { value: 2, label: '2 - Bastante' },
        { value: 3, label: '3 - Mucho' }, { value: 4, label: '4 - Muchísimo' }
      ]},
      { id: 6, text: 'Me siento culpable por la muerte de la persona fallecida.', options: [
        { value: 0, label: '0 - Nada' }, { value: 1, label: '1 - Algo' }, { value: 2, label: '2 - Bastante' },
        { value: 3, label: '3 - Mucho' }, { value: 4, label: '4 - Muchísimo' }
      ]},
      { id: 7, text: 'Siento ira o rabia por la muerte de la persona fallecida.', options: [
        { value: 0, label: '0 - Nada' }, { value: 1, label: '1 - Algo' }, { value: 2, label: '2 - Bastante' },
        { value: 3, label: '3 - Mucho' }, { value: 4, label: '4 - Muchísimo' }
      ]},
      { id: 8, text: 'La muerte de la persona fallecida ha perturbado mi vida profundamente.', options: [
        { value: 0, label: '0 - Nada' }, { value: 1, label: '1 - Algo' }, { value: 2, label: '2 - Bastante' },
        { value: 3, label: '3 - Mucho' }, { value: 4, label: '4 - Muchísimo' }
      ]},
      { id: 9, text: 'Desde que murió la persona fallecida me siento perdido/a.', options: [
        { value: 0, label: '0 - Nada' }, { value: 1, label: '1 - Algo' }, { value: 2, label: '2 - Bastante' },
        { value: 3, label: '3 - Mucho' }, { value: 4, label: '4 - Muchísimo' }
      ]},
      { id: 10, text: 'Siento que una parte de mí ha muerto con la persona fallecida.', options: [
        { value: 0, label: '0 - Nada' }, { value: 1, label: '1 - Algo' }, { value: 2, label: '2 - Bastante' },
        { value: 3, label: '3 - Mucho' }, { value: 4, label: '4 - Muchísimo' }
      ]},
      { id: 11, text: 'Me resulta difícil aceptar que la persona fallecida ya no está.', options: [
        { value: 0, label: '0 - Nada' }, { value: 1, label: '1 - Algo' }, { value: 2, label: '2 - Bastante' },
        { value: 3, label: '3 - Mucho' }, { value: 4, label: '4 - Muchísimo' }
      ]},
      { id: 12, text: 'Evito hablar de la persona fallecida con otras personas.', options: [
        { value: 0, label: '0 - Nada' }, { value: 1, label: '1 - Algo' }, { value: 2, label: '2 - Bastante' },
        { value: 3, label: '3 - Mucho' }, { value: 4, label: '4 - Muchísimo' }
      ]},
    ],
    scoring: (answers) => {
      const total = Object.values(answers).reduce((s, v) => s + v, 0)
      return { total }
    },
    interpretation: (scores) => {
      const { total } = scores
      if (total >= 30) return { label: 'Duelo de alta gravedad', color: 'red', description: 'Puntuación elevada que indica un duelo de alta intensidad. Se recomienda evaluación y apoyo terapéutico especializado.' }
      if (total >= 18) return { label: 'Duelo de gravedad moderada', color: 'yellow', description: 'Nivel moderado de sintomatología de duelo. Se recomienda acompañamiento terapéutico.' }
      return { label: 'Duelo de gravedad leve', color: 'green', description: 'Sintomatología de duelo dentro de niveles manejables.' }
    }
  },

  SF36: {
    code: 'SF36',
    name: 'SF-36',
    description: 'Cuestionario de Salud SF-36',
    instructions: 'Este cuestionario le pregunta sobre su salud. Por favor, conteste cada pregunta marcando la respuesta como se indica. Si no está seguro/a de cómo responder, dé la mejor respuesta que pueda.',
    questions: [
      { id: 1, text: 'En general, ¿diría que su salud es:', subscale: 'general', options: [
        { value: 5, label: 'Excelente' }, { value: 4, label: 'Muy buena' }, { value: 3, label: 'Buena' },
        { value: 2, label: 'Regular' }, { value: 1, label: 'Mala' }
      ]},
      { id: 2, text: '¿Cómo diría que es su salud actual, comparada con la de hace un año?', subscale: 'general', options: [
        { value: 1, label: 'Mucho mejor ahora que hace un año' }, { value: 2, label: 'Algo mejor ahora' },
        { value: 3, label: 'Más o menos igual' }, { value: 4, label: 'Algo peor ahora' }, { value: 5, label: 'Mucho peor ahora' }
      ]},
      { id: 3, text: 'Esfuerzos intensos (como correr, levantar objetos pesados, deportes agotadores): ¿Su salud actual le limita para hacer estas actividades?', subscale: 'physical', options: [
        { value: 1, label: 'Sí, me limita mucho' }, { value: 2, label: 'Sí, me limita un poco' }, { value: 3, label: 'No, no me limita nada' }
      ]},
      { id: 4, text: 'Esfuerzos moderados (como mover una mesa, caminar más de una hora): ¿Su salud actual le limita?', subscale: 'physical', options: [
        { value: 1, label: 'Sí, me limita mucho' }, { value: 2, label: 'Sí, me limita un poco' }, { value: 3, label: 'No, no me limita nada' }
      ]},
      { id: 5, text: 'Coger o llevar la bolsa de la compra: ¿Su salud actual le limita?', subscale: 'physical', options: [
        { value: 1, label: 'Sí, me limita mucho' }, { value: 2, label: 'Sí, me limita un poco' }, { value: 3, label: 'No, no me limita nada' }
      ]},
      { id: 6, text: 'Subir varios pisos por la escalera: ¿Su salud actual le limita?', subscale: 'physical', options: [
        { value: 1, label: 'Sí, me limita mucho' }, { value: 2, label: 'Sí, me limita un poco' }, { value: 3, label: 'No, no me limita nada' }
      ]},
      { id: 7, text: 'Subir un solo piso por la escalera: ¿Su salud actual le limita?', subscale: 'physical', options: [
        { value: 1, label: 'Sí, me limita mucho' }, { value: 2, label: 'Sí, me limita un poco' }, { value: 3, label: 'No, no me limita nada' }
      ]},
      { id: 8, text: 'Agacharse, arrodillarse o ponerse en cuclillas: ¿Su salud actual le limita?', subscale: 'physical', options: [
        { value: 1, label: 'Sí, me limita mucho' }, { value: 2, label: 'Sí, me limita un poco' }, { value: 3, label: 'No, no me limita nada' }
      ]},
      { id: 9, text: 'Caminar más de un kilómetro: ¿Su salud actual le limita?', subscale: 'physical', options: [
        { value: 1, label: 'Sí, me limita mucho' }, { value: 2, label: 'Sí, me limita un poco' }, { value: 3, label: 'No, no me limita nada' }
      ]},
      { id: 10, text: 'Caminar varios centenares de metros: ¿Su salud actual le limita?', subscale: 'physical', options: [
        { value: 1, label: 'Sí, me limita mucho' }, { value: 2, label: 'Sí, me limita un poco' }, { value: 3, label: 'No, no me limita nada' }
      ]},
      { id: 11, text: 'Caminar unos 100 metros: ¿Su salud actual le limita?', subscale: 'physical', options: [
        { value: 1, label: 'Sí, me limita mucho' }, { value: 2, label: 'Sí, me limita un poco' }, { value: 3, label: 'No, no me limita nada' }
      ]},
      { id: 12, text: 'Bañarse o vestirse por sí mismo: ¿Su salud actual le limita?', subscale: 'physical', options: [
        { value: 1, label: 'Sí, me limita mucho' }, { value: 2, label: 'Sí, me limita un poco' }, { value: 3, label: 'No, no me limita nada' }
      ]},
      { id: 13, text: 'Durante las 4 últimas semanas, ¿redujo el tiempo dedicado al trabajo u otras actividades por su salud física?', subscale: 'role_physical', options: [
        { value: 1, label: 'Sí' }, { value: 2, label: 'No' }
      ]},
      { id: 14, text: '¿Hizo menos de lo que hubiera querido hacer por su salud física?', subscale: 'role_physical', options: [
        { value: 1, label: 'Sí' }, { value: 2, label: 'No' }
      ]},
      { id: 15, text: '¿Tuvo que dejar de hacer algunas tareas en el trabajo u otras actividades por su salud física?', subscale: 'role_physical', options: [
        { value: 1, label: 'Sí' }, { value: 2, label: 'No' }
      ]},
      { id: 16, text: '¿Tuvo dificultad para hacer su trabajo u otras actividades por su salud física?', subscale: 'role_physical', options: [
        { value: 1, label: 'Sí' }, { value: 2, label: 'No' }
      ]},
      { id: 17, text: '¿Redujo el tiempo dedicado al trabajo u otras actividades por problemas emocionales?', subscale: 'role_emotional', options: [
        { value: 1, label: 'Sí' }, { value: 2, label: 'No' }
      ]},
      { id: 18, text: '¿Hizo menos de lo que hubiera querido hacer por problemas emocionales?', subscale: 'role_emotional', options: [
        { value: 1, label: 'Sí' }, { value: 2, label: 'No' }
      ]},
      { id: 19, text: '¿No hizo su trabajo u otras actividades tan cuidadosamente como de costumbre por problemas emocionales?', subscale: 'role_emotional', options: [
        { value: 1, label: 'Sí' }, { value: 2, label: 'No' }
      ]},
      { id: 20, text: '¿Con qué frecuencia el dolor le ha dificultado su trabajo habitual (incluido el trabajo fuera de casa y las tareas domésticas)?', subscale: 'pain', options: [
        { value: 5, label: 'Nada' }, { value: 4, label: 'Un poco' }, { value: 3, label: 'Regular' },
        { value: 2, label: 'Bastante' }, { value: 1, label: 'Mucho' }
      ]},
      { id: 21, text: '¿Cuánto dolor físico ha tenido durante las 4 últimas semanas?', subscale: 'pain', options: [
        { value: 6, label: 'Ninguno' }, { value: 5, label: 'Muy poco' }, { value: 4, label: 'Un poco' },
        { value: 3, label: 'Moderado' }, { value: 2, label: 'Mucho' }, { value: 1, label: 'Muchísimo' }
      ]},
      { id: 22, text: 'Durante las 4 últimas semanas, ¿cuánto tiempo se sintió lleno/a de vitalidad?', subscale: 'vitality', options: [
        { value: 6, label: 'Siempre' }, { value: 5, label: 'Casi siempre' }, { value: 4, label: 'Muchas veces' },
        { value: 3, label: 'Algunas veces' }, { value: 2, label: 'Sólo alguna vez' }, { value: 1, label: 'Nunca' }
      ]},
      { id: 23, text: '¿Cuánto tiempo se sintió muy nervioso/a?', subscale: 'mental', options: [
        { value: 1, label: 'Siempre' }, { value: 2, label: 'Casi siempre' }, { value: 3, label: 'Muchas veces' },
        { value: 4, label: 'Algunas veces' }, { value: 5, label: 'Sólo alguna vez' }, { value: 6, label: 'Nunca' }
      ]},
      { id: 24, text: '¿Cuánto tiempo se sintió tan bajo/a de moral que nada podía animarle?', subscale: 'mental', options: [
        { value: 1, label: 'Siempre' }, { value: 2, label: 'Casi siempre' }, { value: 3, label: 'Muchas veces' },
        { value: 4, label: 'Algunas veces' }, { value: 5, label: 'Sólo alguna vez' }, { value: 6, label: 'Nunca' }
      ]},
      { id: 25, text: '¿Cuánto tiempo se sintió calmado/a y tranquilo/a?', subscale: 'mental', options: [
        { value: 6, label: 'Siempre' }, { value: 5, label: 'Casi siempre' }, { value: 4, label: 'Muchas veces' },
        { value: 3, label: 'Algunas veces' }, { value: 2, label: 'Sólo alguna vez' }, { value: 1, label: 'Nunca' }
      ]},
      { id: 26, text: '¿Cuánto tiempo tuvo mucha energía?', subscale: 'vitality', options: [
        { value: 6, label: 'Siempre' }, { value: 5, label: 'Casi siempre' }, { value: 4, label: 'Muchas veces' },
        { value: 3, label: 'Algunas veces' }, { value: 2, label: 'Sólo alguna vez' }, { value: 1, label: 'Nunca' }
      ]},
      { id: 27, text: '¿Cuánto tiempo se sintió desanimado/a y triste?', subscale: 'mental', options: [
        { value: 1, label: 'Siempre' }, { value: 2, label: 'Casi siempre' }, { value: 3, label: 'Muchas veces' },
        { value: 4, label: 'Algunas veces' }, { value: 5, label: 'Sólo alguna vez' }, { value: 6, label: 'Nunca' }
      ]},
      { id: 28, text: '¿Cuánto tiempo se sintió agotado/a?', subscale: 'vitality', options: [
        { value: 1, label: 'Siempre' }, { value: 2, label: 'Casi siempre' }, { value: 3, label: 'Muchas veces' },
        { value: 4, label: 'Algunas veces' }, { value: 5, label: 'Sólo alguna vez' }, { value: 6, label: 'Nunca' }
      ]},
      { id: 29, text: '¿Cuánto tiempo se sintió feliz?', subscale: 'mental', options: [
        { value: 6, label: 'Siempre' }, { value: 5, label: 'Casi siempre' }, { value: 4, label: 'Muchas veces' },
        { value: 3, label: 'Algunas veces' }, { value: 2, label: 'Sólo alguna vez' }, { value: 1, label: 'Nunca' }
      ]},
      { id: 30, text: '¿Cuánto tiempo se sintió cansado/a?', subscale: 'vitality', options: [
        { value: 1, label: 'Siempre' }, { value: 2, label: 'Casi siempre' }, { value: 3, label: 'Muchas veces' },
        { value: 4, label: 'Algunas veces' }, { value: 5, label: 'Sólo alguna vez' }, { value: 6, label: 'Nunca' }
      ]},
      { id: 31, text: '¿Con qué frecuencia su salud física o los problemas emocionales han dificultado sus actividades sociales?', subscale: 'social', options: [
        { value: 5, label: 'Siempre' }, { value: 4, label: 'Casi siempre' }, { value: 3, label: 'Algunas veces' },
        { value: 2, label: 'Sólo alguna vez' }, { value: 1, label: 'Nunca' }
      ]},
      { id: 32, text: '¿Durante cuánto tiempo su salud física o problemas emocionales han dificultado sus actividades sociales?', subscale: 'social', options: [
        { value: 1, label: 'Siempre' }, { value: 2, label: 'Casi siempre' }, { value: 3, label: 'Algunas veces' },
        { value: 4, label: 'Sólo alguna vez' }, { value: 5, label: 'Nunca' }
      ]},
      { id: 33, text: 'Creo que me pongo enfermo/a más fácilmente que otras personas.', subscale: 'general', options: [
        { value: 1, label: 'Totalmente cierta' }, { value: 2, label: 'Bastante cierta' }, { value: 3, label: 'No lo sé' },
        { value: 4, label: 'Bastante falsa' }, { value: 5, label: 'Totalmente falsa' }
      ]},
      { id: 34, text: 'Estoy tan sano/a como cualquiera.', subscale: 'general', options: [
        { value: 5, label: 'Totalmente cierta' }, { value: 4, label: 'Bastante cierta' }, { value: 3, label: 'No lo sé' },
        { value: 2, label: 'Bastante falsa' }, { value: 1, label: 'Totalmente falsa' }
      ]},
      { id: 35, text: 'Creo que mi salud va a empeorar.', subscale: 'general', options: [
        { value: 1, label: 'Totalmente cierta' }, { value: 2, label: 'Bastante cierta' }, { value: 3, label: 'No lo sé' },
        { value: 4, label: 'Bastante falsa' }, { value: 5, label: 'Totalmente falsa' }
      ]},
      { id: 36, text: 'Mi salud es excelente.', subscale: 'general', options: [
        { value: 5, label: 'Totalmente cierta' }, { value: 4, label: 'Bastante cierta' }, { value: 3, label: 'No lo sé' },
        { value: 2, label: 'Bastante falsa' }, { value: 1, label: 'Totalmente falsa' }
      ]},
    ],
    scoring: (answers) => {
      const physItems = [3,4,5,6,7,8,9,10,11,12]
      const rolePhysItems = [13,14,15,16]
      const roleEmoItems = [17,18,19]
      const socialItems = [31,32]
      const painItems = [20,21]
      const mentalItems = [23,24,25,27,29]
      const vitalityItems = [22,26,28,30]
      const generalItems = [1,33,34,35,36]

      const avg = (items: number[]) => {
        const vals = items.map(i => answers[i] ?? 0)
        return Math.round((vals.reduce((s,v)=>s+v,0) / items.length) * 10) / 10
      }
      return {
        physical: avg(physItems),
        role_physical: avg(rolePhysItems),
        role_emotional: avg(roleEmoItems),
        social: avg(socialItems),
        pain: avg(painItems),
        mental: avg(mentalItems),
        vitality: avg(vitalityItems),
        general: avg(generalItems),
      }
    },
    interpretation: (scores) => {
      const overall = Math.round(Object.values(scores).reduce((s,v)=>s+v,0) / Object.values(scores).length * 10) / 10
      if (overall >= 4) return { label: 'Buena calidad de vida', color: 'green', description: 'Puntuación global alta en calidad de vida relacionada con la salud.' }
      if (overall >= 2.5) return { label: 'Calidad de vida moderada', color: 'yellow', description: 'Nivel moderado de calidad de vida. Hay áreas a mejorar.' }
      return { label: 'Calidad de vida baja', color: 'red', description: 'Puntuación global baja. Se recomienda atención médica y psicológica integral.' }
    }
  },

  WHOQOLBREF: {
    code: 'WHOQOLBREF',
    name: 'WHOQOL-BREF',
    description: 'Cuestionario de Calidad de Vida de la OMS (versión abreviada)',
    instructions: 'Este cuestionario le pregunta cómo se siente sobre su calidad de vida, salud, y otras áreas de su vida. Por favor, responda a todas las preguntas. Si no está seguro/a sobre qué respuesta dar a una pregunta, escoja la que le parezca más apropiada. Las preguntas se refieren a las dos últimas semanas.',
    questions: [
      { id: 1, text: '¿Cómo puntuaría su calidad de vida?', subscale: 'general', options: [
        { value: 1, label: 'Muy mala' }, { value: 2, label: 'Poco' }, { value: 3, label: 'Normal' },
        { value: 4, label: 'Bastante bien' }, { value: 5, label: 'Muy bien' }
      ]},
      { id: 2, text: '¿Cuán satisfecho/a está con su salud?', subscale: 'general', options: [
        { value: 1, label: 'Muy insatisfecho/a' }, { value: 2, label: 'Poco' }, { value: 3, label: 'Normal' },
        { value: 4, label: 'Bastante satisfecho/a' }, { value: 5, label: 'Muy satisfecho/a' }
      ]},
      { id: 3, text: '¿Hasta qué punto piensa que el dolor físico le impide hacer lo que necesita?', subscale: 'physical', options: [
        { value: 5, label: 'Nada' }, { value: 4, label: 'Un poco' }, { value: 3, label: 'Moderado' },
        { value: 2, label: 'Bastante' }, { value: 1, label: 'Extremadamente' }
      ]},
      { id: 4, text: '¿Cuánto necesita de tratamiento médico para funcionar en su vida diaria?', subscale: 'physical', options: [
        { value: 5, label: 'Nada' }, { value: 4, label: 'Un poco' }, { value: 3, label: 'Moderado' },
        { value: 2, label: 'Bastante' }, { value: 1, label: 'Extremadamente' }
      ]},
      { id: 5, text: '¿Cuánto disfruta de la vida?', subscale: 'psychological', options: [
        { value: 1, label: 'Nada' }, { value: 2, label: 'Un poco' }, { value: 3, label: 'Moderado' },
        { value: 4, label: 'Bastante' }, { value: 5, label: 'Extremadamente' }
      ]},
      { id: 6, text: '¿En qué medida siente que su vida tiene sentido?', subscale: 'psychological', options: [
        { value: 1, label: 'Nada' }, { value: 2, label: 'Un poco' }, { value: 3, label: 'Moderado' },
        { value: 4, label: 'Bastante' }, { value: 5, label: 'Extremadamente' }
      ]},
      { id: 7, text: '¿Cuál es su capacidad de concentración?', subscale: 'psychological', options: [
        { value: 1, label: 'Nada' }, { value: 2, label: 'Un poco' }, { value: 3, label: 'Moderado' },
        { value: 4, label: 'Bastante' }, { value: 5, label: 'Extremadamente' }
      ]},
      { id: 8, text: '¿Cuánta seguridad siente en su vida diaria?', subscale: 'environment', options: [
        { value: 1, label: 'Nada' }, { value: 2, label: 'Un poco' }, { value: 3, label: 'Moderado' },
        { value: 4, label: 'Bastante' }, { value: 5, label: 'Extremadamente' }
      ]},
      { id: 9, text: '¿Cuán saludable es el ambiente físico a su alrededor?', subscale: 'environment', options: [
        { value: 1, label: 'Nada' }, { value: 2, label: 'Un poco' }, { value: 3, label: 'Moderado' },
        { value: 4, label: 'Bastante' }, { value: 5, label: 'Extremadamente' }
      ]},
      { id: 10, text: '¿Tiene energía suficiente para la vida diaria?', subscale: 'physical', options: [
        { value: 1, label: 'Nada' }, { value: 2, label: 'Un poco' }, { value: 3, label: 'Moderado' },
        { value: 4, label: 'Bastante' }, { value: 5, label: 'Completamente' }
      ]},
      { id: 11, text: '¿Es capaz de aceptar su apariencia física?', subscale: 'psychological', options: [
        { value: 1, label: 'Nada' }, { value: 2, label: 'Un poco' }, { value: 3, label: 'Moderado' },
        { value: 4, label: 'Bastante' }, { value: 5, label: 'Completamente' }
      ]},
      { id: 12, text: '¿Tiene suficiente dinero para cubrir sus necesidades?', subscale: 'environment', options: [
        { value: 1, label: 'Nada' }, { value: 2, label: 'Un poco' }, { value: 3, label: 'Moderado' },
        { value: 4, label: 'Bastante' }, { value: 5, label: 'Completamente' }
      ]},
      { id: 13, text: '¿Qué disponibilidad tiene de la información que necesita en su vida diaria?', subscale: 'environment', options: [
        { value: 1, label: 'Nada' }, { value: 2, label: 'Un poco' }, { value: 3, label: 'Moderado' },
        { value: 4, label: 'Bastante' }, { value: 5, label: 'Completamente' }
      ]},
      { id: 14, text: '¿Hasta qué punto tiene oportunidad para realizar actividades de ocio?', subscale: 'environment', options: [
        { value: 1, label: 'Nada' }, { value: 2, label: 'Un poco' }, { value: 3, label: 'Moderado' },
        { value: 4, label: 'Bastante' }, { value: 5, label: 'Completamente' }
      ]},
      { id: 15, text: '¿Es capaz de desplazarse de un lugar a otro?', subscale: 'physical', options: [
        { value: 1, label: 'Nada' }, { value: 2, label: 'Un poco' }, { value: 3, label: 'Moderado' },
        { value: 4, label: 'Bastante' }, { value: 5, label: 'Completamente' }
      ]},
      { id: 16, text: '¿Cuán satisfecho/a está con su sueño?', subscale: 'physical', options: [
        { value: 1, label: 'Muy insatisfecho/a' }, { value: 2, label: 'Poco' }, { value: 3, label: 'Normal' },
        { value: 4, label: 'Bastante satisfecho/a' }, { value: 5, label: 'Muy satisfecho/a' }
      ]},
      { id: 17, text: '¿Cuán satisfecho/a está con su habilidad para realizar sus actividades de la vida diaria?', subscale: 'physical', options: [
        { value: 1, label: 'Muy insatisfecho/a' }, { value: 2, label: 'Poco' }, { value: 3, label: 'Normal' },
        { value: 4, label: 'Bastante satisfecho/a' }, { value: 5, label: 'Muy satisfecho/a' }
      ]},
      { id: 18, text: '¿Cuán satisfecho/a está con su capacidad de trabajo?', subscale: 'physical', options: [
        { value: 1, label: 'Muy insatisfecho/a' }, { value: 2, label: 'Poco' }, { value: 3, label: 'Normal' },
        { value: 4, label: 'Bastante satisfecho/a' }, { value: 5, label: 'Muy satisfecho/a' }
      ]},
      { id: 19, text: '¿Cuán satisfecho/a está consigo mismo/a?', subscale: 'psychological', options: [
        { value: 1, label: 'Muy insatisfecho/a' }, { value: 2, label: 'Poco' }, { value: 3, label: 'Normal' },
        { value: 4, label: 'Bastante satisfecho/a' }, { value: 5, label: 'Muy satisfecho/a' }
      ]},
      { id: 20, text: '¿Cuán satisfecho/a está con sus relaciones personales?', subscale: 'social', options: [
        { value: 1, label: 'Muy insatisfecho/a' }, { value: 2, label: 'Poco' }, { value: 3, label: 'Normal' },
        { value: 4, label: 'Bastante satisfecho/a' }, { value: 5, label: 'Muy satisfecho/a' }
      ]},
      { id: 21, text: '¿Cuán satisfecho/a está con su vida sexual?', subscale: 'social', options: [
        { value: 1, label: 'Muy insatisfecho/a' }, { value: 2, label: 'Poco' }, { value: 3, label: 'Normal' },
        { value: 4, label: 'Bastante satisfecho/a' }, { value: 5, label: 'Muy satisfecho/a' }
      ]},
      { id: 22, text: '¿Cuán satisfecho/a está con el apoyo que obtiene de sus amigos?', subscale: 'social', options: [
        { value: 1, label: 'Muy insatisfecho/a' }, { value: 2, label: 'Poco' }, { value: 3, label: 'Normal' },
        { value: 4, label: 'Bastante satisfecho/a' }, { value: 5, label: 'Muy satisfecho/a' }
      ]},
      { id: 23, text: '¿Cuán satisfecho/a está con las condiciones del lugar donde vive?', subscale: 'environment', options: [
        { value: 1, label: 'Muy insatisfecho/a' }, { value: 2, label: 'Poco' }, { value: 3, label: 'Normal' },
        { value: 4, label: 'Bastante satisfecho/a' }, { value: 5, label: 'Muy satisfecho/a' }
      ]},
      { id: 24, text: '¿Cuán satisfecho/a está con el acceso que tiene a los servicios sanitarios?', subscale: 'environment', options: [
        { value: 1, label: 'Muy insatisfecho/a' }, { value: 2, label: 'Poco' }, { value: 3, label: 'Normal' },
        { value: 4, label: 'Bastante satisfecho/a' }, { value: 5, label: 'Muy satisfecho/a' }
      ]},
      { id: 25, text: '¿Cuán satisfecho/a está con los servicios de transporte de su zona?', subscale: 'environment', options: [
        { value: 1, label: 'Muy insatisfecho/a' }, { value: 2, label: 'Poco' }, { value: 3, label: 'Normal' },
        { value: 4, label: 'Bastante satisfecho/a' }, { value: 5, label: 'Muy satisfecho/a' }
      ]},
      { id: 26, text: '¿Con qué frecuencia tiene sentimientos negativos, tales como tristeza, desesperanza, ansiedad o depresión?', subscale: 'psychological', options: [
        { value: 5, label: 'Nunca' }, { value: 4, label: 'Raramente' }, { value: 3, label: 'A veces' },
        { value: 2, label: 'Frecuentemente' }, { value: 1, label: 'Siempre' }
      ]},
    ],
    scoring: (answers) => {
      const physItems = [3,4,10,15,16,17,18]
      const psyItems = [5,6,7,11,19,26]
      const socItems = [20,21,22]
      const envItems = [8,9,12,13,14,23,24,25]
      const avg = (items: number[]) => {
        const vals = items.map(i => answers[i] ?? 0)
        return Math.round((vals.reduce((s,v)=>s+v,0) / items.length) * 10) / 10
      }
      return {
        physical: avg(physItems),
        psychological: avg(psyItems),
        social: avg(socItems),
        environment: avg(envItems),
      }
    },
    interpretation: (scores) => {
      const overall = Math.round(Object.values(scores).reduce((s,v)=>s+v,0) / 4 * 10) / 10
      if (overall >= 4) return { label: 'Buena calidad de vida', color: 'green', description: 'Puntuación global alta en las cuatro dimensiones de calidad de vida.' }
      if (overall >= 3) return { label: 'Calidad de vida moderada', color: 'yellow', description: 'Calidad de vida en nivel medio. Hay áreas que pueden beneficiarse de intervención.' }
      return { label: 'Calidad de vida baja', color: 'red', description: 'Puntuación global baja. Se recomienda atención integral en salud física, psicológica y social.' }
    }
  },
}
