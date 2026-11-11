# Login do painel /admin (configuração única)

O GitHub Pages não guarda segredos, então o login com GitHub passa por este
pequeno Cloudflare Worker (plano grátis).

## 1. Criar o Worker
1. Entre em https://dash.cloudflare.com, depois **Workers & Pages > Create > Create Worker**.
2. Dê um nome (ex.: `parkour-oauth`), clique em **Deploy** e depois em **Edit code**.
3. Apague o código de exemplo, cole o conteúdo de `worker.js` e clique em **Deploy**.
4. Anote a URL, ex.: `https://parkour-oauth.SEU-USUARIO.workers.dev`.

## 2. Criar o OAuth App no GitHub
1. Vá em https://github.com/settings/developers, depois **OAuth Apps > New OAuth App**.
2. Preencha:
   - **Homepage URL:** `https://gersxlnd.github.io/parkourJourney/`
   - **Authorization callback URL:** `https://parkour-oauth.SEU-USUARIO.workers.dev/callback`
3. Crie o app, copie o **Client ID** e gere um **Client secret**.

## 3. Configurar as variáveis do Worker
No Worker, vá em **Settings > Variables and Secrets** e adicione:

| Nome | Tipo | Valor |
|---|---|---|
| `GITHUB_CLIENT_ID` | Text | o Client ID |
| `GITHUB_CLIENT_SECRET` | Secret | o Client secret |
| `ALLOWED_ORIGIN` | Text | `https://gersxlnd.github.io` (sem barra no final) |

## 4. Apontar o painel para o Worker
Em `admin/config.yml`, troque `base_url` pela URL do Worker e faça commit e push.

## Usando
Abra `https://gersxlnd.github.io/parkourJourney/admin/`, clique em **Login with GitHub**,
vá em **Gallery > Gallery screenshots > Add Screenshot**, envie a imagem e a legenda e clique em **Publish**.
Cada publicação vira um commit, e o site atualiza em ~1 minuto.

Só contas com permissão de escrita no repositório conseguem salvar. Visitantes não conseguem.
