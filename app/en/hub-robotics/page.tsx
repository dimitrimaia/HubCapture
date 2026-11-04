import type { Metadata } from 'next'
import { IntlArtigo } from '@/components/intl/intl-artigo'
import { metadadosIdioma } from '@/lib/i18n'
import { HUB_OFICIAL_URL, SIGNUP_URL } from '@/lib/site'

const title = 'Hub Robotics: the company behind the Hub Capture app'
const description =
  'Hub Robotics (Hub, Hub Data) collects videos of real tasks in homes and businesses to train robots and AI. Learn about the company, the Hub Capture app and how to join and get paid per hour.'

export const metadata: Metadata = metadadosIdioma('hubRobotics', 'en', title, description)

const faqs = [
  {
    question: 'Are Hub Robotics, Hub Data and Hub Capture the same company?',
    answer: 'Hub Robotics is the company (official website hub.xyz), also called Hub or Hub Data. Hub Capture is its app, where people record tasks and get paid per approved hour.',
  },
  {
    question: 'What does Hub Robotics do with the videos?',
    answer:
      'According to its official website, Hub collects egocentric data (recorded from the point of view of the person doing the task) in commercial and residential environments to train world models and embodied AI, the intelligence that controls robots.',
  },
  {
    question: 'How do I work for Hub Robotics?',
    answer: 'You take part through the Hub Capture app: create an account, record everyday tasks with your phone on your head and get paid for approved hours. Sign-up is free.',
  },
  {
    question: 'Is this website run by Hub Robotics?',
    answer: 'No. This is a partner website with guides and an invite code. Official information is at hub.xyz.',
  },
]

export default function HubRoboticsEn() {
  return (
    <IntlArtigo
      idioma="en"
      pagina="hubRobotics"
      title={title}
      description={description}
      eyebrow="The company"
      heading="Hub Robotics: the company behind Hub Capture"
      intro={
        <p>
          <strong>Hub Robotics</strong>, also called <strong>Hub</strong> or <strong>Hub Data</strong>, is the company that pays
          people to record real tasks and uses those videos to train robots. The app you record with is <strong>Hub Capture</strong>.
        </p>
      }
      toc={[
        { id: 'what', label: 'What is Hub Robotics' },
        { id: 'why', label: 'Why it needs videos' },
        { id: 'app', label: 'Where Hub Capture fits in' },
        { id: 'join', label: 'How to join' },
      ]}
      faqs={faqs}
      relacionadas={[{ pagina: 'convide', titulo: 'Invite & Earn – Hub Data', resumo: 'How referrals work and where to find your invite link.' }]}
    >
      <h2 id="what">What is Hub Robotics</h2>
      <p>
        On its{' '}
        <a href={HUB_OFICIAL_URL} target="_blank" rel="noopener noreferrer">
          official website (hub.xyz)
        </a>
        , Hub describes itself as a company that collects <strong>egocentric data</strong> in commercial and residential
        environments to train <strong>world models</strong> and <strong>embodied AI</strong>. In other words: videos recorded
        from the point of view of the person doing the task, which teach robots how to use their hands in the real world.
      </p>
      <h2 id="why">Why it needs videos from everyday people</h2>
      <p>
        A robot only learns to cook, tidy up or repair something by watching many real examples. Those examples do not exist
        ready-made: they have to be recorded in real homes and workplaces. That is why Hub pays per approved recording hour.
      </p>
      <h2 id="app">Where Hub Capture fits in</h2>
      <p>
        <strong>Hub Capture</strong> (or Hub App) is the Hub Robotics app for Android and iPhone. It is where you pick a task,
        record with your phone on your head and track your approved hours.
      </p>
      <h2 id="join">How to join</h2>
      <p>
        Create your free account with the{' '}
        <a href={SIGNUP_URL} target="_blank" rel="noopener noreferrer">
          official sign-up link
        </a>
        , download Hub Capture, request the Starter Kit and make your first recording. Payouts are weekly.
      </p>
    </IntlArtigo>
  )
}
