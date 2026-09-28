// Shared styles for /zona-solutii and its stories — same rhythm as the
// catalog / brands heroes: mono eyebrow, big Neuton title, mono stats.
export const SOLUTIONS_CSS = `
  .zs-page { padding-top: var(--nav-h); }
  .zs-wrap { max-width: 1440px; margin: 0 auto; padding: 0 var(--gutter); }
  .zs-section { padding-top: var(--space-section); }

  /* ── Hero ── */
  .zs-hero { padding: clamp(72px, 12vh, 128px) 0 clamp(48px, 7vh, 88px); }
  .zs-crumbs { display: flex; align-items: center; gap: 8px; margin-bottom: 32px; flex-wrap: wrap; }
  .zs-crumb {
    display: inline-flex; align-items: center; height: 28px; padding: 0 14px;
    border: 1px solid rgba(0,0,0,0.18); border-radius: 4px;
    font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; font-weight: 500;
    letter-spacing: 0.1em; text-transform: uppercase; color: rgba(0,0,0,0.45); text-decoration: none;
    transition: color 150ms, border-color 150ms;
  }
  .zs-crumb:hover { color: rgb(0,0,0); border-color: rgba(0,0,0,0.4); }
  .zs-crumb-sep, .zs-crumb-cur {
    font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; font-weight: 500;
    letter-spacing: 0.1em; text-transform: uppercase; color: rgba(0,0,0,0.45);
  }
  .zs-crumb-sep { color: rgba(0,0,0,0.25); }
  .zs-hero .eyebrow-mono { margin-bottom: 20px; }
  .zs-title {
    font-family: 'Neuton', serif; font-weight: 400;
    font-size: clamp(56px, 8vw, 128px); line-height: 0.92; letter-spacing: -0.015em;
    color: rgb(0,0,0); margin-bottom: 28px;
  }
  .zs-title .red { color: rgb(217,44,43); }
  .zs-headline {
    font-family: 'Neuton', serif; font-weight: 400;
    font-size: clamp(24px, 2.4vw, 34px); line-height: 1.15; color: rgb(0,0,0);
    max-width: 760px; margin-bottom: 16px;
  }
  .zs-sub {
    font-family: 'Recursive', sans-serif; font-size: 16px; line-height: 1.6;
    color: rgba(0,0,0,0.55); max-width: 620px; margin-bottom: 36px;
  }
  .zs-stats { display: flex; gap: 32px; flex-wrap: wrap; align-items: baseline; }
  .zs-stat { display: flex; align-items: baseline; gap: 8px; }
  .zs-stat-num { font-family: 'JetBrains Mono', ui-monospace, monospace; font-weight: 500; font-size: 22px; letter-spacing: -0.02em; color: rgb(0,0,0); font-variant-numeric: tabular-nums; }
  .zs-stat-label { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(0,0,0,0.4); }
  .zs-brands { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 24px; }
  .zs-brand {
    display: inline-flex; align-items: center; gap: 8px; height: 32px; padding: 0 12px;
    background: rgb(244,244,244); border-radius: 4px; text-decoration: none;
    font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.04em;
    text-transform: uppercase; color: rgb(0,0,0); transition: background 150ms;
  }
  .zs-brand:hover { background: rgb(232,232,232); }
  .zs-brand span { font-family: 'JetBrains Mono', ui-monospace, monospace; font-weight: 400; color: rgba(0,0,0,0.4); }

  /* ── Intro: lead left, the job in three steps right ── */
  .zs-intro { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 16px; border-top: 1px solid rgba(0,0,0,0.08); padding-top: 48px; }
  .zs-lead { grid-column: span 6; font-family: 'Neuton', serif; font-size: clamp(24px, 2.2vw, 32px); line-height: 1.25; color: rgb(0,0,0); padding-right: 32px; }
  .zs-steps { grid-column: 8 / span 5; display: flex; flex-direction: column; }
  .zs-step { display: grid; grid-template-columns: 48px 1fr; padding: 20px 0; border-bottom: 1px solid rgba(0,0,0,0.08); }
  .zs-step:first-child { padding-top: 0; }
  .zs-step-n { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; color: rgb(217,44,43); letter-spacing: 0.1em; padding-top: 3px; }
  .zs-step-t { font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 600; color: rgb(0,0,0); margin-bottom: 6px; }
  .zs-step-p { font-family: 'Recursive', sans-serif; font-size: 14px; line-height: 1.6; color: rgba(0,0,0,0.55); }

  /* ── Application photo ── */
  .zs-image { position: relative; height: 62vh; min-height: 320px; max-height: 680px; border-radius: 10px; overflow: hidden; background: rgb(238,238,238); }
  .zs-image-cap {
    position: absolute; left: 20px; bottom: 20px; z-index: 1;
    padding: 8px 12px; background: rgb(255,255,255); border-radius: 4px;
    font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(0,0,0,0.6);
  }

  /* ── Carousel ── */
  .zs-car-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 24px; }
  .zs-car-title { font-family: 'Neuton', serif; font-weight: 400; font-size: clamp(30px, 3vw, 44px); line-height: 1; letter-spacing: -0.01em; color: rgb(0,0,0); margin-bottom: 10px; }
  .zs-car-text { font-family: 'Recursive', sans-serif; font-size: 14px; line-height: 1.6; color: rgba(0,0,0,0.55); max-width: 560px; }
  .zs-car-link {
    flex-shrink: 0; display: inline-flex; align-items: center; gap: 10px; height: 44px; padding: 0 18px;
    border: 1px solid rgba(0,0,0,0.85); border-radius: 4px; text-decoration: none; white-space: nowrap;
    font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgb(0,0,0);
    transition: background 150ms, color 150ms;
  }
  .zs-car-link:hover { background: rgb(0,0,0); color: rgb(255,255,255); }
  .zs-car-link b { font-family: 'JetBrains Mono', ui-monospace, monospace; font-weight: 500; }
  .zs-scroll { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 6px; scroll-snap-type: x mandatory; scrollbar-width: thin; }
  .zs-scroll > * { flex: 0 0 240px; scroll-snap-align: start; }

  /* ── Checklist ── */
  .zs-check-title { font-family: 'Neuton', serif; font-weight: 400; font-size: clamp(30px, 3vw, 44px); line-height: 1; color: rgb(0,0,0); margin-bottom: 28px; }
  .zs-check { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
  .zs-check-item {
    display: flex; flex-direction: column; gap: 8px; min-height: 168px; padding: 24px;
    border: 1px solid rgba(0,0,0,0.08); border-radius: 6px; background: rgb(255,255,255);
    text-decoration: none; transition: box-shadow 150ms, border-color 150ms;
  }
  .zs-check-item:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.06); border-color: rgba(0,0,0,0.14); }
  .zs-check-n { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; color: rgb(217,44,43); letter-spacing: 0.1em; }
  .zs-check-name { font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 600; color: rgb(0,0,0); }
  .zs-check-why { font-family: 'Recursive', sans-serif; font-size: 13px; line-height: 1.6; color: rgba(0,0,0,0.55); }
  .zs-check-go { margin-top: auto; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(0,0,0,0.45); }
  .zs-check-item:hover .zs-check-go { color: rgb(217,44,43); }

  /* ── Tip ── */
  .zs-tip { border-left: 2px solid rgb(217,44,43); padding: 8px 0 8px 32px; max-width: 980px; }
  .zs-tip-text { font-family: 'Neuton', serif; font-size: clamp(26px, 2.6vw, 38px); line-height: 1.2; color: rgb(0,0,0); margin-bottom: 16px; }
  .zs-tip-by { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(0,0,0,0.45); }

  /* ── FAQ ── */
  .zs-faq { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 16px; }
  .zs-faq-title { grid-column: span 4; font-family: 'Neuton', serif; font-weight: 400; font-size: clamp(30px, 3vw, 44px); line-height: 1; color: rgb(0,0,0); }
  .zs-faq-list { grid-column: 6 / span 7; }
  .zs-faq-item { border-top: 1px solid rgba(0,0,0,0.1); }
  .zs-faq-item:last-child { border-bottom: 1px solid rgba(0,0,0,0.1); }
  .zs-faq-item summary {
    list-style: none; cursor: pointer; display: flex; justify-content: space-between; gap: 24px; padding: 22px 0;
    font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 600; color: rgb(0,0,0);
  }
  .zs-faq-item summary::-webkit-details-marker { display: none; }
  .zs-faq-item summary::after { content: '+'; font-family: 'JetBrains Mono', ui-monospace, monospace; font-weight: 400; color: rgba(0,0,0,0.4); }
  .zs-faq-item[open] summary::after { content: '–'; }
  .zs-faq-item p { font-family: 'Recursive', sans-serif; font-size: 14px; line-height: 1.7; color: rgba(0,0,0,0.6); padding: 0 0 24px; max-width: 640px; }

  /* ── Story cards (index + related) ── */
  .zs-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
  .zs-card {
    display: flex; flex-direction: column; overflow: hidden;
    border: 1px solid rgba(0,0,0,0.08); border-radius: 6px; background: rgb(255,255,255);
    text-decoration: none; transition: box-shadow 150ms, border-color 150ms;
  }
  .zs-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.06); border-color: rgba(0,0,0,0.14); }
  .zs-card-img { position: relative; aspect-ratio: 4 / 3; background: rgb(238,238,238); overflow: hidden; }
  .zs-card-img img { transition: transform 600ms cubic-bezier(0.22,1,0.36,1); }
  .zs-card:hover .zs-card-img img { transform: scale(1.03); }
  .zs-card-body { display: flex; flex-direction: column; gap: 10px; padding: 24px; flex: 1; }
  .zs-card-domain { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: rgb(217,44,43); }
  .zs-card-title { font-family: 'Neuton', serif; font-weight: 400; font-size: 36px; line-height: 1; color: rgb(0,0,0); }
  .zs-card-text { font-family: 'Recursive', sans-serif; font-size: 13.5px; line-height: 1.6; color: rgba(0,0,0,0.55); }
  .zs-card-meta { margin-top: auto; padding-top: 14px; display: flex; justify-content: space-between; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(0,0,0,0.45); }
  .zs-card:hover .zs-card-meta b { color: rgb(217,44,43); }
  .zs-card-meta b { font-weight: 400; color: rgb(0,0,0); transition: color 150ms; }
  .zs-related-title { font-family: 'Neuton', serif; font-weight: 400; font-size: clamp(30px, 3vw, 44px); line-height: 1; color: rgb(0,0,0); margin-bottom: 28px; }
  .zs-end { padding-bottom: var(--space-section); }

  .zs-title-long { font-size: clamp(44px, 5.6vw, 88px); max-width: 1100px; }

  /* ── Comparison table ── */
  .zs-compare-text { margin: -16px 0 24px; }
  .zs-compare-wrap { overflow-x: auto; border: 1px solid rgba(0,0,0,0.08); border-radius: 6px; background: rgb(255,255,255); }
  .zs-compare { width: 100%; border-collapse: collapse; min-width: 640px; }
  .zs-compare th, .zs-compare td { text-align: left; vertical-align: top; padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,0.06); }
  .zs-compare tr:last-child > * { border-bottom: none; }
  .zs-compare thead th {
    font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; font-weight: 500;
    letter-spacing: 0.12em; text-transform: uppercase; color: rgba(0,0,0,0.45); background: rgb(250,250,250);
  }
  .zs-compare tbody th { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; color: rgb(0,0,0); white-space: nowrap; }
  .zs-compare td { font-family: 'Recursive', sans-serif; font-size: 14px; line-height: 1.55; color: rgba(0,0,0,0.65); }
  .zs-compare-note { font-family: 'Recursive', sans-serif; font-size: 13px; line-height: 1.6; color: rgba(0,0,0,0.5); max-width: 760px; margin-top: 14px; }

  /* ── Rules of thumb ── */
  .zs-rules { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
  .zs-rule {
    display: grid; grid-template-columns: auto 1fr; gap: 6px 14px; align-items: baseline;
    padding: 22px 24px; border: 1px solid rgba(0,0,0,0.08); border-radius: 6px; background: rgb(255,255,255);
  }
  .zs-rule-if, .zs-rule-arrow { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(0,0,0,0.4); }
  .zs-rule-arrow { color: rgb(217,44,43); font-size: 14px; letter-spacing: 0; }
  .zs-rule-when { font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 600; color: rgb(0,0,0); }
  .zs-rule-then { font-family: 'Recursive', sans-serif; font-size: 14px; line-height: 1.6; color: rgba(0,0,0,0.6); }

  /* ── How-to steps ── */
  .zs-howto { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0 16px; counter-reset: none; }
  .zs-howto-step { padding: 24px 0 28px; border-top: 1px solid rgba(0,0,0,0.12); }
  .zs-howto-n { display: block; font-family: 'Neuton', serif; font-size: 40px; line-height: 1; color: rgb(217,44,43); margin-bottom: 14px; }

  /* ── Call to action ── */
  .zs-cta {
    display: flex; align-items: center; justify-content: space-between; gap: 32px;
    padding: 40px; border-radius: 10px; background: rgb(18,18,18); color: rgb(255,255,255);
  }
  .zs-cta-title { font-family: 'Neuton', serif; font-weight: 400; font-size: clamp(28px, 2.8vw, 40px); line-height: 1.05; margin-bottom: 10px; }
  .zs-cta-text { font-family: 'Recursive', sans-serif; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.6); max-width: 620px; }
  .zs-cta-btn {
    flex-shrink: 0; display: inline-flex; align-items: center; gap: 10px; height: 52px; padding: 0 24px;
    background: rgb(217,44,43); color: rgb(255,255,255); border-radius: 4px; text-decoration: none; white-space: nowrap;
    font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
    transition: background 150ms;
  }
  .zs-cta-btn:hover { background: rgb(190,35,34); }

  /* ── Index: featured story + groups ── */
  .zs-featured {
    display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); overflow: hidden;
    border-radius: 10px; background: rgb(18,18,18); color: rgb(255,255,255); text-decoration: none; margin-bottom: 16px;
  }
  .zs-featured-img { grid-column: span 7; position: relative; min-height: 420px; background: rgb(40,40,40); }
  .zs-featured-body { grid-column: span 5; display: flex; flex-direction: column; gap: 14px; padding: 40px; }
  .zs-featured .zs-card-domain { color: rgb(217,44,43); }
  .zs-featured-title { font-family: 'Neuton', serif; font-size: clamp(40px, 4vw, 64px); line-height: 0.95; }
  .zs-featured-head { font-family: 'Neuton', serif; font-size: 22px; line-height: 1.25; color: rgba(255,255,255,0.85); }
  .zs-featured-text { font-family: 'Recursive', sans-serif; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.6); }
  .zs-featured .zs-card-meta { color: rgba(255,255,255,0.5); }
  .zs-featured .zs-card-meta b { color: rgb(255,255,255); }
  .zs-featured:hover .zs-card-meta b { color: rgb(217,44,43); }
  .zs-group { padding-top: var(--space-section); }
  .zs-group-head { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; margin-bottom: 28px; border-top: 1px solid rgba(0,0,0,0.08); padding-top: 24px; }
  .zs-group-title { font-family: 'Neuton', serif; font-weight: 400; font-size: clamp(32px, 3.4vw, 52px); line-height: 1; color: rgb(0,0,0); }
  .zs-group-count { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(0,0,0,0.4); }
  .zs-card.compact .zs-card-title { font-size: 28px; line-height: 1.05; }

  /* ── Product stories ── */
  .zs-product { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 16px; }
  .zs-product-img { grid-column: span 6; position: relative; aspect-ratio: 4 / 3; border-radius: 10px; background: rgb(255,255,255); border: 1px solid rgba(0,0,0,0.08); overflow: hidden; }
  .zs-product-img img { padding: 32px; }
  .zs-product-body { grid-column: 8 / span 5; display: flex; flex-direction: column; gap: 16px; justify-content: center; }
  .zs-product-name { font-family: 'Neuton', serif; font-weight: 400; font-size: clamp(32px, 3vw, 48px); line-height: 1; color: rgb(0,0,0); }
  .zs-product-short { font-family: 'Recursive', sans-serif; font-size: 16px; line-height: 1.6; color: rgba(0,0,0,0.65); }
  .zs-product-features { list-style: none; display: flex; flex-direction: column; border-top: 1px solid rgba(0,0,0,0.08); }
  .zs-product-features li { font-family: 'Recursive', sans-serif; font-size: 14px; line-height: 1.55; color: rgba(0,0,0,0.6); padding: 12px 0 12px 22px; border-bottom: 1px solid rgba(0,0,0,0.08); position: relative; }
  .zs-product-features li::before { content: ''; position: absolute; left: 0; top: 20px; width: 10px; height: 1px; background: rgb(217,44,43); }
  .zs-product-btn { align-self: flex-start; }
  .zs-gallery { display: grid; gap: 16px; grid-template-columns: 2fr 1fr; grid-template-rows: 1fr 1fr; height: clamp(360px, 56vh, 620px); }
  .zs-gallery.n1 { grid-template-columns: 1fr; grid-template-rows: 1fr; }
  .zs-gallery.n2 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr; }
  .zs-gallery-item { position: relative; border-radius: 10px; overflow: hidden; background: rgb(238,238,238); }
  .zs-gallery.n3 .zs-gallery-item:first-child { grid-row: span 2; }
  .zs-specs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 48px; }
  .zs-spec-group-name { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: rgb(217,44,43); margin-bottom: 8px; }
  .zs-spec-group { margin-bottom: 16px; }
  .zs-spec-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.08); }
  .zs-spec-row dt { font-family: 'Recursive', sans-serif; font-size: 14px; color: rgba(0,0,0,0.55); }
  .zs-spec-row dd { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 13px; color: rgb(0,0,0); }
  .zs-proscons { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
  .zs-pc { padding: 32px; border-radius: 10px; background: rgb(255,255,255); border: 1px solid rgba(0,0,0,0.08); }
  .zs-pc-title { display: flex; align-items: center; gap: 12px; font-family: 'Neuton', serif; font-weight: 400; font-size: 32px; line-height: 1; color: rgb(0,0,0); margin-bottom: 20px; }
  .zs-pc-mark { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 4px; background: rgb(18,18,18); color: rgb(255,255,255); font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 14px; }
  .zs-pc-mark.plus { background: rgb(217,44,43); }
  .zs-pc ul { list-style: none; }
  .zs-pc li { font-family: 'Recursive', sans-serif; font-size: 14px; line-height: 1.6; color: rgba(0,0,0,0.65); padding: 10px 0; border-top: 1px solid rgba(0,0,0,0.06); }
  .zs-verdict { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 16px; border-top: 2px solid rgb(217,44,43); padding-top: 32px; }
  .zs-verdict > div:first-child { grid-column: span 7; }
  .zs-verdict .eyebrow-mono { margin-bottom: 16px; }
  .zs-verdict-for { grid-column: 9 / span 4; display: flex; flex-direction: column; gap: 12px; }
  .zs-verdict-for ul { list-style: none; }
  .zs-verdict-for li { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; color: rgb(0,0,0); padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,0.08); }
  .zs-verdict-for .zs-car-link { align-self: flex-start; margin-top: 8px; }

  @media (max-width: 1024px) {
    .zs-product-img, .zs-product-body, .zs-verdict > div:first-child, .zs-verdict-for { grid-column: 1 / -1; }
    .zs-specs, .zs-proscons { grid-template-columns: 1fr; }
    .zs-howto { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .zs-featured-img, .zs-featured-body { grid-column: 1 / -1; }
    .zs-featured-img { min-height: 280px; }
    .zs-cards, .zs-check { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .zs-lead { grid-column: 1 / -1; padding-right: 0; }
    .zs-steps { grid-column: 1 / -1; margin-top: 16px; }
    .zs-faq-title, .zs-faq-list { grid-column: 1 / -1; }
  }
  @media (max-width: 640px) {
    .zs-gallery, .zs-gallery.n2 { grid-template-columns: 1fr; grid-template-rows: none; height: auto; }
    .zs-gallery-item { aspect-ratio: 4 / 3; }
    .zs-gallery.n3 .zs-gallery-item:first-child { grid-row: auto; }
    .zs-pc { padding: 24px; }
    .zs-rules, .zs-howto { grid-template-columns: 1fr; }
    .zs-cta { flex-direction: column; align-items: flex-start; padding: 28px; }
    .zs-featured-body { padding: 28px; }
    .zs-cards, .zs-check { grid-template-columns: 1fr; }
    .zs-car-head { flex-direction: column; align-items: flex-start; }
    .zs-image { height: 44vh; }
    .zs-tip { padding-left: 20px; }
  }
`
