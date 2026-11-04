import type { Metadata } from 'next'
import { IntlArtigo } from '@/components/intl/intl-artigo'
import { metadadosIdioma } from '@/lib/i18n'
import { REFERRAL_CODE, SIGNUP_URL } from '@/lib/site'

const title = 'Invite & Earn – Hub Data: how referrals work on Hub Capture'
const description = `How Hub Data's Invite & Earn works: where to find your personal invite link in the Hub Capture dashboard, how to track referrals and how to join with code ${REFERRAL_CODE}.`

export const metadata: Metadata = metadadosIdioma('convide', 'en', title, description)

const faqs = [
  {
    question: 'Do I need to invite people to earn on Hub Data?',
    answer: 'No. Your main earnings come from approved recording hours. Inviting is optional, and the program rules are shown in your dashboard.',
  },
  {
    question: 'Where do I find my invite link and referrals?',
    answer: 'In the Hub Capture dashboard, in the referrals area (Invite & Earn). Copy your personal link there and track who joined through your invite.',
  },
  {
    question: 'How much do I earn per referral?',
    answer: 'Invite & Earn rules and amounts are set by Hub and may change. Always check your dashboard before sharing, and never promise fixed amounts to anyone.',
  },
  {
    question: 'Do I have to pay anything?',
    answer: 'No. Sign-up, inviting and withdrawals are free. Be careful with anyone charging a fee to join or to unlock referrals.',
  },
  {
    question: `How do I join with invite code ${REFERRAL_CODE}?`,
    answer: `Use the official link ${SIGNUP_URL.replace('https://', '')}; code ${REFERRAL_CODE} is already applied. Then download the Hub Capture app and log in with the same email.`,
  },
]

export default function InviteAndEarn() {
  return (
    <IntlArtigo
      idioma="en"
      pagina="convide"
      title={title}
      description={description}
      eyebrow="Invite & Earn"
      heading="Invite & Earn – Hub Data: how referrals work"
      intro={
        <p>
          <strong>Invite & Earn</strong> is the <strong>Hub Data</strong> referral program: people who already record on{' '}
          <strong>Hub Capture</strong> can invite others with a personal link and track who joined.
        </p>
      }
      toc={[
        { id: 'what', label: 'What is Invite & Earn' },
        { id: 'how', label: 'How to invite' },
        { id: 'rules', label: 'Rules and amounts' },
        { id: 'join', label: 'Joining through an invite' },
        { id: 'tips', label: 'How to share the right way' },
      ]}
      faqs={faqs}
      relacionadas={[{ pagina: 'hubRobotics', titulo: 'Hub Robotics: what is it?', resumo: 'The company behind Hub Capture and what it does with the videos.' }]}
    >
      <h2 id="what">What is Invite & Earn</h2>
      <p>
        Besides getting paid for approved recording hours, Hub lets you invite friends and followers to the program. Everyone
        has a <strong>personal invite link</strong>, and referrals show up in your account dashboard.
      </p>
      <h2 id="how">How to invite</h2>
      <ol>
        <li>Log in to the Hub Capture dashboard (app or app.hub.xyz).</li>
        <li>Open the referrals area (Invite & Earn).</li>
        <li>Copy your personal link or code and share it.</li>
        <li>Track in the dashboard who signed up through your invite.</li>
      </ol>
      <h2 id="rules">Rules and amounts</h2>
      <p>
        Hub sets the Invite & Earn rules and amounts, and they can change over time. That is why we do not publish numbers
        here: <strong>always check your dashboard</strong>. Your main earnings are still the approved recording hours.
      </p>
      <h2 id="join">Joining through an invite</h2>
      <p>
        No account yet? Use the{' '}
        <a href={SIGNUP_URL} target="_blank" rel="noopener noreferrer">
          official sign-up link with code {REFERRAL_CODE}
        </a>
        : the code is already applied. Then download Hub Capture and request your Starter Kit.
      </p>
      <h2 id="tips">How to share the right way</h2>
      <ul>
        <li>Explain that it is real work: recording tasks, with a quality check.</li>
        <li>Never promise fixed amounts or guaranteed income.</li>
        <li>Share with people who are interested, without spamming groups.</li>
      </ul>
    </IntlArtigo>
  )
}
