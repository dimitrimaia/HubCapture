import { REFERRAL_CODE } from './site'

/**
 * Textos das versões em inglês e espanhol (/en e /es). O português continua nos componentes de
 * sempre. Valores em dólar: só o que a página oficial da Hub (ai.hub.xyz) informa.
 */

export type IdiomaIntl = 'en' | 'es'
type Pergunta = { question: string; answer: string }

export type TextosIntl = {
  tagline: string
  nav: { inicio: string; convide: string; hubRobotics: string; cadastrar: string; menu: string }
  rodape: { sobre: string; aviso: string; paginas: string; comunidade: string; whatsapp: string; instagram: string }
  artigo: { voceEsta: string; nesteGuia: string; perguntas: string; leiaTambem: string; ctaFinal: string }
  cta: string
  home: {
    title: string
    description: string
    selo: string
    titulo: string
    destaque: string
    subtitulo: string
    texto: string
    ganhos: string
    avisoGanhos: string
    ctaSecundario: string
    destaques: string[]
    comoTitulo: string
    comoTexto: string
    passos: { titulo: string; texto: string }[]
    precisaTitulo: string
    precisa: string[]
    convideTitulo: string
    convideTexto: string
    convideCta: string
    roboticsTitulo: string
    roboticsTexto: string
    roboticsCta: string
    faqTitulo: string
    faq: Pergunta[]
    finalTitulo: string
    finalTexto: string
  }
}

