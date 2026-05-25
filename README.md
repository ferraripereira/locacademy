# LocAcademy — Site Institucional

Site do LocAcademy, projeto educacional da ODuo focado em donos de locadora de equipamentos.

**Stack:** Astro 4 + Tailwind CSS + TypeScript
**Hospedagem:** Vercel (deploy automático via GitHub)
**Domínio:** `academy.oduo.com.br`

---

## 🚀 Primeiros passos (rodando localmente)

### 1. Instalar Node.js

Se ainda não tem, baixa e instala em [nodejs.org](https://nodejs.org/) — escolhe a versão **LTS** (mais estável). Depois disso, abre o terminal e confere:

```bash
node --version
npm --version
```

Os dois precisam responder com um número de versão.

### 2. Instalar dependências do projeto

Dentro da pasta `site-locacademy`, roda:

```bash
npm install
```

Vai demorar uns 2 minutos na primeira vez. Cria uma pasta `node_modules/` com tudo que o site precisa pra funcionar.

### 3. Rodar o site localmente

```bash
npm run dev
```

Vai aparecer no terminal algo como:

```
🚀 astro v4.x.x started in 500ms
📡 Local:    http://localhost:4321/
```

Abre `http://localhost:4321/` no navegador. Pronto — site rodando no seu computador.

**Toda vez que você salvar um arquivo, o site recarrega sozinho.** Não precisa apertar refresh.

### 4. Buildar pra produção (opcional, antes do deploy)

```bash
npm run build
```

Gera a pasta `dist/` com o site pronto pra ir pro ar.

---

## 🎯 Subir pro ar (deploy no Vercel)

### Primeira vez (configuração)

1. **Cria conta no GitHub** ([github.com](https://github.com)) se ainda não tem
2. **Cria conta no Vercel** ([vercel.com](https://vercel.com)) — login com sua conta GitHub (mais fácil)
3. **Cria um repositório no GitHub** chamado `locacademy` (pode ser público ou privado)
4. **Push do projeto pro GitHub** — usando GitHub Desktop ou no terminal:

   ```bash
   git init
   git add .
   git commit -m "Setup inicial do LocAcademy"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/locacademy.git
   git push -u origin main
   ```

5. **No Vercel:** clica em "Add New Project" → seleciona o repositório `locacademy` → deixa tudo no padrão → "Deploy"
6. **Em ~2 minutos**, o Vercel te dá uma URL tipo `locacademy.vercel.app`. Confere se o site abre lá.

### Configurar o subdomínio `academy.oduo.com.br`

1. No Vercel: vai em **Project Settings → Domains**
2. Adiciona `academy.oduo.com.br`
3. Vercel vai pedir um registro CNAME apontando pra `cname.vercel-dns.com`
4. No Hostinger: **DNS Zone Editor** do domínio `oduo.com.br`
5. Cria registro:
   - Tipo: `CNAME`
   - Name: `academy`
   - Target: `cname.vercel-dns.com` (ou o que o Vercel mandar)
   - TTL: deixa o padrão (3600)
6. Propagação: 5 minutos a 2 horas
7. Depois disso, `academy.oduo.com.br` vai abrir o site

### Deploys seguintes (super fácil)

A partir do setup inicial, **toda vez que você fizer `git push` na branch `main`**, o Vercel faz deploy automático em ~30 segundos. Você não precisa fazer mais nada.

---

## 📝 Como editar o site no dia-a-dia

### Editar texto de uma página

Os textos das páginas ficam em arrays no topo de cada arquivo `.astro`. Exemplo — pra editar a Home:

1. Abre `src/pages/index.astro`
2. No topo do arquivo (entre os `---`), você vê arrays como `modules`, `instructors`, `problems`, `audience`, `stats`
3. Edita o texto que quiser
4. Salva o arquivo
5. Commita e dá push → Vercel publica em ~30s

### Trocar uma foto

1. Salva a foto nova em `public/fotos/` com o mesmo nome da antiga (ex.: `lucas.jpg`)
2. Commita e dá push

### Trocar uma cor

Todas as cores ficam em `tailwind.config.mjs`. Mexe lá em 1 lugar só e a cor muda em todo o site.

### Criar um artigo novo no blog

1. Cria um arquivo `.md` em `src/content/blog/` — ex.: `como-precificar-locacao.md`
2. Copia o cabeçalho (frontmatter) do arquivo `exemplo-artigo.md` e ajusta
3. Escreve o conteúdo abaixo do `---` em markdown puro
4. Quando quiser publicar, muda `draft: true` pra `draft: false`
5. Commita e dá push → artigo no ar

**Exemplo de cabeçalho de artigo:**

```markdown
---
title: "Como precificar locação de equipamentos: o guia completo"
description: "Aprenda a calcular o preço justo da diária com fórmula e exemplo."
pubDate: 2026-06-15
keywords: ["precificação locação", "preço diária equipamento"]
draft: false
---

# Conteúdo do artigo aqui em markdown
```

### Editar via GitHub web (sem precisar do computador)

Se você só quer trocar um texto rapidinho:

1. Vai no GitHub do projeto
2. Navega até o arquivo
3. Clica no ícone de lápis (editar)
4. Mexe no texto
5. Em baixo, "Commit changes"
6. Vercel publica em ~30s

---

## 📂 Estrutura de pastas

```
site-locacademy/
├── public/                    ← arquivos estáticos (fotos, favicon, logos)
│   ├── fotos/                 ← fotos dos instrutores
│   └── logos/                 ← logos ODuo (3 variações)
│
├── src/
│   ├── components/            ← componentes reusáveis (Header, Footer, Button, etc)
│   ├── layouts/               ← layout base (header + footer + meta tags)
│   ├── pages/                 ← cada arquivo aqui vira uma página
│   │   ├── index.astro        ← Home (/)
│   │   ├── curso.astro        ← /curso
│   │   ├── sobre.astro        ← /sobre
│   │   ├── cadastro.astro     ← /cadastro
│   │   ├── obrigado.astro     ← /obrigado
│   │   └── blog/
│   │       ├── index.astro    ← /blog (listagem)
│   │       └── [...slug].astro ← /blog/[artigo] (página dinâmica)
│   │
│   ├── content/
│   │   ├── config.ts          ← schema dos artigos
│   │   └── blog/              ← UM arquivo .md por artigo aqui
│   │
│   └── styles/
│       └── global.css         ← estilos globais e tokens
│
├── astro.config.mjs           ← configuração do Astro
├── tailwind.config.mjs        ← cores, fontes, espaçamentos (1 lugar só)
├── package.json               ← dependências do projeto
└── README.md                  ← este arquivo
```

---

## ⚠️ Pendências antes do site ir pro ar

Lista do que ainda precisa ser feito antes do lançamento (Sprint 1-4 do plano):

### Conteúdo

- [ ] Salvar **3 logos da ODuo** em `public/logos/`:
  - `oduo-white.png` (branco em transparente)
  - `oduo-white-on-blue.png` (branco em fundo azul)
  - `oduo-blue-on-white.png` (azul em fundo branco)
- [ ] Salvar **fotos dos instrutores** em `public/fotos/`:
  - `lucas.jpg`, `murilo.jpg`, `joao.jpg`
- [ ] Criar imagem **`og-image.jpg`** em `public/` (1200x630px — aparece quando alguém compartilha no WhatsApp)
- [ ] Criar **`favicon.svg`** em `public/`
- [ ] **Detalhar aulas dos módulos** em `src/pages/curso.astro` (array `modules`)
- [ ] **Bio do Murilo e do João** em `src/pages/sobre.astro`
- [ ] **Bio do Lucas** em `src/pages/sobre.astro` (3-4 linhas)
- [ ] **Números reais da ODuo** em `src/pages/index.astro` (array `stats`)
- [ ] **Telefone/WhatsApp da ODuo** em `src/components/Footer.astro` e `src/pages/obrigado.astro`
- [ ] **Escrever 3 artigos SEO** seguindo briefings (doc 05)

### Integração

- [ ] Integrar formulário de `/cadastro` com Hotmart (ou Zapier → Hotmart)
- [ ] Configurar GA4 (Google Analytics) — colar tag no `BaseLayout.astro`
- [ ] Configurar Meta Pixel — idem

### Deploy

- [ ] Criar conta GitHub e Vercel
- [ ] Push do projeto pro GitHub
- [ ] Deploy no Vercel
- [ ] Configurar subdomínio `academy.oduo.com.br` no Hostinger
- [ ] Testar fluxo end-to-end (cadastro → e-mail → acesso ao curso)

---

## 🆘 Quando algo der errado

**Erro no `npm install`:** rode `npm cache clean --force` e tenta de novo.

**Site quebrado em dev:** confere no terminal qual arquivo deu erro. 90% das vezes é uma vírgula faltando.

**Build falha no Vercel:** vai em Vercel → projeto → Deployments → último deploy → ver logs. O erro aparece em vermelho.

**DNS não propaga:** espera mais tempo (até 24h em casos raros) ou usa [whatsmydns.net](https://whatsmydns.net) pra checar.

**Quando travar de verdade:** chama o adviser e cola o erro completo. Não tenta debug sozinho por mais de 30 minutos — não compensa.

---

**Stack:** Astro 4 · Tailwind 3 · TypeScript 5
**Mantido por:** Lucas Pereira / ODuo
**Adviser estratégico:** ver `ODuo Educação/` na pasta raiz
