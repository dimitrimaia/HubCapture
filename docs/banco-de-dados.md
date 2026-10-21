# Banco de dados (Supabase, grátis) e área da equipe

O banco guarda os leads do `/cadastro`, o que cada pessoa tocou no "próximo passo", quem da equipe chamou
no WhatsApp e quem converteu. Também guarda a memória do atendimento automático no WhatsApp.
A planilha continua recebendo tudo como cópia de segurança.

Mesmo padrão do projeto ALUGUEI: **Supabase Postgres + Drizzle**, conexão pelo `DATABASE_URL` só no servidor.

## Custo

O plano **Free** do Supabase não custa nada: 500 MB de banco (cabem centenas de milhares de leads) e até 2 projetos
ativos. Projetos Free **pausam depois de 7 dias sem nenhum acesso**; como o site grava a cada cadastro, isso só
acontece se o site ficar uma semana sem visitas. Para reativar: painel do Supabase → **Restore project**.

## 1. Criar o projeto

1. Entre em https://supabase.com/dashboard → **New project**.
   - Nome: `hubcapture`. Região: **South America (São Paulo)**.
   - Crie uma senha de banco forte e guarde.
   - (Se já tiver 2 projetos Free, o do ALUGUEI conta como um. Não reaproveite o banco do ALUGUEI.)
2. Abra **SQL Editor → New query**, cole o arquivo inteiro [`db/setup.sql`](../db/setup.sql) e clique em **Run**.
   Deve aparecer "Success. No rows returned".

O `setup.sql` cria as tabelas `leads`, `lead_eventos`, `whatsapp_conversas` e `whatsapp_mensagens` e liga o RLS sem
políticas: a API pública do Supabase não lê nada; só o site (pelo `DATABASE_URL`) acessa.

## 2. Pegar a URL de conexão

1. No projeto: botão **Connect** (topo) → aba **ORMs** ou **Connection string** → **Transaction pooler** (porta **6543**).
2. Copie a URL e troque `[YOUR-PASSWORD]` pela senha do banco.
   Se a senha tiver `&` ou `+`, troque por `%26` e `%2B`.

Ficará assim: `postgresql://postgres.xxxxx:SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`

## 3. Variáveis na Vercel

Vercel → projeto → **Settings → Environment Variables** (marque **Production**; Preview é opcional):

| Variável | Valor |
| --- | --- |
| `DATABASE_URL` | URL do passo 2 |
| `EQUIPE_SENHA` | senha da equipe (8+ caracteres) para entrar em `/equipe/leads` |
| `PLANILHA_LEITURA_TOKEN` | mesmo valor de `TOKEN_LEITURA` do Apps Script (`docs/google-sheets-webhook.md`) |
| `NEXT_PUBLIC_WHATSAPP_ATENDIMENTO` | número do WhatsApp do atendimento, só dígitos (ex.: `5511900000000`) |

Depois, **Deployments → ⋯ → Redeploy**.

## 4. Usar o painel `/equipe/leads`

1. Acesse `https://hubcapture.app/equipe` → informe **seu nome** (aparece em "chamado por") e a senha da equipe.
2. Primeira vez: toque em **Importar da planilha** para trazer os cadastros antigos. Pode repetir: números que já
   estão no banco não são duplicados.
3. Escolha a **mensagem pronta** (boas-vindas, lembrete do cadastro ou convite para a comunidade).
4. Em cada pessoa, **Chamar no WhatsApp** abre o WhatsApp com a mensagem já escrita com o nome dela. Fica marcado
   quem chamou e quando; se alguém tentar chamar de novo, o painel avisa antes.
5. Confirmou na aba **Indicações** do painel Hub que a pessoa criou a conta? Toque em **Converteu**.
   O filtro padrão, **Ainda não converteu**, esconde quem já converteu.

O envio pelo `wa.me` é manual e **gratuito**: sai do WhatsApp do celular de quem está chamando.
Cuidado para não chamar dezenas de pessoas seguidas do mesmo número pessoal: o WhatsApp pode restringir números que
mandam muitas mensagens para quem não tem o contato salvo. Distribua os chamados entre a equipe e ao longo do dia.

## Alterar o banco depois

Edite `db/schema.ts`, rode `pnpm db:generate` (cria um SQL novo em `db/migracoes/`) e cole esse SQL no SQL Editor,
ou rode `pnpm db:migrate` com `DATABASE_URL` no `.env.local`.
