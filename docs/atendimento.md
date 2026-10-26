# Central de atendimento (/equipe/atendimento)

Todas as conversas do **chat do site** e do **WhatsApp** num lugar só, como Digisac ou Zendesk, sem custo extra.

## Como funciona

| Status | Quem responde | Quando acontece |
| --- | --- | --- |
| **Com o robô** | o assistente (Gemini + respostas prontas) | toda conversa começa assim |
| **Na fila** | ninguém ainda: a pessoa espera um humano | ela escreveu "atendente", "humano", "falar com uma pessoa"… ou tocou em **Falar com uma pessoa** no chat do site |
| **Com a equipe** | a pessoa da equipe que assumiu | alguém tocou em **Assumir** ou respondeu |
| **Resolvida** | — | alguém tocou em **Resolver**. Se a pessoa escrever de novo, volta para o robô |

Enquanto a conversa está **na fila** ou **com a equipe**, o robô não responde nada.

## No dia a dia

1. Menu **Atendimento**: o número vermelho é quantas pessoas estão na fila. O título da aba do navegador também mostra `(2)`.
2. Abra a conversa, leia o histórico completo (o que a pessoa perguntou e o que o robô respondeu) e responda.
   Responder já assume a conversa. **⚡** traz as mensagens prontas (as mesmas de Mensagens e respostas).
3. Terminou: **Resolver**. Quer que o robô continue: **Devolver ao robô**.
4. Abas: **Minhas** (as que você assumiu), **Com a equipe**, **Com o robô** (para acompanhar o que o assistente anda respondendo), **Resolvidas**, **Todas**.
   Busca por nome, número ou trecho da mensagem.
5. **Ver cadastro** abre a pessoa na aba Cadastros (quando o WhatsApp ou o navegador dela bate com um cadastro).

A tela atualiza sozinha (a cada 3 a 5 segundos enquanto está aberta). No celular funciona igual: lista → conversa → voltar.

## Canais

- **Chat do site**: a resposta aparece no chat da própria pessoa, com o seu nome ("Dimitri · equipe"). Ela vê
  "Aguardando uma pessoa da equipe…" enquanto está na fila. Se ela fechar o chat, aparece um número vermelho no botão
  quando chega resposta. O botão **Falar com uma pessoa** só aparece para quem já deixou o cadastro no site
  (o atendimento humano é para quem usa o VEMHUB); escrever "atendente" funciona para todos, e a conversa
  aparece como **sem cadastro** para você decidir.
- **WhatsApp** (precisa da Cloud API, `docs/whatsapp.md`): a resposta sai pelo número oficial, **grátis**, desde que
  a pessoa tenha escrito nas últimas **24 horas** (regra da Meta). Depois disso o painel bloqueia o envio e avisa:
  use a Fila de chamadas (seu WhatsApp) ou espere ela escrever de novo. Áudios e imagens aparecem como `[áudio]` / `[imagem]`.

## Segurança e privacidade

- Só quem tem login no painel vê as conversas (papel Equipe ou Admin).
- No site, cada navegador tem um código secreto aleatório; o banco guarda só o hash dele. Ninguém lê a conversa de outra pessoa.
- O chat avisa no aceite que as conversas ficam salvas para o atendimento.
- Respostas da equipe têm chave de idempotência: clicar duas vezes não manda a mensagem em dobro.

## Instalar

Rode `db/atualizacao-4.sql` no Supabase (SQL Editor → Run). Banco novo: o `db/setup.sql` já traz tudo.
