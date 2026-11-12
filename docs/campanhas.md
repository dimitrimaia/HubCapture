# Campanhas de disparo no WhatsApp (/equipe/campanhas)

Disparos com **modelos aprovados na Meta**, escolhidos no painel, com acompanhamento de enviadas, entregues, lidas,
respostas e falhas. As respostas chegam na aba **Atendimento**, com a mensagem da campanha no histórico.

## Regras que o sistema garante
- Só recebe quem **marcou "aceito receber mensagens"** no cadastro (WhatsApp Business Policy + LGPD).
  Cadastros importados da planilha sem esse aceite **não recebem**.
- Nunca recebe quem respondeu **SAIR** ou tem **número inválido**.
- A mesma campanha nunca chega duas vezes à mesma pessoa, mesmo com o painel e o agendador enviando juntos.
- Opção de **não repetir** para quem recebeu outra campanha nos últimos 3, 7, 15 ou 30 dias.
- **Limite diário** de contatos (o "nível" do seu número na Meta). Ao chegar no limite, o resto fica na fila.
- Se a Meta recusar por token, conta ou qualidade, a campanha **pausa sozinha** em vez de errar com todo mundo.

## Configurar (uma vez)
1. A Cloud API do WhatsApp precisa estar funcionando (`docs/whatsapp.md`): `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`,
   `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN` e o webhook apontando para `https://hubcapture.app/api/whatsapp`.
2. **`WHATSAPP_WABA_ID`**: Meta → WhatsApp Manager → **Visão geral da conta** → "ID da conta do WhatsApp Business".
   É com ele que o painel lista os modelos aprovados.
3. **Token permanente:** o token temporário do painel de desenvolvedor vence em 24 h. Crie um **usuário do sistema**
   (Configurações do negócio → Usuários do sistema), dê acesso ao app e à conta do WhatsApp com as permissões
   `whatsapp_business_messaging` e `whatsapp_business_management`, e gere um token sem validade.
4. **`WHATSAPP_LIMITE_DIARIO`**: o nível do seu número no WhatsApp Manager (250, 1000, 10000…). Padrão: 250.
5. **Agendador** (para continuar com o painel fechado): no cron-job.org, a cada 10 minutos, chame
   `https://hubcapture.app/api/cron/campanhas` com o cabeçalho `Authorization: Bearer SEU_CRON_SECRET`.
6. **Verify token do webhook** (`WHATSAPP_VERIFY_TOKEN`): um texto que você inventa, igual na Vercel e na Meta.
   Use **só letras, números e hífen** (ex.: `hubcap-webhook-x8k3m9q2t7`) e **nunca** uma senha real. Depois de mudar na
   Vercel, o site só usa o valor novo após um deploy novo. Teste no navegador:
   `https://hubcapture.app/api/whatsapp?hub.mode=subscribe&hub.challenge=123&hub.verify_token=SEU_TOKEN` deve mostrar `123`.
7. No webhook da Meta, o campo **messages** precisa estar assinado: é por ele que chegam as respostas e os status
   (entregue, lida, falhou).

## Criar e disparar
1. **Campanhas WhatsApp → Nova campanha.**
2. Dê um nome e escolha o modelo. Modelos com vídeo/imagem no cabeçalho ou botão com link variável aparecem desabilitados.
3. Diga o que vai em cada variável: **primeiro nome** do cadastro ou um **texto fixo** (ex.: o código VEMHUB).
4. Escolha o público. O número "Vai receber" e o custo estimado atualizam na hora.
5. **Teste no seu WhatsApp** antes. Depois, **Salvar e revisar** (ainda não envia nada).
6. Na tela da campanha: **Iniciar disparo**. Dá para **Pausar**, **Retomar** e **Cancelar**.

## Custos (aproximados, Brasil)
A Meta cobra por mensagem de modelo **entregue**: ~US$ 0,0068 (Utilidade) e ~US$ 0,0625 (Marketing).
Confira a tabela atual em developers.facebook.com/docs/whatsapp/pricing. Responder quem escreveu nas últimas 24 h é grátis.

## Usar o mesmo número em dois sites (ex.: Hub Capture e o clone)
Dá para os dois sites **enviarem** com o mesmo número (mesmo token e `WHATSAPP_PHONE_NUMBER_ID`), mas o app da Meta tem
**um único endereço de webhook**: as **respostas e os status** chegam em um site só. Duas opções:
- **Um número por site** (o mais organizado): cada site com seu número e seu webhook.
- **Um painel central:** disparar e atender tudo por este painel, e deixar o outro site só com o chat do site.
