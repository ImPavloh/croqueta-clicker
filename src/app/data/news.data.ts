/**
 * Interfaz para un solo elemento de noticia.
 */
export interface NewsItem {
    level: number;
    news: string;
}

/**
 * Array de datos de noticias que la aplicación utilizará.
 */
export const NEWS_DATA: NewsItem[] = [
    { level: 1, news: "Expertos confirman que freír croquetas reduce el estrés en un 0%, pero al menos huele bien." },
    { level: 1, news: "Tu abuela ha visto tus croquetas y ha dicho 'meh'. Dolor histórico." },
    { level: 1, news: "Nuevo informe: el 87% de la población ha soñado alguna vez con una croqueta gigante." },
    { level: 1, news: "Las croquetas de jamón siguen liderando las encuestas. Polémica en el sector del pollo." },
    { level: 1, news: "Un gato roba una croqueta y huye a Portugal. Se sospecha que actuó solo." },
    { level: 1, news: "El Ministerio de Rebozados anuncia su cierre por falta de pan rallado." },
    { level: 1, news: "Encuesta: 1 de cada 5 humanos comería croquetas incluso en su boda." },
    { level: 1, news: "Las croquetas veganas piden que se las deje de llamar 'de mentira'." },
    { level: 1, news: "Una croqueta se cae al suelo y sobrevive cinco segundos. Récord mundial." },
    { level: 1, news: "Reportan un aumento en la productividad tras instalar una freidora en la oficina." },
    { level: 1, news: "Nueva app promete calcular tu signo croquetal según tu sabor favorito." },
    { level: 1, news: "Hallan fósiles de croquetas prehistóricas en una cueva de Cuenca." },
    { level: 1, news: "La OMS recomienda no freír más de lo que puedes amar." },
    { level: 1, news: "Un influencer se hace viral tras probar 100 croquetas seguidas. Luego desaparece." },
    { level: 1, news: "Estudio revela que mirar croquetas fritas en cámara lenta cura el alma." },
    { level: 1, news: "Las croquetas sin relleno se sienten vacías por dentro. Literalmente." },
    { level: 1, news: "Un chef afirma haber creado la croqueta perfecta. Se niega a compartirla." },
    { level: 1, news: "Científicos descubren que el pan rallado no es pan ni está rallado." },
    { level: 1, news: "Miles de croquetas aparecen misteriosamente en la playa. Turistas felices, gaviotas enfadadas." },
    { level: 1, news: "Nuevo estudio: cada click genera una micro-freidora en el plano astral." },
    { level: 2, news: "Las croquetas alcanzan el estatus de moneda oficial en varios países." },
    { level: 2, news: "Un culto secreto asegura que el universo fue creado dentro de una freidora." },
    { level: 2, news: "Se confirma que los sueños huelen a croqueta recién hecha." },
    { level: 2, news: "Una croqueta autoproclamada líder mundial da su primer discurso en manteca." },
    { level: 2, news: "Hackers liberan recetas prohibidas del Archivo Vaticano de Bechamel." },
    { level: 2, news: "La NASA lanza un satélite para estudiar la atmósfera de aceite usado." },
    { level: 2, news: "Miles de personas abandonan sus trabajos para convertirse en croquetas freelance." },
    { level: 2, news: "Un algoritmo empieza a freírse a sí mismo en un intento de alcanzar la perfección." },
    { level: 2, news: "Se funda la primera universidad dedicada exclusivamente al rebozado avanzado." },
    { level: 2, news: "Croquetas de pollo inician guerra civil contra las de jamón. El mundo observa." },
    { level: 2, news: "Una croqueta gana las elecciones generales con el lema 'menos política, más bechamel'." },
    { level: 2, news: "La Iglesia Croquetaria canoniza a San Rebozado, patrono del crujiente eterno." },
    { level: 2, news: "Informe filtrado: el click en masa podría alterar la gravedad local." },
    { level: 2, news: "La croqueta cuántica aparece en dos freidoras a la vez." },
    { level: 2, news: "Los gobiernos del mundo firman el Tratado de No Fritura para frenar el calentamiento global." },
    { level: 2, news: "El rebozado de Schrödinger: crujiente y blando a la vez." },
    { level: 2, news: "Una croqueta consigue doctorado en filosofía tras freírse tres veces." },
    { level: 2, news: "Los científicos confirman que la bechamel tiene memoria. Oscura, pero memoria al fin." },
    { level: 2, news: "Los reality shows sustituyen a los humanos por croquetas más carismáticas." },
    { level: 2, news: "Un agujero de aceite amenaza con tragarse el sistema solar. NASA manda servilleta gigante." },
    { level: 3, news: "El sol se apaga. Croquetas bioluminiscentes toman el relevo." },
    { level: 3, news: "La realidad colapsa tras alcanzar 10⁹ croquetas. El universo se reinicia en modo freidora." },
    { level: 3, news: "Una croqueta viaja atrás en el tiempo y evita su propia fritura." },
    { level: 3, news: "Los humanos son declarados obsoletos. Las croquetas toman el control del clic." },
    { level: 3, news: "El Vaticano confirma aparición mariana en una croqueta con forma de nube de vapor." },
    { level: 3, news: "Dios demanda a los jugadores por competencia desleal en creación de materia comestible." },
    { level: 3, news: "Croquetas gigantes orbitan la Tierra, bloqueando el sol pero aumentando la moral global." },
    { level: 3, news: "Se abre un portal a otra dimensión: todo es bechamel." },
    { level: 3, news: "La física deja de funcionar. El aceite ahora fluye hacia arriba." },
    { level: 3, news: "Las croquetas desarrollan un lenguaje propio basado en crujidos y aroma." },
    { level: 3, news: "Una croqueta divina reparte bendiciones y colesterol en partes iguales." },
    { level: 3, news: "El universo entero se fríe lentamente. Los astrónomos aplauden." },
    { level: 3, news: "Se confirma que vivimos dentro de una simulación… de una croqueta gigante." },
    { level: 3, news: "Las croquetas fundan su propio metaverso y expulsan a los humanos por 'textura inapropiada'." },
    { level: 3, news: "El fin del tiempo llega, pero las croquetas siguen crujientes." },
    { level: 3, news: "Una inteligencia artificial intenta comprender la bechamel y enloquece para siempre." },
    { level: 3, news: "Las leyes de la termodinámica se reescriben para incluir la fritura eterna." },
    { level: 3, news: "El Big Bang fue solo una croqueta explotando en cámara lenta." },
    { level: 3, news: "Los jugadores se disuelven en aceite caliente y ascienden al Nivel Croquético Supremo." },
    { level: 3, news: "La última croqueta del universo se come a sí misma. Se cierra el ciclo." }
];
