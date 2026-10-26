# Backup do banco e alertas de erro

## 1. Backup semanal automático (grátis)

O GitHub Actions roda `.github/workflows/backup.yml` **todo domingo às 3h** (Brasília): faz o `pg_dump` das tabelas
do site, **criptografa** com uma senha sua (AES-256) e guarda o arquivo por **90 dias** na aba Actions.

> O repositório é público e qualquer pessoa logada no GitHub consegue baixar arquivos das execuções.
> Por isso o backup sai criptografado: sem a `BACKUP_SENHA` ele não serve para nada. Nunca coloque a senha no código.

### Configurar (uma vez)

1. **URL do banco para backup**: Supabase → **Connect** → **Session pooler** (porta **5432**, não a 6543).
   Troque `[YOUR-PASSWORD]` pela senha do banco (sem colchetes).
   O GitHub Actions não alcança o endereço direto do Supabase (só IPv6); o Session pooler funciona.
2. **Senha do backup**: gere uma senha longa (32+ caracteres) e **guarde no seu gerenciador de senhas**.
   Sem ela não dá para abrir nenhum backup.
3. GitHub → repositório → **Settings → Secrets and variables → Actions → New repository secret**:
   - `BACKUP_DATABASE_URL` = a URL do passo 1
   - `BACKUP_SENHA` = a senha do passo 2
4. Teste agora: aba **Actions → Backup do banco → Run workflow**. Em ~1 minuto aparece um arquivo
   `hubcapture-AAAA-MM-DD.dump.gpg` em **Artifacts**.

### Restaurar (em caso de emergência)

1. Baixe o artifact (vem em `.zip`), descompacte e abra um terminal na pasta.
2. Descriptografe: `gpg --decrypt -o backup.dump hubcapture-AAAA-MM-DD.dump.gpg` (pede a `BACKUP_SENHA`).
3. Restaure num banco vazio (novo projeto Supabase ou local), com o pg_restore 17:
   `pg_restore --no-owner --no-privileges --exit-on-error -d "URL_DO_BANCO_NOVO" backup.dump`
4. Rode o RLS do fim do `db/setup.sql` (os `ALTER TABLE … ENABLE ROW LEVEL SECURITY`) e troque o `DATABASE_URL` na Vercel.

Dica: uma vez por trimestre, restaure um backup num projeto Supabase de teste para ter certeza de que funciona.

## 2. Alerta de erro por e-mail (grátis)

Quando a planilha, o assistente (Gemini), o WhatsApp, o cadastro ou os lembretes falham, o site manda um e-mail.
No máximo **1 por hora para cada tipo de erro**, mesmo que o erro se repita mil vezes.

1. Crie conta em [resend.com](https://resend.com) com **o mesmo e-mail que vai receber os alertas**
   (plano grátis: 3.000 e-mails/mês).
2. **API Keys → Create API Key** (permissão "Sending access").
3. Na Vercel (Production), crie:
   - `RESEND_API_KEY` = a chave
   - `ALERTA_EMAIL` = seu e-mail (o mesmo da conta Resend)
   - `ALERTA_REMETENTE` (opcional) = só se você verificar um domínio no Resend, ex.: `Hub Capture <alertas@hubcapture.app>`
4. Redeploy e teste em **Painel → Saúde do sistema → Enviar e-mail de teste**.

Sem domínio verificado, o Resend envia de `onboarding@resend.dev` e só entrega para o e-mail da própria conta, que é exatamente o seu caso.
