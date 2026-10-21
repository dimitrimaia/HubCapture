# Assistente do site e do WhatsApp (Gemini)

O chat do site (botão verde no canto) e o atendimento automático do WhatsApp usam o mesmo assistente
(`lib/assistente.ts`), com o **Gemini** do Google pela API REST.

O assistente só usa o conteúdo do próprio site: as perguntas frequentes (`faqs` em `lib/site.ts`), os passos do
tutorial (`lib/tutorials.ts`) e os links oficiais (cadastro com VEMHUB, lojas, HubCap, comunidade, Instagram).
Para ele "aprender" algo novo, acrescente ao FAQ ou ao tutorial. Regras fixas: não fala em nome da Hub Data, não
promete valores nem prazos, manda o link de cadastro com VEMHUB quando couber, nunca pede senha, código ou dados
bancários e recusa com gentileza assuntos fora do tema.

## Criar a chave (grátis)

1. Entre em https://aistudio.google.com com uma conta Google.
2. **Get API key → Create API key** (pode criar um projeto novo, ex.: "hubcapture").
3. Na Vercel: **Settings → Environment Variables** → `GEMINI_API_KEY` = a chave → Redeploy.
4. Opcional: `ASSISTENTE_MODELO` para trocar o modelo (padrão `gemini-2.5-flash`; ex.: `gemini-2.5-flash-lite`,
   que tem cota gratuita maior).

Sem a chave, o chat mostra uma mensagem com o link do WhatsApp e da comunidade (a API responde 503).

## Limites do nível gratuito

- O nível gratuito **não cobra nada**, mas tem limite de pedidos por minuto e por dia, **por projeto**. A página de
  cotas do Google lista o `gemini-2.5-flash` gratuito com cerca de **10 pedidos por minuto e 250 por dia**
  (o Flash-Lite tem mais). Os números mudam: confira os seus em AI Studio → **Usage / Rate limits**.
- Cada mensagem enviada no chat ou no WhatsApp = 1 pedido. Ao estourar o limite, o assistente responde que não
  conseguiu e indica o WhatsApp/comunidade; volta sozinho quando a cota renova (o limite diário renova à meia-noite
  do horário do Pacífico, ~4h–5h em Brasília).
- Para segurar abuso, o site limita cada visitante a **20 mensagens a cada 10 minutos**.
- **Privacidade:** no nível gratuito, o Google **pode usar as conversas para melhorar os produtos dele**, inclusive
  com revisão humana. Por isso o assistente nunca pede dados pessoais, e o aviso "não é a Hub Data" aparece no chat.
  No nível pago (com faturamento ativado no projeto) o Google não usa os dados para treinar, mas aí passa a haver custo.

## Arquivos

- `lib/assistente.ts`: instruções, conhecimento e chamada ao Gemini (sem SDK).
- `app/api/chat/route.ts`: rota do chat do site (limpa o histórico: até 20 mensagens de até 1000 caracteres).
- `components/landing/chat-widget.tsx`: botão e janela do chat (a conversa fica no `sessionStorage` da aba).
