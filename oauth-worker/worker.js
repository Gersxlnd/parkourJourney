// Cloudflare Worker: login GitHub (OAuth) para o Decap CMS.
//
// Variáveis no painel do Worker (Settings > Variables and Secrets):
//   GITHUB_CLIENT_ID      (texto)
//   GITHUB_CLIENT_SECRET  (secret)
//   ALLOWED_ORIGIN        ex.: https://gersxlnd.github.io

const STATE_COOKIE = 'decap_oauth_state';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/auth') return startAuth(url, env);
    if (url.pathname === '/callback') return finishAuth(request, url, env);
    return new Response('Not found', { status: 404 });
  },
};

function startAuth(url, env) {
  const state = crypto.randomUUID();
  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  authorize.searchParams.set('redirect_uri', `${url.origin}/callback`);
  authorize.searchParams.set('scope', 'public_repo,read:user');
  authorize.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorize.toString(),
      'Cache-Control': 'no-store',
      'Set-Cookie': `${STATE_COOKIE}=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}

async function finishAuth(request, url, env) {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookie = request.headers.get('Cookie') || '';
  const savedState = cookie.match(new RegExp(`${STATE_COOKIE}=([^;]+)`))?.[1];

  if (!code || !state || state !== savedState) {
    return reply(env, 'error', { message: 'Invalid OAuth state' });
  }

  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${url.origin}/callback`,
    }),
  });
  const data = await res.json().catch(() => ({}));

  if (!data.access_token) {
    return reply(env, 'error', { message: data.error_description || 'Login failed' });
  }
  return reply(env, 'success', { token: data.access_token, provider: 'github' });
}

// Protocolo de popup do Decap CMS: avisa a janela do painel e, quando ela
// responde, envia o token — só para a origem do seu site (ALLOWED_ORIGIN).
function reply(env, status, content) {
  const message = `authorization:github:${status}:${JSON.stringify(content)}`;
  // escapa "<" para nenhum texto vindo do GitHub conseguir fechar o <script>
  const js = (value) => JSON.stringify(value).replace(/</g, '\\u003c');
  const html = `<!doctype html><html><body><script>
    (function () {
      var allowed = ${js(env.ALLOWED_ORIGIN)};
      var message = ${js(message)};
      window.addEventListener('message', function (e) {
        if (e.origin !== allowed) return;
        window.opener.postMessage(message, allowed);
        setTimeout(function () { window.close(); }, 200);
      });
      window.opener.postMessage('authorizing:github', allowed);
    })();
  </script></body></html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Set-Cookie': `${STATE_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
      // a página carrega o token: nunca guardar em cache
      'Cache-Control': 'no-store',
      // não pode ser embutida em iframe nem carregar nada externo
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "default-src 'none'; script-src 'unsafe-inline'; frame-ancestors 'none'",
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
