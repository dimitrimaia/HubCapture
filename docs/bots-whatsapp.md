# Bots de WhatsApp: as duas formas

O site tem as duas estruturas prontas. Comece pela 1 (grátis); ligue a 2 só quando valer o custo.

| | 1. Fila semi-automática | 2. Lembretes automáticos (Meta) |
| --- | --- | --- |
| Custo | **Grátis** | Pago por mensagem (ver abaixo) |
| Quem envia | A equipe, do próprio WhatsApp, com 1 toque | O número oficial da Cloud API, sozinho |
| Precisa de | Nada além do painel | Cloud API configurada (`docs/whatsapp.md`), modelos aprovados e um cron |
| Estado | Ligada | **Desligada** (`LEMBRETES_WHATSAPP` vazio) |

## 1. Fila semi-automática (grátis)

Painel → **Fila de chamadas**. O sistema decide **quem** chamar e **com qual mensagem**; a pessoa da equipe só
toca em **Abrir WhatsApp** (o texto já vem escrito) e envia.

Regras da fila:

1. Novos cadastros primeiro (1º contato, mensagem "Boas-vindas").
2. Sem conversão 2 dias depois → 2º contato ("Lembrete").
3. Ainda sem conversão 3 dias depois → 3º e último contato ("Comunidade").
4. Saem da fila: quem converteu, número inválido, quem pediu para sair.
5. Quem acabou de ser chamado sai da fila na hora (até a próxima etapa), com o nome de quem chamou: a equipe não repete o contato.

Os textos ficam em **Mensagens e respostas** (marcadores: `{nome}`, `{atendente}`, `{cadastro}`, `{comunidade}`,
`{tutoriais}`, `{codigo}`).

Boas práticas para o número não ser bloqueado:

- até ~40 conversas novas por dia por número, espaçadas;
- mensagem curta, personalizada com o nome, sem link encurtado;
- pare quando a pessoa pedir; marque **Número inválido** quando não tiver WhatsApp.

## 2. Lembretes automáticos pela Meta (pago, desligado)

Envia sozinho, pelo número da Cloud API, **só para quem marcou** "Aceito receber mensagens do Hub Capture no
WhatsApp" no cadastro:

- **Lembrete 1**: 1 hora depois do cadastro (cadastros dos últimos 7 dias), se a pessoa ainda não converteu.
- **Lembrete 2**: 24 horas depois do lembrete 1, só se ela não respondeu.
- Nunca para quem converteu, tem número inválido ou respondeu **SAIR** (o bot confirma e para de vez).
- Cada lembrete sai no máximo uma vez por pessoa, mesmo que o cron rode duas vezes ao mesmo tempo.

### Passo a passo

1. **Cloud API funcionando** (`docs/whatsapp.md`) e um cartão cadastrado na Meta (Business → Pagamentos).
2. **Criar os modelos** no WhatsApp Manager → **Modelos de mensagem → Criar modelo**:
   categoria **Utilidade** (mais barata) se for continuação do cadastro; **Marketing** se for promoção.
   Idioma **Português (BR)**. Use `{{1}}` para o primeiro nome. Sugestões:

   - `lembrete_cadastro_1`:
     > Oi, {{1}}! Aqui é do Hub Capture. Vi que você começou seu cadastro. Para ganhar gravando com o celular,
     > finalize sua conta com o código VEMHUB: hubcapture.app/cadastro
     > Responda SAIR para não receber mais mensagens.
   - `lembrete_cadastro_2`:
     > {{1}}, ficou alguma dúvida para começar no Hub Capture? Os tutoriais em vídeo mostram tudo do cadastro ao
     > primeiro PIX: hubcapture.app/tutoriais
     > Responda SAIR para não receber mais mensagens.

   A Meta aprova em minutos ou horas. Use exatamente o nome do modelo nas variáveis abaixo.
3. **Variáveis na Vercel** (Production) e redeploy:
   - `WHATSAPP_MODELO_LEMBRETE_1=lembrete_cadastro_1`
   - `WHATSAPP_MODELO_LEMBRETE_2=lembrete_cadastro_2`
   - `WHATSAPP_MODELO_IDIOMA=pt_BR`
   - `CRON_SECRET=` uma senha longa e aleatória (32+ caracteres)
   - `LEMBRETES_WHATSAPP=ligado` (deixe por último; apagar a variável desliga tudo)
4. **Cron grátis** (o cron da Vercel no plano Hobby só roda 1 vez por dia): crie conta em
   [cron-job.org](https://cron-job.org) → **Create cronjob**:
   - URL: `https://hubcapture.app/api/cron/lembretes`
   - Execução: a cada 15 minutos
   - Advanced → Headers: `Authorization` = `Bearer SEU_CRON_SECRET`
5. **Conferir**: Saúde do sistema mostra se está ligado, quantos aceitaram, quantos saíram e os envios.
   Abrindo a URL do cron sem o cabeçalho, a resposta é 401 (correto).

### Quanto custa

A Meta cobra por **mensagem de modelo entregue** (preços do Brasil, aproximados, confira em
[developers.facebook.com/docs/whatsapp/pricing](https://developers.facebook.com/docs/whatsapp/pricing)):

| Categoria | Por mensagem | 1.000 cadastros × 2 lembretes |
| --- | --- | --- |
| Utilidade | ~US$ 0,008 | ~US$ 16 |
| Marketing | ~US$ 0,07 | ~US$ 140 |

Responder quem escreveu primeiro (dentro de 24 h) é **grátis**: é o que o assistente do WhatsApp já faz.

### Regras para não ter o número restringido

- Só envie para quem deu consentimento (o site já filtra).
- Sempre ofereça "Responda SAIR".
- No máximo 2 lembretes. Se a taxa de bloqueio subir, a Meta reduz o limite do número.
