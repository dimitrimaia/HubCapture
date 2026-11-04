import type { Metadata } from 'next'
import { IntlArtigo } from '@/components/intl/intl-artigo'
import { metadadosIdioma } from '@/lib/i18n'
import { REFERRAL_CODE, SIGNUP_URL } from '@/lib/site'

const title = 'Invita y Gana – Hub Data: cómo funcionan las invitaciones en Hub Capture'
const description = `Cómo funciona Invita y Gana de Hub Data: dónde está tu enlace de invitación en el panel de Hub Capture, cómo seguir tus invitados y cómo unirte con el código ${REFERRAL_CODE}.`

export const metadata: Metadata = metadadosIdioma('convide', 'es', title, description)

const faqs = [
  {
    question: '¿Necesito invitar a otras personas para ganar en Hub Data?',
    answer: 'No. Tus ganancias principales vienen de las horas de grabación aprobadas. Invitar es opcional y las reglas del programa aparecen en tu panel.',
  },
  {
    question: '¿Dónde veo mi enlace de invitación y mis invitados?',
    answer: 'En el panel de Hub Capture, en el área de invitaciones (Invita y Gana). Ahí copias tu enlace personal y sigues quién se unió con tu invitación.',
  },
  {
    question: '¿Cuánto gano por cada invitado?',
    answer: 'Las reglas y los montos de Invita y Gana los define Hub y pueden cambiar. Revisa siempre tu panel antes de compartir y nunca prometas montos fijos.',
  },
  {
    question: '¿Tengo que pagar algo?',
    answer: 'No. El registro, las invitaciones y los retiros son gratis. Desconfía de quien cobre una tarifa para entrar o liberar invitaciones.',
  },
  {
    question: `¿Cómo me uno con el código ${REFERRAL_CODE}?`,
    answer: `Usa el enlace oficial ${SIGNUP_URL.replace('https://', '')}; el código ${REFERRAL_CODE} ya viene aplicado. Luego descarga la app Hub Capture e inicia sesión con el mismo correo.`,
  },
]

export default function InvitaYGana() {
  return (
    <IntlArtigo
      idioma="es"
      pagina="convide"
      title={title}
      description={description}
      eyebrow="Invita y Gana"
      heading="Invita y Gana – Hub Data: cómo funcionan las invitaciones"
      intro={
        <p>
          <strong>Invita y Gana</strong> (Invite & Earn) es el programa de invitaciones de <strong>Hub Data</strong>: quien ya
          graba en <strong>Hub Capture</strong> puede invitar a otras personas con un enlace personal y seguir quién se unió.
        </p>
      }
      toc={[
        { id: 'que-es', label: 'Qué es Invita y Gana' },
        { id: 'como', label: 'Cómo invitar' },
        { id: 'reglas', label: 'Reglas y montos' },
        { id: 'unirse', label: 'Cómo unirte con una invitación' },
        { id: 'consejos', label: 'Cómo compartir bien' },
      ]}
      faqs={faqs}
      relacionadas={[{ pagina: 'hubRobotics', titulo: 'Hub Robotics: ¿qué es?', resumo: 'La empresa detrás de Hub Capture y qué hace con los videos.' }]}
    >
      <h2 id="que-es">Qué es Invita y Gana</h2>
      <p>
        Además de cobrar por las horas de grabación aprobadas, Hub te permite invitar a amigos y seguidores al programa. Cada
        persona tiene un <strong>enlace de invitación personal</strong> y los invitados aparecen en el panel de tu cuenta.
      </p>
      <h2 id="como">Cómo invitar</h2>
      <ol>
        <li>Entra al panel de Hub Capture (app o app.hub.xyz).</li>
        <li>Abre el área de invitaciones (Invita y Gana).</li>
        <li>Copia tu enlace o código personal y compártelo.</li>
        <li>Sigue en el panel quién se registró con tu invitación.</li>
      </ol>
      <h2 id="reglas">Reglas y montos</h2>
      <p>
        Hub define las reglas y los montos de Invita y Gana, y pueden cambiar con el tiempo. Por eso no publicamos cifras
        aquí: <strong>revisa siempre tu panel</strong>. Tus ganancias principales siguen siendo las horas aprobadas.
      </p>
      <h2 id="unirse">Cómo unirte con una invitación</h2>
      <p>
        ¿Aún no tienes cuenta? Usa el{' '}
        <a href={SIGNUP_URL} target="_blank" rel="noopener noreferrer">
          enlace oficial de registro con el código {REFERRAL_CODE}
        </a>
        : el código ya viene aplicado. Luego descarga Hub Capture y pide tu Starter Kit.
      </p>
      <h2 id="consejos">Cómo compartir bien</h2>
      <ul>
        <li>Explica que es un trabajo real: grabar tareas, con control de calidad.</li>
        <li>Nunca prometas montos fijos ni ganancias garantizadas.</li>
        <li>Comparte con personas interesadas, sin spam en grupos.</li>
      </ul>
    </IntlArtigo>
  )
}
