# Leads no Google Sheets (Colab e Cadastro)

| Variável na Vercel | Planilha | Formulário |
| --- | --- | --- |
| `CADASTRO_WEBHOOK_URL` | Usuários Cadastrados HubCapture | página `/cadastro` (nome + WhatsApp) |
| `INFLUENCER_WEBHOOK_URL` | Afiliados / influencers | modal "Colab com Influencers" |

`COLAB_WEBHOOK_URL` é o nome antigo. Se ele existir sozinho, é usado **só para o cadastro** (os influencers não entram
nessa planilha e ficam apenas nos logs). Cada planilha tem seu próprio Apps Script (Extensões → Apps Script dentro dela)
com o código abaixo; o script grava cada envio na aba do seu `tipo`.

Para testar sem adivinhar: painel → **Saúde do sistema → Testar planilha** mostra se a URL responde, se o token
confere e quantas linhas vieram.

O site envia os leads pelo servidor (`lib/webhook.ts`) para um Google Apps Script, que grava na planilha.
Cada envio tem o campo `tipo`:

- `cadastro`: nome + WhatsApp da página `/cadastro` (aba **Cadastro**);
- `acao`: botão tocado no próximo passo (`cadastrar`, `whatsapp`, `comunidade`) e chamados da equipe
  (`chamado:boas-vindas` etc., com quem chamou) (aba **Acoes**);
- `colab`: formulário de influencers (aba **Colab**).

Com o banco de dados configurado (`docs/banco-de-dados.md`), a planilha vira **cópia de segurança**: o painel
`/equipe/leads` (e `/equipe/colab`) lê do banco. O botão **Importar da planilha** traz para o banco quem já está na aba Cadastro,
usando o `doGet` com token abaixo.

## 1. Código do Apps Script

Na planilha: **Extensões → Apps Script**. Apague o conteúdo do arquivo e cole:

```js
const COLUNAS = {
  colab: ['criadoEm', 'nome', 'perfil', 'seguidores', 'email', 'whatsapp', 'consentimento', 'origem'],
  cadastro: ['criadoEm', 'nome', 'whatsapp', 'origem', 'consentimento', 'utm_source', 'utm_medium', 'utm_campaign', 'ref'],
  acao: ['criadoEm', 'whatsapp', 'nome', 'acao', 'por', 'origem'],
}
const ABAS = { colab: 'Colab', cadastro: 'Cadastro', acao: 'Acoes' }
// Só estas abas podem ser lidas pelo doGet.
// Planilha de cadastros: ['Cadastro']. Planilha de influencers: ['Colab'].
const ABAS_LEITURA = ['Cadastro']

function doPost(e) {
  const lock = LockService.getScriptLock()
  lock.waitLock(10000)
  try {
    const dados = JSON.parse(e.postData.contents)
    const tipo = COLUNAS[dados.tipo] ? dados.tipo : 'colab'
    const planilha = SpreadsheetApp.getActiveSpreadsheet()
    const aba = planilha.getSheetByName(ABAS[tipo]) || planilha.insertSheet(ABAS[tipo])
    if (aba.getLastRow() === 0) aba.appendRow(COLUNAS[tipo])
    aba.appendRow(COLUNAS[tipo].map((coluna) => dados[coluna] ?? ''))
    return resposta({ ok: true })
  } catch (erro) {
    return resposta({ ok: false, erro: String(erro) })
  } finally {
    lock.releaseLock()
  }
}

// Sem token: {"ok":true,"status":"online"} (teste no navegador).
// Com ?token=...&aba=Cadastro: devolve as linhas para o botão "Importar da planilha" do site.
function doGet(e) {
  const token = PropertiesService.getScriptProperties().getProperty('TOKEN_LEITURA')
  const pedido = (e && e.parameter) || {}
  if (!pedido.token) return resposta({ ok: true, status: 'online' })
  if (!token || pedido.token !== token) return resposta({ ok: false, erro: 'Token inválido.' })

  const nomeAba = pedido.aba || 'Cadastro'
  if (ABAS_LEITURA.indexOf(nomeAba) === -1) return resposta({ ok: false, erro: 'Aba não liberada para leitura.' })
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nomeAba)
  if (!aba || aba.getLastRow() < 2) return resposta({ ok: true, linhas: [] })

  const [cabecalho, ...valores] = aba.getDataRange().getValues()
  const linhas = valores.map((linha) => {
    const item = {}
    cabecalho.forEach((coluna, i) => (item[coluna] = linha[i]))
    return item
  })
  return resposta({ ok: true, linhas })
}

function resposta(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(ContentService.MimeType.JSON)
}
```

