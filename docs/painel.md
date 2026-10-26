# Painel da equipe (/equipe)

Painel para a equipe chamar os cadastros no WhatsApp, acompanhar os influencers (Colab) e, para administradores,
editar mensagens, o site e cuidar do sistema.

## 1. Atualizar o banco (uma vez)

Quem já usa o banco desde antes do painel novo:

1. Supabase → seu projeto → **SQL Editor** → **New query**.
2. Cole todo o conteúdo de [`db/atualizacao-2.sql`](../db/atualizacao-2.sql) e clique em **Run**.
   O script só cria tabelas e colunas novas: os cadastros que já existem continuam lá.

Banco novo: rode [`db/setup.sql`](../db/setup.sql), que já traz tudo.

## 2. Criar o primeiro administrador

1. Na Vercel, confira que existe `EQUIPE_SENHA` (8+ caracteres). Ela é a **chave de instalação**.
2. Abra `https://hubcapture.app/equipe/login`. Enquanto não existe nenhuma conta, aparece o formulário
   **Criar o primeiro administrador**: seu nome, usuário (pode ser o e-mail), sua senha (10+ caracteres) e a chave
   de instalação (o valor de `EQUIPE_SENHA`).
3. Pronto: depois disso esse formulário some e cada pessoa entra com **usuário e senha próprios**.
   A senha compartilhada antiga deixa de servir para entrar.

## 3. Segurança: o que protege o painel

| Proteção | Como funciona |
| --- | --- |
| Conta individual | Cada pessoa tem usuário e senha. Senhas guardadas com scrypt (nunca em texto). |
| Verificação em 2 etapas | Em **Minha conta → Ativar 2 etapas**: leia o QR no Google Authenticator, Authy ou 1Password. Recomendado para todo admin. |
| Bloqueio de tentativas | 10 erros em 15 min (por IP ou por usuário) bloqueiam novas tentativas. |
| Sessão conferida a cada clique | Desativar uma conta, trocar o papel ou "Encerrar sessões" corta o acesso na hora, em todos os aparelhos. |
| Papéis | **Equipe**: fila, cadastros e colab. **Admin**: tudo + mensagens, usuários, sistema, exportação e edição do site. |
| Auditoria | Logins, falhas, exportações, mudanças de conta e de conteúdo ficam em **Saúde do sistema**. |
| Cookie seguro | httpOnly, assinado, 7 dias. Pedidos de outros sites são recusados. |

Sugestões: ative as 2 etapas, use senhas de gerenciador e desative quem saiu da equipe (não apague: o histórico
fica com o nome da pessoa).

## 4. Usuários (admin)

**Usuários → Nova conta**: nome, usuário e papel. O site gera uma **senha temporária** (mostrada uma única vez):
mande para a pessoa por um canal privado. No primeiro login ela é obrigada a criar a própria senha.
Na mesma tela: tornar admin/equipe, gerar nova senha, tirar as 2 etapas (quem perdeu o celular), encerrar sessões,
desativar. O sistema não deixa ficar sem nenhum admin ativo.

## 5. Abas

- **Fila de chamadas**: um contato por vez, na ordem certa (novos primeiro; 2º contato 2 dias depois; 3º contato
  3 dias depois; no máximo 3). Botões: Abrir WhatsApp, Pular, Já converteu, Número inválido. Mostra quantas
  chamadas você fez hoje (sugestão: até 40 por dia por número, para o WhatsApp não bloquear).
- **Cadastros**: tabela com busca, filtros (situação, origem, período, quem aceitou mensagens), ordenação,
  25/50/100 por página, seleção em lote, exportar CSV (admin) e painel de detalhes com histórico.
  Os filtros ficam na URL: dá para salvar nos favoritos ou mandar o link para alguém da equipe.
- **Colab**: inscrições de influencers com status (novo, conversando, parceiro, recusado), observações,
  chamar no WhatsApp, e-mail e exportar.
- **Mensagens e respostas** (admin): textos dos botões de WhatsApp (marcadores `{nome}`, `{atendente}` etc.) e
  respostas prontas do chat do site.
- **Saúde do sistema** (admin): variáveis configuradas (sem mostrar valores), banco, testes do assistente, da
  planilha e do WhatsApp, últimos erros e eventos.

## 6. Editar o site direto na página (admin)

Logado, o site mostra uma barra no topo com seu nome, **Painel** e **Editar página**.
Com a edição ligada, os blocos editáveis ganham contorno verde e um botão **Editar**:

- **Topo da página**: título, destaque verde, subtítulo, textos dos modos trabalho/casa, valores/h e os itens com ✓.
- **Tutoriais em vídeo**: passos (título, descrição, vídeo), adicionar, remover e reordenar. Valem para a página
  inicial, para `/tutoriais` e para o tutorial do chat.
- **Perguntas frequentes**: valem para o site, para o Google (resultado com FAQ) e para o assistente.

**Vídeos**: cole o link do YouTube (`youtube.com/watch?v=…`, `youtu.be/…` ou `/shorts/…`). Pode ser vídeo
**Não listado**. O site mostra só a miniatura e carrega o player no clique, então a página continua leve.
Também aceita link de MP4 (`https://…mp4`, ex.: Vercel Blob).

**Salvar e publicar** atualiza o site na hora. **Restaurar original** volta ao texto do código.
Membros com papel Equipe veem a barra, mas não editam.
