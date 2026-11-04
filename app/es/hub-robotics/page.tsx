import type { Metadata } from 'next'
import { IntlArtigo } from '@/components/intl/intl-artigo'
import { metadadosIdioma } from '@/lib/i18n'
import { HUB_OFICIAL_URL, SIGNUP_URL } from '@/lib/site'

const title = 'Hub Robotics: la empresa detrás de la app Hub Capture'
const description =
  'Hub Robotics (Hub, Hub Data) recopila videos de tareas reales en hogares y empresas para entrenar robots e IA. Conoce la empresa, la app Hub Capture y cómo participar y cobrar por hora.'

export const metadata: Metadata = metadadosIdioma('hubRobotics', 'es', title, description)

const faqs = [
  {
    question: '¿Hub Robotics, Hub Data y Hub Capture son la misma empresa?',
    answer: 'Hub Robotics es la empresa (sitio oficial hub.xyz), también llamada Hub o Hub Data. Hub Capture es su app, donde las personas graban tareas y cobran por hora aprobada.',
  },
  {
    question: '¿Qué hace Hub Robotics con los videos?',
    answer:
      'Según su sitio oficial, Hub recopila datos egocéntricos (grabados desde el punto de vista de quien hace la tarea) en entornos comerciales y residenciales para entrenar modelos del mundo e IA incorporada, la inteligencia que controla a los robots.',
  },
  {
    question: '¿Cómo trabajar para Hub Robotics?',
    answer: 'Participas a través de la app Hub Capture: creas una cuenta, grabas tareas cotidianas con el celular en la cabeza y cobras por las horas aprobadas. El registro es gratis.',
  },
  {
    question: '¿Este sitio es de Hub Robotics?',
    answer: 'No. Es un sitio socio con guías y un código de invitación. La información oficial está en hub.xyz.',
  },
]

export default function HubRoboticsEs() {
  return (
    <IntlArtigo
      idioma="es"
      pagina="hubRobotics"
      title={title}
      description={description}
      eyebrow="La empresa"
      heading="Hub Robotics: la empresa detrás de Hub Capture"
      intro={
        <p>
          <strong>Hub Robotics</strong>, también llamada <strong>Hub</strong> o <strong>Hub Data</strong>, es la empresa que paga
          a personas por grabar tareas reales y usa esos videos para entrenar robots. La app con la que grabas es{' '}
          <strong>Hub Capture</strong>.
        </p>
      }
      toc={[
        { id: 'que-es', label: 'Qué es Hub Robotics' },
        { id: 'por-que', label: 'Por qué necesita videos' },
        { id: 'app', label: 'Dónde entra Hub Capture' },
        { id: 'unirse', label: 'Cómo participar' },
      ]}
      faqs={faqs}
      relacionadas={[{ pagina: 'convide', titulo: 'Invita y Gana – Hub Data', resumo: 'Cómo funcionan las invitaciones y dónde está tu enlace.' }]}
    >
      <h2 id="que-es">Qué es Hub Robotics</h2>
      <p>
        En su{' '}
        <a href={HUB_OFICIAL_URL} target="_blank" rel="noopener noreferrer">
          sitio oficial (hub.xyz)
        </a>
        , Hub se presenta como una empresa que recopila <strong>datos egocéntricos</strong> en entornos comerciales y
        residenciales para entrenar <strong>modelos del mundo</strong> e <strong>IA incorporada</strong>. Es decir: videos
        grabados desde el punto de vista de quien hace la tarea, que enseñan a los robots a usar las manos en el mundo real.
      </p>
      <h2 id="por-que">Por qué necesita videos de personas comunes</h2>
      <p>
        Un robot solo aprende a cocinar, ordenar o reparar algo viendo muchos ejemplos reales. Esos ejemplos no existen ya
        hechos: hay que grabarlos en hogares y lugares de trabajo reales. Por eso Hub paga por cada hora de grabación aprobada.
      </p>
      <h2 id="app">Dónde entra Hub Capture</h2>
      <p>
        <strong>Hub Capture</strong> (o Hub App) es la app de Hub Robotics para Android y iPhone. Ahí eliges la tarea, grabas
        con el celular en la cabeza y sigues tus horas aprobadas.
      </p>
      <h2 id="unirse">Cómo participar</h2>
      <p>
        Crea tu cuenta gratis con el{' '}
        <a href={SIGNUP_URL} target="_blank" rel="noopener noreferrer">
          enlace oficial de registro
        </a>
        , descarga Hub Capture, pide el Starter Kit y haz tu primera grabación. Los pagos son semanales.
      </p>
    </IntlArtigo>
  )
}
