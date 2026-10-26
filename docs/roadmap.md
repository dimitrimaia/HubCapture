# Roadmap do Hub Capture

Processo para as próximas melhorias. Cada item vira **um PR pequeno**, testado e mergeado antes do próximo.

## Como cada item anda

1. **Escolher** o próximo item da tabela (ordem sugerida abaixo).
2. **Pedir ao Claude**: "implemente o item N do docs/roadmap.md".
3. **Revisar a prévia** no link Preview da Vercel que aparece no PR (celular e computador).
4. **Rodar o SQL**, se o item tiver (fica em `db/atualizacao-N.sql`), no SQL Editor do Supabase **antes** do merge.
5. **Merge** e marcar o item como feito na tabela de status (✅).

Regras: custo zero sempre que possível (avisar antes se custar), nada de segredo no código, todo texto em português.

## Ordem sugerida

| # | Item | Por quê | Custo | SQL? | Esforço |
|---|---|---|---|---|---|
| 1 | Etiquetas e notas nos cadastros | Organiza o follow-up já | Grátis | Sim | Pequeno |
| 2 | Código de rastreio (UTM) no cadastro | Saber de onde vem cada pessoa | Grátis | Sim | Pequeno |
| 3 | Funil semanal com gráfico | Ver o que converte (usa 1 e 2) | Grátis | Não | Médio |
| 4 | Senha de novo antes de exportar CSV | LGPD e segurança | Grátis | Não | Pequeno |
| 5 | Backup semanal + alerta de erro por e-mail | Não perder dados | Grátis* | Não | Médio |
| 6 | Mais blocos editáveis (HubCap, Comunidade, Como funciona) | Autonomia no site | Grátis | Não | Médio |
| 7 | Upload de vídeo pelo editor (Vercel Blob) | Só se o YouTube não servir | Pode custar | Não | Médio |

\* GitHub Actions é grátis em repositório público. O e-mail usa o plano grátis do Resend (3.000 por mês).

## Detalhe de cada item

### 1. Etiquetas e notas nos cadastros
- Banco: colunas `etiquetas text[]` e `nota text` em `leads`.
- Painel lateral: campo de nota (salva ao sair do campo) e etiquetas rápidas ("pediu ajuda com Minute", "voltar sexta", "sem resposta") ou livres.
- Tabela: filtro por etiqueta e etiquetas como selos na linha. Entram no CSV e no histórico.
- Pronto quando: criar e remover etiqueta, filtrar e exportar funcionam no celular.

### 2. Código de rastreio (UTM)
- Links de divulgação: `hubcapture.app/cadastro?utm_source=instagram&utm_campaign=post-123` ou `?ref=nome-do-influencer`.
- O site guarda `utm_source`, `utm_medium`, `utm_campaign` e `ref` da primeira visita (por 30 dias) e envia junto com o cadastro.
- Banco: colunas com esses campos em `leads`. Também vão para a planilha.
- Aba Colab: botão "copiar link de rastreio" para cada influencer (`?ref=perfil`).
- Pronto quando: um cadastro feito pelo link aparece com a origem certa na tabela e no CSV.

### 3. Funil semanal com gráfico
- Nova aba **Resultados** (admin): por semana, cadastros → chamados → responderam → convertidos, com a taxa de cada etapa.
- Recortes: por atendente, por mensagem usada (boas-vindas, lembrete, comunidade) e por origem/UTM (item 2).
- Gráfico de barras leve (SVG próprio, sem biblioteca paga), legível em modo claro e escuro e no celular.
- Pronto quando: os números batem com a tabela de Cadastros para o mesmo período.

### 4. Senha de novo antes de exportar CSV
- Ao clicar em Exportar, o site pede a senha (e o código das 2 etapas, se ativo).
- A exportação fica liberada por 10 minutos. Tentativa errada conta no bloqueio de login, e tudo vai para a auditoria.
- Pronto quando: sem senha não baixa, com senha baixa, e o evento aparece em Saúde do sistema.

### 5. Backup semanal + alerta de erro
- Backup: GitHub Action semanal (domingo, 3h) roda `pg_dump`, criptografa com uma senha e guarda como artefato privado por 90 dias.
  Os segredos `DATABASE_URL` e `BACKUP_SENHA` ficam em **GitHub → Settings → Secrets**, nunca no código (o repositório é público).
  Inclui um guia de como restaurar.
- Alerta: quando a planilha, o Gemini ou o WhatsApp falharem, o site manda e-mail para o admin (no máximo 1 por hora por tipo de erro).
  Variáveis: `RESEND_API_KEY` e `ALERTA_EMAIL`.
- Pronto quando: um backup de teste é restaurado num banco vazio e um erro forçado gera e-mail.

### 6. Mais blocos editáveis
- Mesmo padrão do topo, tutoriais e FAQ: HubCap (texto, preço, link), Comunidade (textos e links), Como funciona (passos).
- Pronto quando: editar, publicar e restaurar o original funcionam em cada bloco.

### 7. Upload de vídeo (opcional)
- Botão "Enviar MP4" no editor de tutoriais, direto para o Vercel Blob (até 100 MB por vídeo).
- **Atenção ao custo**: o plano grátis tem limite de armazenamento e de transferência, e um vídeo muito assistido passa disso. Só fazer se o YouTube não atender.

## Status

| # | Item | Status |
|---|---|---|
| 1 | Etiquetas e notas | ⏳ |
| 2 | UTM | ⏳ |
| 3 | Funil | ⏳ |
| 4 | Senha para exportar | ⏳ |
| 5 | Backup + alerta | ⏳ |
| 6 | Mais blocos | ⏳ |
| 7 | Upload de vídeo | ⏳ |
