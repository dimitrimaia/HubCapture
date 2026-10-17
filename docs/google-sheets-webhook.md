# Leads no Google Sheets (Colab e Cadastro)

O site envia os leads pelo servidor (`lib/webhook.ts`) para um Google Apps Script, que grava na planilha.
Cada envio tem o campo `tipo`: `colab` (formulário de influencers) ou `cadastro` (página `/cadastro`).

## 1. Código do Apps Script

Na planilha: **Extensões → Apps Script**. Apague o conteúdo do arquivo e cole:

```js
const COLUNAS = {
  colab: ['criadoEm', 'nome', 'perfil', 'seguidores', 'email', 'whatsapp', 'consentimento', 'origem'],
  cadastro: ['criadoEm', 'nome', 'whatsapp', 'origem'],
}
const ABAS = { colab: 'Colab', cadastro: 'Cadastro' }

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

// Abrir a URL /exec no navegador deve mostrar {"ok":true,"status":"online"}
function doGet() {
  return resposta({ ok: true, status: 'online' })
}

function resposta(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(ContentService.MimeType.JSON)
}
```

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
2. Adicione `COLAB_WEBHOOK_URL` com a URL `/exec` (ambientes Production e Preview).
3. **Redeploy** o projeto (variáveis só valem para deploys novos).

O arquivo `.env.example` do repositório não é lido em produção; sem a variável na Vercel os leads só aparecem nos logs.

## 4. Testar

- Abra a URL `/exec` no navegador: deve aparecer `{"ok":true,"status":"online"}`.
  Se pedir login do Google, o acesso não está como "Qualquer pessoa".
- Envie o formulário no site e confira as abas **Colab** / **Cadastro**.
- Se não gravar, veja os logs da função na Vercel (Deployments → Functions/Logs): o site registra
  `[leads] Webhook ... respondeu ...` com a resposta do Apps Script.