### Token de leitura (para importar os leads)

1. No editor do Apps Script: **Configurações do projeto** (engrenagem) → **Propriedades do script** →
   **Adicionar propriedade**: nome `TOKEN_LEITURA`, valor = uma senha longa e aleatória
   (ex.: gere em https://1password.com/password-generator, 32+ caracteres).
2. Na Vercel, crie `PLANILHA_LEITURA_TOKEN` com **o mesmo valor**.

Na **planilha de influencers**, troque `ABAS_LEITURA` para `['Colab']`, crie o `TOKEN_LEITURA` dela e coloque o
mesmo valor em `INFLUENCER_LEITURA_TOKEN` na Vercel (sem essa variável, o site tenta o `PLANILHA_LEITURA_TOKEN`).
Assim o botão **Importar planilha** da aba Colab do painel funciona.

Colunas novas na aba Cadastro: se ela já existe, escreva na primeira linha, a partir da coluna E:
`consentimento`, `utm_source`, `utm_medium`, `utm_campaign`, `ref` (de onde a pessoa veio, ver docs/painel.md).
A coluna `consentimento` fica `TRUE` quando a pessoa marcou "Aceito receber mensagens no WhatsApp".

O token fica só no Apps Script e na Vercel, nunca no código. Sem ele, a URL `/exec` não devolve nenhum dado.

O script precisa estar **vinculado à planilha** (criado por Extensões → Apps Script dentro dela).
Se for um projeto avulso, troque `SpreadsheetApp.getActiveSpreadsheet()` por `SpreadsheetApp.openById('ID_DA_PLANILHA')`.

## 2. Implantar

1. **Implantar → Nova implantação → tipo "App da Web"**.
2. **Executar como:** Eu. **Quem pode acessar:** Qualquer pessoa.
3. Autorize as permissões e copie a URL que termina em `/exec`.
4. **Toda vez que mudar o código**, vá em Implantar → Gerenciar implantações → editar (lápis) → **Versão: Nova versão**.
   Sem isso a URL continua rodando o código antigo.

## 3. Conectar ao site (Vercel)

1. Vercel → projeto → **Settings → Environment Variables**.
2. Adicione `CADASTRO_WEBHOOK_URL` e `INFLUENCER_WEBHOOK_URL`, cada uma com a URL `/exec` da sua planilha (Production e Preview).
3. **Redeploy** o projeto (variáveis só valem para deploys novos).

O arquivo `.env.example` do repositório não é lido em produção; sem a variável na Vercel os leads só aparecem nos logs.

## 4. Trocar a URL que ficou pública (influencers)

A URL antiga da planilha de influencers chegou a ficar no `.env.example` deste repositório público. Quem tiver a URL
consegue **enviar** linhas falsas para a planilha. Gere uma nova e desative a antiga:

1. Na planilha de influencers: Extensões → Apps Script → **Implantar → Gerenciar implantações**.
2. Selecione a implantação atual → **Arquivar** (a URL antiga para de funcionar).
3. **Implantar → Nova implantação** (App da Web, Executar como: Eu, Acesso: Qualquer pessoa) → copie a nova URL `/exec`.
4. Na Vercel, atualize `INFLUENCER_WEBHOOK_URL` com a nova URL e faça redeploy.

## 5. Testar

- Abra a URL `/exec` no navegador: deve aparecer `{"ok":true,"status":"online"}`.
  Se pedir login do Google, o acesso não está como "Qualquer pessoa".
- Envie o formulário no site e confira as abas **Colab** / **Cadastro**.
- Se não gravar, veja os logs da função na Vercel (Deployments → Functions/Logs): o site registra
  `[leads] Webhook ... respondeu ...` com a resposta do Apps Script.
