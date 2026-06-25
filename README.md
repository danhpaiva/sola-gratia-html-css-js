# As Doutrinas da Graça

> Estudo bíblico interativo dos seis pilares da soberania de Deus na salvação — 150 versículos da NVI.

[![Deploy to GitHub Pages](https://github.com/danhpaiva/sola-gratia-html-css-js/actions/workflows/deploy.yml/badge.svg)](https://github.com/danhpaiva/sola-gratia-html-css-js/actions/workflows/deploy.yml)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-live-22c55e?logo=github)](https://danhpaiva.github.io/sola-gratia-html-css-js/)
[![Last Commit](https://img.shields.io/github/last-commit/danhpaiva/sola-gratia-html-css-js?label=%C3%BAltimo%20commit)](https://github.com/danhpaiva/sola-gratia-html-css-js/commits/main)
[![Repo Size](https://img.shields.io/github/repo-size/danhpaiva/sola-gratia-html-css-js)](https://github.com/danhpaiva/sola-gratia-html-css-js)
[![License: MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-3b82f6)](LICENSE)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Zero Dependencies](https://img.shields.io/badge/depend%C3%AAncias-zero-6366f1)
![Versículos](https://img.shields.io/badge/vers%C3%ADculos-150%20NVI-eab308)
![Dark Mode](https://img.shields.io/badge/dark%20mode-✓-1e3a5f)
![Mobile Ready](https://img.shields.io/badge/mobile-responsivo-0ea5e9)

---

## Visão geral

**As Doutrinas da Graça** é um site estático, sem dependências externas de runtime, focado em tornar o estudo bíblico sobre a soberania de Deus acessível, rápido e agradável. Cada um dos seis pilares agrupa 25 versículos da Nova Versão Internacional (NVI) em um acordeão interativo com rastreamento de progresso individual.

O projeto roda integralmente no navegador — HTML, CSS e JavaScript puro — e é publicado automaticamente no GitHub Pages a cada push na branch `main`.

---

## Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| **6 pilares / 150 versículos** | Soberania Exaustiva, Depravação Total, Eleição Incondicional, Expiação Particular, Chamado Eficaz e Preservação Eterna |
| **Acordeão de versículos** | Abertura/fechamento suave com animação CSS (`grid-template-rows`) |
| **Abrir todos / Fechar todos** | Atalho para visualização ou impressão completa do pilar |
| **Barra de progresso** | Rastreia quantos versículos foram abertos por pilar; persiste via `localStorage` |
| **Copiar versículo** | Copia texto + referência expandida (ex.: "Rm 8.28" → "Romanos 8.28") para a área de transferência |
| **Favoritos** | Marca versículos para revisão posterior; lista agrupada por pilar; badge de contagem no nav |
| **Busca em tempo real** | Filtra por referência ou palavra-chave em todos os pilares, com destaque de termos encontrados |
| **Roteamento por hash** | URLs limpas (`#soberania`, `#favoritos`) com suporte total a voltar/avançar no browser |
| **Tema claro / escuro** | Detecta a preferência do sistema; toggle manual persiste em `localStorage` |
| **Animações de entrada** | Fade + slide escalonado em cards e versículos; respeita `prefers-reduced-motion` |
| **Versão para impressão** | Layout limpo com `@media print`, acordeões forçados abertos e tipografia otimizada |
| **Open Graph / Twitter Card** | Metadados para preview rico ao compartilhar em redes sociais e WhatsApp |
| **Acessibilidade** | ARIA roles, `aria-expanded`, `aria-live`, navegação por teclado e foco visível |

---

## Stack

- **HTML5** semântico, sem framework
- **CSS** com custom properties, Grid, animações e `@media print`
- **JavaScript** vanilla (IIFE), sem dependências de runtime
- **Fontes:** [Lora](https://fonts.google.com/specimen/Lora) (serif) + [Lexend](https://fonts.google.com/specimen/Lexend) (sans-serif) via Google Fonts
- **CI/CD:** GitHub Actions → GitHub Pages

---

## Estrutura do projeto

```
sola-gratia-html-css-js/
├── index.html              # Estrutura HTML, meta OG/Twitter, scripts
├── assets/
│   ├── css/
│   │   └── style.css       # Estilos, temas, animações, print (~1 300 linhas)
│   ├── js/
│   │   ├── data.js         # PILLARS — 6 objetos com 25 versículos cada
│   │   └── app.js          # Toda a lógica de UI (IIFE, ~730 linhas)
│   └── img/
│       └── og-image.svg    # Imagem de preview para redes sociais (1200×630)
└── .github/
    └── workflows/
        └── deploy.yml      # Pipeline de deploy automático para GitHub Pages
```

---

## Como executar localmente

O projeto é HTML estático puro — basta servir a pasta raiz com qualquer servidor HTTP local.

```bash
# Opção 1 — Python (sem instalação extra)
python -m http.server 3000

# Opção 2 — Node.js (npx, sem instalação global)
npx serve .

# Opção 3 — VS Code
# Instale a extensão "Live Server" e clique em "Go Live"
```

Acesse `http://localhost:3000` no navegador.

> **Nota:** abrir o `index.html` diretamente como `file://` funciona para a maioria das funcionalidades, mas `navigator.clipboard` requer HTTPS ou `localhost`.

---

## Deploy

O deploy é automático via GitHub Actions ao fazer push na branch `main`.

```
push → main  ──►  actions/checkout
                  actions/configure-pages
                  actions/upload-pages-artifact
                  actions/deploy-pages
                       │
                       └──► https://danhpaiva.github.io/sola-gratia-html-css-js/
```

Para ativar o GitHub Pages no repositório:

1. **Settings → Pages → Source:** selecione `GitHub Actions`
2. Atualize as URLs de Open Graph em `index.html` (linhas `og:url` e `og:image`) com o seu usuário
3. Faça push na `main` — o workflow cuida do resto

---

## Paleta de cores

O projeto usa um sistema de tokens CSS (`custom properties`) com suporte a tema claro e escuro.

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--crimson` | `#1e3a5f` | — | Cor primária (títulos, botões, bordas ativas) |
| `--crimson-dark` | `#0f1f35` | — | Header, footer, hover profundo |
| `--gold` | `#eab308` | — | Destaque, badge, barra de progresso |
| `--bg-page` | `#f8fafc` | `#080e1a` | Fundo da página |
| `--bg-surface` | `#ffffff` | `#111827` | Cards, inputs |

---

## Dados (data.js)

Todos os versículos estão em `assets/js/data.js`, exportados como constante global `PILLARS`:

```js
const PILLARS = [
  {
    id: 'soberania',
    title: 'Soberania Exaustiva',
    icon: '👑',
    description: '...',
    verses: [
      { ref: 'Dt 32.39', text: 'Veja agora que eu sou o único Deus...' },
      // 24 versículos restantes
    ]
  },
  // 5 pilares restantes
];
```

Para adicionar ou editar versículos, basta modificar esse arquivo — nenhuma outra alteração é necessária.

---

## Licença

Distribuído sob a licença **MIT**. Versículos da **Nova Versão Internacional (NVI)**.
