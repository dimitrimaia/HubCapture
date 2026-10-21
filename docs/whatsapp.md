# Atendimento automático no WhatsApp (Cloud API da Meta)

Quando alguém escreve para o número do atendimento, a Meta avisa o site (`/api/whatsapp`), o assistente
(`docs/assistente.md`) gera a resposta e o site responde pelo WhatsApp. Quem é lead do `/cadastro` fica marcado
como "Escreveu no WhatsApp" no painel `/equipe/leads`.

Código: `lib/whatsapp.ts` (assinatura, leitura do webhook, formatação, envio) e `app/api/whatsapp/route.ts`.

## Custo e janela de 24 h

- Desde julho de 2025 a Meta cobra **por mensagem de modelo (template)** entregue, não por conversa.
- **Responder quem escreveu primeiro é grátis**: toda mensagem de texto comum enviada dentro da **janela de 24 h**
  aberta pela última mensagem da pessoa não é cobrada. É só isso que o site faz hoje, então o custo é **zero**.
- Fora da janela, só dá para escrever primeiro com um **modelo aprovado**, que é pago. Valores aproximados no Brasil:
  marketing ~US$ 0,07 e utilidade ~US$ 0,008 por mensagem. Confira a tabela atual em
  https://developers.facebook.com/docs/whatsapp/pricing. Os lembretes automáticos com modelo **não estão ligados**
  (ficaram para depois, para não gerar custo).

## Memória da conversa

O assistente lembra as últimas 20 mensagens de cada número por **24 h** após a última mensagem.
- **Com o banco** (`DATABASE_URL`, `docs/banco-de-dados.md`): fica na tabela `whatsapp_conversas`.
- **Sem banco**: fica só na **memória da instância** da Vercel e se perde quando a instância reinicia (a conversa
  recomeça do zero). Funciona, mas configure o banco para o atendimento lembrar o contexto de verdade.

Mensagens repetidas (a Meta reenvia o webhook se demorar) são ignoradas pelo id da mensagem.

## Passo a passo

### 1. Criar o app
1. Entre em https://developers.facebook.com/apps → **Criar app**.
2. Caso de uso: **Outro** → tipo **Empresa** (Business). Vincule ao seu **portfólio empresarial** (Business Manager);
   se não tiver, crie em https://business.facebook.com.
3. No painel do app, adicione o produto **WhatsApp** → **Configurar**.

### 2. Testar com o número de teste (grátis)
1. Em **WhatsApp → Configuração da API**, a Meta dá um **número de teste** e o **Identificador do número de telefone**
   (Phone number ID). Anote: vai em `WHATSAPP_PHONE_NUMBER_ID`.
2. Em "Para", adicione e confirme o seu celular (o número de teste só fala com até 5 números cadastrados).

### 3. Token permanente (usuário do sistema)
O token que aparece na tela de configuração expira em 24 h. Para produção:
1. https://business.facebook.com → **Configurações do negócio → Usuários → Usuários do sistema → Adicionar**
   (papel **Admin**).
2. **Atribuir ativos**: selecione o **app** (controle total) e a **conta do WhatsApp Business** (controle total).
3. **Gerar novo token** → escolha o app → validade **Nunca** → permissões
   `whatsapp_business_messaging` e `whatsapp_business_management` → copie. Vai em `WHATSAPP_TOKEN`.

### 4. Chave secreta do app
No app: **Configurações do app → Básico → Chave secreta do app → Mostrar**. Vai em `WHATSAPP_APP_SECRET`.
É ela que garante que só a Meta consegue chamar o webhook (assinatura `X-Hub-Signature-256`).

### 5. Variáveis na Vercel
Settings → Environment Variables (Production) → Redeploy:

| Variável | Valor |
| --- | --- |
| `WHATSAPP_TOKEN` | token permanente do passo 3 |
| `WHATSAPP_PHONE_NUMBER_ID` | identificador do número (passo 2 ou 7) |
| `WHATSAPP_APP_SECRET` | chave secreta do passo 4 |
| `WHATSAPP_VERIFY_TOKEN` | um texto que você inventa (ex.: `hubcapture-` + algo aleatório) |
| `WHATSAPP_API_VERSION` | opcional, padrão `v23.0` |
| `GEMINI_API_KEY` | chave do assistente (`docs/assistente.md`) |

### 6. Webhook
1. No app: **WhatsApp → Configuração** → **Webhook → Editar**.
   - URL de callback: `https://hubcapture.app/api/whatsapp`
   - Verificar token: o mesmo `WHATSAPP_VERIFY_TOKEN`.
   - **Verificar e salvar** (a Meta chama o GET do site e precisa receber o desafio de volta).
2. Em **Campos do webhook**, **assine o campo `messages`**.
3. Mande "oi" do seu celular para o número de teste: o assistente deve responder em alguns segundos.
   Se não responder, veja os logs na Vercel (`[whatsapp] ...`).

### 7. Número de verdade
1. **WhatsApp → Configuração da API → Adicionar número de telefone**. Use um chip que **não** esteja no app do
   WhatsApp (ou remova a conta do app antes): o número passa a funcionar só pela API.
2. Cadastre o **nome de exibição** (precisa ser aprovado pela Meta) e confirme o número por SMS ou ligação.
3. Para sair do limite de teste, a Meta pede a **verificação do negócio** e uma **forma de pagamento** na conta do
   WhatsApp, mesmo que você só use mensagens grátis.
4. Troque `WHATSAPP_PHONE_NUMBER_ID` pelo identificador do número novo e use esse número em
   `NEXT_PUBLIC_WHATSAPP_ATENDIMENTO` (botões "Tirar dúvidas no WhatsApp" do site).

## Regras para não ter o número bloqueado
- Só responda quem escreveu (é o que o site faz). Não importe listas para mandar mensagem.
- Se um dia ligar mensagens iniciadas pela empresa (modelos): só para quem **consentiu**, com opção de **sair**
  ("responda SAIR"), e poucas mensagens por pessoa. Muitos bloqueios/denúncias derrubam a qualidade do número.