export const TEXTOS_INTL: Record<IdiomaIntl, TextosIntl> = {
  en: {
    tagline: 'Independent site',
    nav: { inicio: 'Home', convide: 'Invite & Earn', hubRobotics: 'Hub Robotics', cadastrar: 'Sign up', menu: 'Pages' },
    rodape: {
      sobre: 'Hub Capture: record real-world tasks with your phone in the Hub app and get paid for every approved hour.',
      aviso: `Independent site run by a participant who shares invite code ${REFERRAL_CODE}. It is not Hub's official website and is not run, endorsed or sponsored by Hub Data, Inc. Earnings vary and are not guaranteed; official rates and terms are at hub.xyz.`,
      paginas: 'Pages',
      comunidade: 'Community',
      whatsapp: 'WhatsApp community (Portuguese)',
      instagram: '@hubcapture on Instagram',
    },
    artigo: {
      voceEsta: 'You are here',
      nesteGuia: 'In this guide',
      perguntas: 'Frequently asked questions',
      leiaTambem: 'Read next',
      ctaFinal: `Create your free account with code ${REFERRAL_CODE}`,
    },
    cta: `Sign up with ${REFERRAL_CODE}`,
    home: {
      title: 'Hub Capture App: earn money recording videos | Hub Data',
      description: `Hub Capture is the Hub Data app that pays you to record everyday tasks with your phone and help train robots and AI. Free sign-up with code ${REFERRAL_CODE}.`,
      selo: 'Hub Capture · Hub Data',
      titulo: 'Film it,',
      destaque: 'get paid.',
      subtitulo: 'Earn money recording videos with the Hub Capture app.',
      texto:
        'With Hub Capture, from Hub Data (Hub Robotics), you record real tasks at home or at work with your phone mounted on your head. The videos train robots and artificial intelligence, and you get paid for every approved hour.',
      ganhos: 'up to US$ 8–9',
      avisoGanhos: "per approved hour on tasks and bonus periods, according to Hub's official facts page. Earnings vary and are not guaranteed.",
      ctaSecundario: 'How Invite & Earn works',
      destaques: ['Free sign-up', 'Free Starter Kit', 'Weekly payouts'],
      comoTitulo: 'How it works',
      comoTexto: 'No expensive gear and no video experience. Just your phone and the tasks you already do.',
      passos: [
        { titulo: 'Create your free account', texto: `Sign up through the official link with invite code ${REFERRAL_CODE} and request your free Starter Kit.` },
        { titulo: 'Record real tasks', texto: 'Mount your phone at eye level and record a task from start to finish: cooking, tidying up, repairing, assembling.' },
        { titulo: 'Get paid for approved hours', texto: 'Every video goes through a quality check. Approved hours show up in your balance and are paid weekly.' },
      ],
      precisaTitulo: 'What you need',
      precisa: [
        'An Android phone or iPhone with a working camera and free storage',
        'Good lighting and a calm environment',
        'A head mount: the Starter Kit is free',
        'Internet to upload your videos',
      ],
      convideTitulo: 'Invite & Earn',
      convideTexto: 'Already recording? Share your personal invite link from the Hub dashboard and follow who joined in the referrals area.',
      convideCta: 'See how Invite & Earn works',
      roboticsTitulo: 'Who is behind it: Hub Robotics',
      roboticsTexto: 'Hub collects first-person data in homes and businesses to train world models and embodied AI, the intelligence that controls robots.',
      roboticsCta: 'Learn about Hub Robotics',
      faqTitulo: 'Frequently asked questions',
      faq: [
        {
          question: 'What is Hub Capture?',
          answer:
            'Hub Capture (also called Hub App) is the Hub Data app for recording first-person tasks with your phone and getting paid per approved hour. You install the app, record the task with your phone on your head and track your earnings in the dashboard.',
        },
        {
          question: 'How much does Hub pay?',
          answer:
            "According to Hub's official facts page, tasks and bonus periods pay up to US$ 8–9 per approved hour. The current bonus and deadline are shown in the app. Only approved time counts, and earnings are not guaranteed.",
        },
        {
          question: 'Do I need experience?',
          answer: 'No. The app shows each task and how to record it. Keep the video steady, your hands visible and do the task from start to finish at a natural pace.',
        },
        {
          question: 'Is it free?',
          answer: 'Yes. Sign-up is free and you never need to pay to start or to withdraw. Be careful with anyone asking for a fee to "unlock" tasks.',
        },
        {
          question: `How do I sign up with code ${REFERRAL_CODE}?`,
          answer: `Open the official sign-up link (app.hub.xyz/r/${REFERRAL_CODE}); the code is already applied. Create your account, download Hub Capture and log in with the same email.`,
        },
      ],
      finalTitulo: 'Start recording today',
      finalTexto: `Create your free account with code ${REFERRAL_CODE}, download Hub Capture and make your first recording.`,
    },
  },
  es: {
    tagline: 'Sitio independiente',
    nav: { inicio: 'Inicio', convide: 'Invita y Gana', hubRobotics: 'Hub Robotics', cadastrar: 'Registrarse', menu: 'Páginas' },
    rodape: {
      sobre: 'Hub Capture: graba tareas del mundo real con tu celular en la app Hub y gana por cada hora aprobada.',
      aviso: `Sitio independiente de un participante que comparte el código de invitación ${REFERRAL_CODE}. No es el sitio oficial de Hub ni está administrado, avalado o patrocinado por Hub Data, Inc. Las ganancias varían y no están garantizadas; valores y términos oficiales en hub.xyz.`,
      paginas: 'Páginas',
      comunidade: 'Comunidad',
      whatsapp: 'Comunidad en WhatsApp (portugués)',
      instagram: '@hubcapture en Instagram',
    },
    artigo: {
      voceEsta: 'Estás en',
      nesteGuia: 'En esta guía',
      perguntas: 'Preguntas frecuentes',
      leiaTambem: 'Lee también',
      ctaFinal: `Crea tu cuenta gratis con el código ${REFERRAL_CODE}`,
    },
    cta: `Registrarse con ${REFERRAL_CODE}`,
    home: {
      title: 'Hub Capture App: gana dinero grabando videos | Hub Data',
      description: `Hub Capture es la app de Hub Data que te paga por grabar tareas cotidianas con tu celular y ayudar a entrenar robots e IA. Registro gratis con el código ${REFERRAL_CODE}.`,
      selo: 'Hub Capture · Hub Data',
      titulo: 'Graba,',
      destaque: 'y gana.',
      subtitulo: 'Gana dinero grabando videos con la app Hub Capture.',
      texto:
        'Con Hub Capture, de Hub Data (Hub Robotics), grabas tareas reales en casa o en el trabajo con el celular sujeto a la cabeza. Los videos entrenan robots e inteligencia artificial, y recibes un pago por cada hora aprobada.',
      ganhos: 'hasta US$ 8–9',
      avisoGanhos: 'por hora aprobada en tareas y periodos con bono, según la página oficial de Hub. Las ganancias varían y no están garantizadas.',
      ctaSecundario: 'Cómo funciona Invita y Gana',
      destaques: ['Registro gratis', 'Starter Kit gratis', 'Pagos semanales'],
      comoTitulo: 'Cómo funciona',
      comoTexto: 'Sin equipo caro y sin experiencia en video. Solo tu celular y las tareas que ya haces.',
      passos: [
        { titulo: 'Crea tu cuenta gratis', texto: `Regístrate con el enlace oficial y el código de invitación ${REFERRAL_CODE}, y pide tu Starter Kit gratis.` },
        { titulo: 'Graba tareas reales', texto: 'Coloca el celular a la altura de los ojos y graba una tarea de principio a fin: cocinar, ordenar, reparar, armar.' },
        { titulo: 'Cobra por las horas aprobadas', texto: 'Cada video pasa por un control de calidad. Las horas aprobadas aparecen en tu saldo y se pagan cada semana.' },
      ],
      precisaTitulo: 'Qué necesitas',
      precisa: [
        'Un celular Android o iPhone con la cámara en buen estado y espacio libre',
        'Buena iluminación y un ambiente tranquilo',
        'Un soporte para la cabeza: el Starter Kit es gratis',
        'Internet para subir los videos',
      ],
      convideTitulo: 'Invita y Gana',
      convideTexto: '¿Ya grabas? Comparte tu enlace personal de invitación desde el panel de Hub y sigue quién se unió en el área de invitaciones.',
      convideCta: 'Ver cómo funciona Invita y Gana',
      roboticsTitulo: 'Quién está detrás: Hub Robotics',
      roboticsTexto: 'Hub recopila datos en primera persona en hogares y empresas para entrenar modelos del mundo e IA incorporada, la inteligencia que controla a los robots.',
      roboticsCta: 'Conocer Hub Robotics',
      faqTitulo: 'Preguntas frecuentes',
      faq: [
        {
          question: '¿Qué es Hub Capture?',
          answer:
            'Hub Capture (también llamado Hub App) es la app de Hub Data para grabar tareas en primera persona con el celular y cobrar por hora aprobada. Instalas la app, grabas la tarea con el celular en la cabeza y sigues tus ganancias en el panel.',
        },
        {
          question: '¿Cuánto paga Hub?',
          answer:
            'Según la página oficial de Hub, las tareas y los periodos con bono pagan hasta US$ 8–9 por hora aprobada. El bono vigente y el plazo aparecen en la app. Solo cuenta el tiempo aprobado y las ganancias no están garantizadas.',
        },
        {
          question: '¿Necesito experiencia?',
          answer: 'No. La app muestra cada tarea y cómo grabarla. Mantén el video estable, las manos visibles y haz la tarea de principio a fin a un ritmo natural.',
        },
        {
          question: '¿Es gratis?',
          answer: 'Sí. El registro es gratis y nunca necesitas pagar para empezar ni para retirar. Desconfía de quien cobre una tarifa para "liberar" tareas.',
        },
        {
          question: `¿Cómo me registro con el código ${REFERRAL_CODE}?`,
          answer: `Abre el enlace oficial (app.hub.xyz/r/${REFERRAL_CODE}); el código ya viene aplicado. Crea tu cuenta, descarga Hub Capture e inicia sesión con el mismo correo.`,
        },
      ],
      finalTitulo: 'Empieza a grabar hoy',
      finalTexto: `Crea tu cuenta gratis con el código ${REFERRAL_CODE}, descarga Hub Capture y haz tu primera grabación.`,
    },
  },
}
