import { obterConfigDetalhada } from '@/lib/configuracoes'
import { exigirSessaoPagina } from '@/lib/equipe'
import { EditorMensagens } from './editor-mensagens'

export default async function MensagensPage() {
  await exigirSessaoPagina('admin')
  const [cadastro, colab, respostas] = await Promise.all([
    obterConfigDetalhada('modelos_cadastro'),
    obterConfigDetalhada('modelos_colab'),
    obterConfigDetalhada('respostas_prontas'),
  ])

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Mensagens</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Textos que a equipe envia pelo WhatsApp e respostas automáticas do chat do site. As alterações valem na hora.
      </p>
      <EditorMensagens cadastro={cadastro} colab={colab} respostas={respostas} />
    </>
  )
}
