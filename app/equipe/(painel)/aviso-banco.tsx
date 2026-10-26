import { Database } from 'lucide-react'

/** Cartão mostrado quando o banco não está configurado ou não responde (com a causa e a correção). */
export function AvisoBanco({ erro }: { erro: { codigo: string; mensagem: string; dica: string } | null }) {
  return (
    <div className="glass mt-6 flex flex-col gap-3 rounded-3xl p-6">
      <Database className="size-8 text-primary" aria-hidden="true" />
      <h2 className="text-lg font-semibold">{erro ? 'Não consegui ler o banco de dados' : 'Banco de dados ainda não configurado'}</h2>
      <p className="text-sm text-muted-foreground">
        {erro
          ? erro.dica
          : 'Crie o projeto grátis no Supabase, rode o db/setup.sql e cadastre DATABASE_URL na Vercel. Passo a passo em docs/banco-de-dados.md.'}
      </p>
      {erro && (
        <p className="break-words rounded-xl bg-foreground/[0.04] p-3 font-mono text-xs text-muted-foreground">
          Erro: {erro.codigo} {erro.mensagem}
        </p>
      )}
    </div>
  )
}
