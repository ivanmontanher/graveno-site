(() => {
  const html = document.documentElement;
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const celular = () => matchMedia("(max-width: 899px)").matches;
  const temGsap = !!(window.gsap && window.ScrollTrigger);
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const brl = (n, d = 0) => "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
  const fmt = (n, d = 0) => n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const INVEST = 35377;
  const LOJAS = window.LOJAS || 7;

  /* ── Números com contagem ─────────────────────────────────── */
  const escreve = (el, v) => { const t = el.hasAttribute("data-mil") ? fmt(Math.round(v)) : String(Math.round(v)); el.textContent = (el.dataset.pre || "") + t + (el.dataset.suf || ""); };

  /* ── Vídeos: fundo sem som e sala com som ─────────────────── */
  const enviar = (f, method, value) => { try { f.contentWindow.postMessage(JSON.stringify(value ? { method, value } : { method }), "https://player.vimeo.com"); } catch (_) {} };
  addEventListener("message", (e) => {
    if (e.origin !== "https://player.vimeo.com") return;
    let d; try { d = typeof e.data === "string" ? JSON.parse(e.data) : e.data; } catch (_) { return; }
    const f = $$(".video-fundo iframe").find((x) => x.contentWindow === e.source);
    if (!f || !d) return;
    if (d.event === "ready") { enviar(f, "addEventListener", "play"); enviar(f, "addEventListener", "timeupdate"); }
    if (d.event === "play" || d.event === "timeupdate") f.classList.add("pronto");
  });
  if (!reduzir) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      const box = e.target, f = box.querySelector("iframe");
      if (e.isIntersecting && !f) {
        const n = document.createElement("iframe");
        n.src = `https://player.vimeo.com/video/${box.dataset.vimeo}?background=1&autoplay=1&loop=1&muted=1&autopause=0&controls=0&title=0&byline=0&portrait=0&dnt=1`;
        n.allow = "autoplay; fullscreen; picture-in-picture"; n.tabIndex = -1; n.setAttribute("aria-hidden", "true"); n.title = "";
        box.appendChild(n);
      } else if (f) enviar(f, e.isIntersecting ? "play" : "pause");
    }), { rootMargin: "80% 0px" });
    $$(".video-fundo[data-vimeo]").forEach((b) => io.observe(b));
  }
  const sala = $(".sala"), tela = $(".sala-tela");
  let lenis = null, arrastou = false;
  document.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-abrir]");
    if (!b || arrastou) return;
    ev.preventDefault();
    tela.innerHTML = `<iframe src="https://player.vimeo.com/video/${b.dataset.abrir}?autoplay=1&title=0&byline=0&portrait=0&dnt=1" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Vídeo"></iframe>`;
    $(".sala-cred").textContent = b.dataset.cred || "";
    sala.classList.toggle("vertical", b.hasAttribute("data-vertical"));
    sala.showModal(); lenis && lenis.stop();
  });
  $(".sala-fechar").addEventListener("click", () => sala.close());
  sala.addEventListener("close", () => { tela.innerHTML = ""; lenis && lenis.start(); });
  sala.addEventListener("click", (e) => { if (e.target === sala) sala.close(); });

  /* ── Antes e depois arrastáveis ───────────────────────────── */
  $$(".ad").forEach((ad) => {
    const alca = ad.querySelector(".ad-alca");
    const poe = (p) => { p = clamp(p, 0.03, 0.97) * 100; ad.style.setProperty("--corte", p + "%"); alca.setAttribute("aria-valuenow", Math.round(p)); };
    let arrasto = false, x0 = 0;
    ad.addEventListener("pointerdown", (e) => { arrasto = true; x0 = e.clientX; arrastou = false; });
    ad.addEventListener("pointermove", (e) => { if (!arrasto) return; if (Math.abs(e.clientX - x0) > 4) { arrastou = true; const r = ad.getBoundingClientRect(); poe((e.clientX - r.left) / r.width); } });
    ad.addEventListener("pointerup", () => { arrasto = false; setTimeout(() => (arrastou = false), 0); });
    ad.addEventListener("pointercancel", () => (arrasto = false));
    ad.addEventListener("pointerleave", () => (arrasto = false));
    alca.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); poe((+alca.getAttribute("aria-valuenow") + (e.key === "ArrowLeft" ? -5 : 5)) / 100); } });
  });

  /* ── Calculadoras ─────────────────────────────────────────── */
  const val = (id) => +$("#" + id).value;
  const o = (k, t) => $$(`[data-o="${k}"]`).forEach((e) => (e.textContent = t));
  const r = (k, t) => $$(`[data-r="${k}"]`).forEach((e) => (e.textContent = t));
  const pinta = (i) => i.style.setProperty("--p", ((i.value - i.min) / (i.max - i.min)) * 100 + "%");
  const pct = (x) => fmt(x, x % 1 ? 1 : 0) + "%";
  const calc = () => {
    const dia = val("c-dia"), mes = dia * 30 * 60, sobra = mes - INVEST;
    o("dia", dia);
    const res = $('[data-r="faca"]');
    res.innerHTML = sobra >= 0
      ? `Com ${dia} pedidos a mais por dia, vocês faturam <strong>${brl(mes)}</strong> a mais por mês. A Graveno custa ${brl(INVEST)}. Sobram <strong>${brl(sobra)}</strong> no caixa.`
      : `Com ${dia} pedidos a mais por dia, vocês faturam ${brl(mes)} a mais por mês. A Graveno custa ${brl(INVEST)}. <span class="neg">Ainda não se pagou.</span>`;
    const hora = val("c-hora"), horas = val("c-horas"), t = hora * horas * 4.33;
    o("hora", brl(hora)); o("horas", horas + " h"); r("tempo", brl(t)); r("tempoConta", `${brl(hora)} × ${horas} h por semana × 4,33 semanas no mês.`);
    $$('input[type="range"]').forEach(pinta);
  };
  $$('input[type="range"]').forEach((i) => i.addEventListener("input", calc));
  calc();
  // contas que dependem do número de lojas
  $$("[data-lojas]").forEach((e) => (e.textContent = LOJAS));
  $$("[data-lojas-n]").forEach((e) => (e.dataset.n = LOJAS));
  $$("[data-por-loja]").forEach((e) => (e.textContent = fmt(Math.round((INVEST / 60 / 30 / LOJAS) * 10) / 10, 1)));
  $$("[data-inv-loja]").forEach((e) => (e.textContent = brl(INVEST / LOJAS, 2) + " por loja"));
  r("dom", `se cada loja vender 3 mesas a mais por domingo, são ${brl(3 * 60 * LOJAS * 52)} a mais por ano (3 mesas × R$ 60 × ${LOJAS} lojas × 52 domingos).`);

  /* ── Hambúrguer: quadros na rolagem ───────────────────────── */
  const Q = window.HERO_QUADROS || {};
  const hero = $(".hero-b"), canvas = $(".hero-b-canvas"), ctx = canvas.getContext("2d");
  const modo = celular() ? "m" : "d", total = Q[modo] || 0;
  const quadros = [];
  let alvo = 0, atual = 0, desenhado = -1;
  const src = (i) => `/assets/proposta-sandubao/hero/${modo}/f_${String(i + 1).padStart(4, "0")}.webp`;
  const pronto = (i) => quadros[i] && quadros[i].complete && quadros[i].naturalWidth;
  const ajusta = () => { const dpr = Math.min(devicePixelRatio || 1, 2); canvas.width = canvas.clientWidth * dpr; canvas.height = canvas.clientHeight * dpr; desenhado = -1; desenha(true); };
  function desenha(forca) {
    if (!total) return;
    const i = Math.round(atual); let j = -1;
    for (let d = 0; d < total; d++) { if (pronto(i - d)) { j = i - d; break; } if (pronto(i + d)) { j = i + d; break; } }
    if (j < 0 || (j === desenhado && !forca)) return;
    ctx.drawImage(quadros[j], 0, 0, canvas.width, canvas.height);
    if (desenhado < 0) hero.classList.add("tocando");
    desenhado = j;
  }
  if (total) {
    const fila = [0]; for (const p of [12, 6, 3, 1]) for (let i = 0; i < total; i += p) if (!fila.includes(i)) fila.push(i);
    let k = 0; const lote = () => { for (let n = 0; n < 6 && k < fila.length; n++) { const i = fila[k++]; const im = new Image(); im.decoding = "async"; im.src = src(i); im.onload = () => { if (desenhado < 0 || Math.abs(Math.round(atual) - i) < 2) desenha(true); }; quadros[i] = im; } if (k < fila.length) setTimeout(lote, 30); };
    const ir = () => lote(); document.readyState === "complete" ? ir() : addEventListener("load", ir, { once: true });
    addEventListener("resize", ajusta); ajusta();
  }

  /* ── Sem animação: estados finais ─────────────────────────── */
  if (reduzir || !temGsap) {
    $$(".n[data-n]").forEach((el) => escreve(el, +el.dataset.n));
    $("[data-vaza]").textContent = brl(90000);
    html.classList.add("app-ok");
    return;
  }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  if (window.Lenis) { lenis = new window.Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) }); lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }

  gsap.to(".progresso span", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.2 } });

  // Palavras por trás da máscara
  $$(".palavras").forEach((el) => {
    const walk = (no) => [...no.childNodes].forEach((c) => {
      if (c.nodeType === 3) { const f = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach((p) => { if (!p) return; if (/^\s+$/.test(p)) return f.appendChild(document.createTextNode(" ")); const w = document.createElement("span"); w.className = "p-w"; const i = document.createElement("span"); i.className = "p-i"; i.textContent = p; w.appendChild(i); f.appendChild(w); }); c.replaceWith(f); }
      else if (c.nodeType === 1) walk(c);
    });
    walk(el);
    gsap.fromTo(el.querySelectorAll(".p-i"), { yPercent: 115 }, { yPercent: 0, stagger: 0.05, ease: "none", scrollTrigger: { trigger: el, start: "top 92%", end: "top 55%", scrub: 0.5 } });
  });
  // Cortes de cena
  $$(".cena-p, .domingo").forEach((s) => gsap.fromTo(s, { clipPath: "inset(8% 5% 0% 5% round 8px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none", scrollTrigger: { trigger: s, start: "top bottom", end: "top 35%", scrub: true } }));
  // Itens entrando
  $$(".evid article, .plano li, .dias li, .provas li, .tempo li, .numeros > div, .bloco, .inv tr, .tres-fones > *, .notas tr").forEach((el) =>
    gsap.from(el, { y: 28, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 92%", toggleActions: "play none none reverse" } }));
  // Contadores
  $$(".n[data-n]").forEach((el) => { escreve(el, 0); const ob = { v: 0 }; ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => gsap.to(ob, { v: +el.dataset.n, duration: 1.8, ease: "power3.out", onUpdate: () => escreve(el, ob.v) }) }); });
  // Linha do tempo
  gsap.to(".tempo", { "--l": 1, ease: "none", scrollTrigger: { trigger: ".tempo", start: "top 80%", end: "bottom 60%", scrub: true } });
  // Domingo: silêncio, depois o celular
  gsap.from(".domingo .fone-v", { y: 60, opacity: 0, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: ".domingo .fone-v", start: "top 85%" } });

  /* Hero: quadros + textos */
  const hbs = $$(".hb"), faixas = [[0, 0.3], [0.36, 0.72], [0.78, 1.01]]; let ativo = -1;
  ScrollTrigger.create({ trigger: hero, start: "top top", end: "bottom bottom", onUpdate: (st) => {
    alvo = clamp(st.progress / 0.9) * Math.max(0, total - 1);
    const m = faixas.findIndex(([a, b]) => st.progress >= a && st.progress < b);
    if (m !== ativo) { if (ativo >= 0) gsap.to(hbs[ativo], { autoAlpha: 0, y: -20, duration: 0.4, overwrite: true }); if (m >= 0) gsap.fromTo(hbs[m], { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", overwrite: true }); hbs.forEach((h, i) => h.classList.toggle("on", i === m)); ativo = m; }
    hero.classList.toggle("andou", st.progress > 0.02);
  } });
  gsap.delayedCall(0.2, () => { gsap.fromTo(hbs[0], { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out" }); ativo = 0; hbs[0].classList.add("on"); });
  gsap.ticker.add(() => { if (!total) return; atual += (alvo - atual) * 0.2; if (Math.abs(alvo - atual) < 0.02) atual = alvo; desenha(false); });

  /* Balde furado */
  const jf = $$(".jf"), jfb = $$(".jfb"), fu = $$(".fu"), se = $$(".se"), li = $$(".furos-lista li"), vaz = $("[data-vaza]"), vazBox = $(".vazando");
  gsap.set(".poca", { scale: 0.25, transformOrigin: "50% 50%" });
  const tB = gsap.timeline({ scrollTrigger: { trigger: ".balde", start: "top top", end: "bottom bottom", scrub: 0.5 } });
  tB.fromTo(".jato", { attr: { height: 0 } }, { attr: { height: 330 }, duration: 0.06, ease: "none" }, 0)
    .fromTo(".nivel", { attr: { y: 560 } }, { attr: { y: 330 }, duration: 0.16, ease: "none" }, 0.03)
    .fromTo(".onda", { attr: { transform: "translate(0 560)" } }, { attr: { transform: "translate(0 330)" }, duration: 0.16, ease: "none" }, 0.03);
  fu.forEach((f, i) => { const t = 0.2 + i * 0.06; tB.to(f, { opacity: 1, duration: 0.01 }, t).to([jf[i], jfb[i]], { strokeDashoffset: 0, duration: 0.05, ease: "power2.out" }, t); });
  tB.to(".poca", { scale: 1, duration: 0.38, ease: "none" }, 0.2)
    .to(".nivel", { attr: { y: 470 }, duration: 0.38, ease: "none" }, 0.22).to(".onda", { attr: { transform: "translate(0 470)" }, duration: 0.38, ease: "none" }, 0.22)
    .to(".b1", { opacity: 0, y: -16, duration: 0.03 }, 0.6).fromTo(".b2", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.03 }, 0.63);
  se.forEach((s, i) => { const t = 0.64 + i * 0.035; tB.fromTo(s, { opacity: 0, scale: 2.2, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.02 }, t).to([jf[i], jfb[i]], { strokeDashoffset: 260, duration: 0.03 }, t); });
  tB.to(".poca", { scale: 0.08, opacity: 0.4, duration: 0.18, ease: "power1.in" }, 0.7)
    .to(".nivel", { attr: { y: 234 }, duration: 0.2, ease: "power1.out" }, 0.74).to(".onda", { attr: { transform: "translate(0 232)" }, duration: 0.2, ease: "power1.out" }, 0.74)
    .fromTo(".transbordo", { opacity: 0, y: 20 }, { opacity: 1, y: -30, duration: 0.08 }, 0.9).to({}, { duration: 0.04 });
  ScrollTrigger.create({ trigger: ".balde", start: "top top", end: "bottom bottom", onUpdate: (st) => {
    const p = st.progress;
    li.forEach((l, i) => { const ab = p >= 0.2 + i * 0.06, tp = p >= 0.64 + i * 0.035; l.classList.toggle("on", ab && !tp); l.classList.toggle("tampado", tp); });
    const vaza = p < 0.2 ? 0 : p < 0.56 ? 90000 * clamp((p - 0.2) / 0.36) : p < 0.84 ? 90000 * (1 - clamp((p - 0.64) / 0.2)) : 0;
    vaz.textContent = brl(Math.round(vaza / 10) * 10); vazBox.classList.toggle("tampado", p >= 0.84);
  } });

  /* Tags 3D: flutuam, giram em sentidos opostos e reagem ao mouse */
  const ta = $(".tag-a .tag-corpo"), tb = $(".tag-b .tag-corpo");
  let mx = 0, my = 0, rotA = 0, rotB = 0, rolar = 0;
  addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });
  addEventListener("deviceorientation", (e) => { if (e.gamma == null) return; mx = clamp(e.gamma / 60, -0.5, 0.5); my = clamp((e.beta - 45) / 90, -0.5, 0.5); });
  ScrollTrigger.create({ trigger: ".mesa", start: "top bottom", end: "bottom top", onUpdate: (st) => (rolar = st.progress - 0.5) });
  gsap.ticker.add((t) => {
    rotA += 0.35; rotB -= 0.28;
    const ry = Math.sin(rotA / 60) * 30 + mx * 18 + rolar * 40, rx = 14 + Math.cos(rotA / 70) * 8 - my * 12;
    ta.style.transform = `translateY(${Math.sin(t * 1.2) * 8}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(-8deg)`;
    ta.querySelector(".tag-brilho").style.setProperty("--br", 30 + ry * 1.2 + "%");
    const ry2 = Math.sin(rotB / 55) * 34 - mx * 16 - rolar * 40, rx2 = 18 + Math.cos(rotB / 65) * 10 + my * 10;
    tb.style.transform = `translateY(${Math.cos(t * 1.1) * 10}px) rotateX(${rx2}deg) rotateY(${ry2}deg) rotateZ(10deg)`;
    tb.querySelector(".tag-brilho").style.setProperty("--br", 40 - ry2 * 1.2 + "%");
  });

  addEventListener("load", () => ScrollTrigger.refresh());
  html.classList.add("app-ok");
})();
