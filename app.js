(() => {
  const S = window.SITE || {};
  const html = document.documentElement;
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const celular = () => matchMedia("(max-width: 760px)").matches;
  const economia = !!(navigator.connection && navigator.connection.saveData);
  const temGsap = !!(window.gsap && window.ScrollTrigger);
  if (reduzir || !temGsap) html.classList.add("reduzido");

  /* ── WhatsApp: cada botão com a sua mensagem e Origem ─────────────────── */
  const num = String((S.whatsapp && S.whatsapp.numero) || "").replace(/\D/g, "");
  const linkWhats = (t) => `https://wa.me/${num}?text=${encodeURIComponent(t || "")}`;
  const msgs = (S.whatsapp && S.whatsapp.mensagens) || {};
  document.querySelectorAll("[data-wa]").forEach((a) => { if (msgs[a.dataset.wa]) a.href = linkWhats(msgs[a.dataset.wa]); });

  /* ── Vídeos de fundo do Vimeo: carregam perto da tela, saem quando longe ── */
  const enviar = (f, method, value) => {
    try { f.contentWindow.postMessage(JSON.stringify(value ? { method, value } : { method }), "https://player.vimeo.com"); } catch (_) {}
  };
  const montar = (box) => {
    if (box.querySelector("iframe")) return;
    const f = document.createElement("iframe");
    f.src = `https://player.vimeo.com/video/${box.dataset.vimeo}?${S.vimeoFundo}`;
    f.allow = "autoplay; fullscreen; picture-in-picture";
    f.setAttribute("aria-hidden", "true");
    f.tabIndex = -1;
    f.title = "";
    box.appendChild(f);
  };
  addEventListener("message", (e) => {
    if (e.origin !== "https://player.vimeo.com") return;
    let d; try { d = typeof e.data === "string" ? JSON.parse(e.data) : e.data; } catch (_) { return; }
    const f = [...document.querySelectorAll(".video-fundo iframe")].find((x) => x.contentWindow === e.source);
    if (!f || !d) return;
    if (d.event === "ready") { enviar(f, "addEventListener", "play"); enviar(f, "addEventListener", "timeupdate"); }
    if (d.event === "play" || d.event === "timeupdate") f.classList.add("pronto"); // só aparece quando toca; se falhar, fica o poster
  });
  const fundos = [...document.querySelectorAll(".video-fundo[data-vimeo]")];
  if (!reduzir && !economia && fundos.length) {
    const perto = new IntersectionObserver((es) => es.forEach((e) => {
      const f = e.target.querySelector("iframe");
      if (e.isIntersecting) { f ? enviar(f, "play") : montar(e.target); } else if (f) enviar(f, "pause");
    }), { rootMargin: "120% 0px" });
    const longe = new IntersectionObserver((es) => es.forEach((e) => {
      const f = e.target.querySelector("iframe");
      if (!e.isIntersecting && f) f.remove(); // libera memória no celular
    }), { rootMargin: "300% 0px" });
    fundos.forEach((b) => { perto.observe(b); longe.observe(b); });
  }

  /* ── Sala de projeção: abre com som, em tela cheia ────────────────────── */
  const sala = document.querySelector(".sala");
  let lenis = null;
  if (sala) {
    const tela = sala.querySelector(".sala-tela"), cred = sala.querySelector(".sala-cred");
    const fechar = () => { tela.innerHTML = ""; if (sala.open) sala.close(); };
    document.addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-abrir]");
      if (!b || typeof sala.showModal !== "function") return;
      ev.preventDefault();
      const f = document.createElement("iframe");
      f.src = `https://player.vimeo.com/video/${b.dataset.abrir}?${S.vimeoPlayer}`;
      f.allow = "autoplay; fullscreen; picture-in-picture";
      f.allowFullscreen = true;
      f.title = b.dataset.cred || "Vídeo";
      tela.innerHTML = ""; tela.appendChild(f);
      cred.textContent = b.dataset.cred || "";
      sala.classList.toggle("vertical", b.hasAttribute("data-vertical"));
      if (typeof sala.showModal === "function") { sala.showModal(); lenis && lenis.stop(); html.classList.add("sala-aberta"); }
      else window.open(`https://vimeo.com/${b.dataset.abrir}`, "_blank");
    });
    sala.querySelector(".sala-fechar").addEventListener("click", fechar);
    sala.addEventListener("close", () => { tela.innerHTML = ""; lenis && lenis.start(); html.classList.remove("sala-aberta"); });
    sala.addEventListener("click", (e) => { if (e.target === sala) fechar(); });
  }

  /* ── Formulário: monta a mensagem e abre o WhatsApp ───────────────────── */
  const form = document.querySelector(".form");
  if (form) {
    const tipo = form.elements.tipo, campoData = form.querySelector(".campo--data"), status = form.querySelector(".form-status");
    tipo.addEventListener("change", () => { campoData.hidden = !(tipo.selectedOptions[0] && tipo.selectedOptions[0].hasAttribute("data-evento")); });
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      let ok = true;
      form.querySelectorAll("[required]").forEach((c) => { const b = c.value.trim().length > 1; c.closest(".campo").classList.toggle("erro", !b); if (!b) ok = false; });
      if (!ok) { status.textContent = "Preencha o nome do negócio e o tipo de projeto."; status.className = "form-status falha"; return; }
      status.textContent = ""; status.className = "form-status";
      const partes = ["Oi! Vim pelo site da Graveno.", `Negócio: ${form.elements.negocio.value.trim()}.`, `Projeto: ${tipo.value}.`];
      if (!campoData.hidden && form.elements.data.value) { const [a, m, d] = form.elements.data.value.split("-"); partes.push(`Data do evento: ${d}/${m}/${a}.`); }
      partes.push(`Origem: ${(S.contato && S.contato.origem) || "formulario"}.`);
      const url = linkWhats(partes.join(" "));
      const aba = window.open(url, "_blank", "noopener");
      if (!aba) location.href = url;
    });
  }

  /* ── Botão flutuante some onde já existe o WhatsApp principal (contato e rodapé) ── */
  const flutuante = document.querySelector(".whats");
  const zonas = new Set();
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => (e.isIntersecting ? zonas.add(e.target) : zonas.delete(e.target)));
    flutuante && flutuante.classList.toggle("whats-some", zonas.size > 0);
  }, { threshold: 0 });
  document.querySelectorAll("#contato, .rodape").forEach((el) => io.observe(el));

  /* ── Sequências: rolagem que toca o filme quadro a quadro ─────────────── */
  const seqs = [...document.querySelectorAll(".seq[data-seq]")].map((sec) => {
    const nome = sec.dataset.seq;
    const cfg = (S.sequencias || {})[nome] || {};
    const modo = celular() ? "m" : "d";
    const total = cfg[modo] || 0;
    const canvas = sec.querySelector(".seq-canvas");
    const conter = sec.dataset.encaixe === "contain";
    const ctx = canvas.getContext("2d", { alpha: conter });
    const quadros = new Array(total);
    const src = (i) => `assets/seq/${nome}/${modo}/f_${String(i + 1).padStart(4, "0")}.webp`;
    const s = { sec, total, canvas, ctx, quadros, alvo: 0, atual: 0, desenhado: -1, carregando: false, momentos: [...sec.querySelectorAll(".momento")], ativo: null };

    const pronto = (i) => quadros[i] && quadros[i].complete && quadros[i].naturalWidth;
    const carregar = (i) => {
      if (quadros[i]) return;
      const img = new Image();
      img.decoding = "async";
      img.src = src(i);
      img.onload = () => { if (s.desenhado === -1 || Math.abs(Math.round(s.atual) - i) < 2) s.desenhar(true); };
      quadros[i] = img;
    };
    s.carregarTudo = () => {
      if (s.carregando || !total) return;
      s.carregando = true;
      carregar(0);
      const fila = [];
      for (const passo of [16, 8, 4, 2, 1]) for (let i = 0; i < total; i += passo) if (!fila.includes(i)) fila.push(i);
      let k = 0;
      const lote = () => { for (let n = 0; n < 6 && k < fila.length; n++) carregar(fila[k++]); if (k < fila.length) setTimeout(lote, 30); };
      lote();
    };
    s.ajustar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, celular() ? 2 : 1.5);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      s.desenhado = -1; s.desenhar(true);
    };
    s.desenhar = (forcar) => {
      if (!total) return;
      const i = Math.round(s.atual);
      let j = -1;
      for (let d = 0; d < total; d++) { if (pronto(i - d)) { j = i - d; break; } if (pronto(i + d)) { j = i + d; break; } }
      if (j < 0 || (j === s.desenhado && !forcar)) return;
      const img = quadros[j], cw = canvas.width, ch = canvas.height;
      const e = (conter ? Math.min : Math.max)(cw / img.naturalWidth, ch / img.naturalHeight);
      if (conter) ctx.clearRect(0, 0, cw, ch);
      const w = img.naturalWidth * e, h = img.naturalHeight * e;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      if (s.desenhado === -1) sec.classList.add("tocando");
      s.desenhado = j;
    };
    return s;
  });

  /* ── Daqui para baixo: só com movimento ───────────────────────────────── */
  if (reduzir || !temGsap) {
    html.classList.add("app-ok");
    // Sem animação: tudo visível, sequências viram a imagem de capa.
    document.querySelectorAll(".momento").forEach((m) => { m.style.opacity = 1; m.style.visibility = "visible"; });
    return;
  }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  // Rolagem suave
  if (window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const alvo = document.querySelector(a.getAttribute("href"));
      if (!alvo) return;
      e.preventDefault();
      lenis.scrollTo(alvo, { offset: a.getAttribute("href") === "#inicio" ? 0 : -10, duration: 1.6 });
    }));
  }

  /* Palavras: cada palavra sobe por trás de uma máscara */
  const quebrar = (el) => {
    const percorrer = (no) => {
      [...no.childNodes].forEach((c) => {
        if (c.nodeType === 3) {
          const partes = c.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          partes.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(" ")); return; }
            const w = document.createElement("span"); w.className = "p-w";
            const i = document.createElement("span"); i.className = "p-i"; i.textContent = p;
            w.appendChild(i); frag.appendChild(w);
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1 && !c.classList.contains("p-w")) percorrer(c);
      });
    };
    percorrer(el);
    return el.querySelectorAll(".p-i");
  };
  document.querySelectorAll(".palavras").forEach((el) => {
    const ws = quebrar(el);
    if (el.closest(".momento")) { gsap.set(ws, { yPercent: 115 }); return; } // anima quando o momento entra
    gsap.fromTo(ws, { yPercent: 115 }, {
      yPercent: 0, ease: "none", stagger: 0.08,
      scrollTrigger: { trigger: el, start: "top 92%", end: "top 48%", scrub: 0.6 },
    });
  });

  /* Cortes de cena: máscara que abre como um wipe de cinema */
  document.querySelectorAll(".corte").forEach((el) => {
    gsap.fromTo(el, { clipPath: "inset(14% 7% 0% 7%)" }, {
      clipPath: "inset(0% 0% 0% 0%)", ease: "none",
      scrollTrigger: { trigger: el, start: "top bottom", end: "top 25%", scrub: true },
    });
  });
  // Palco das sequências 2 e 3 entra recortado e abre até a tela cheia
  document.querySelectorAll(".seq:not(.seq--hero) .seq-palco").forEach((p) => {
    gsap.fromTo(p, { clipPath: "inset(18% 12% 18% 12%)" }, {
      clipPath: "inset(0% 0% 0% 0%)", ease: "none",
      scrollTrigger: { trigger: p.parentElement, start: "top bottom", end: "top top", scrub: true },
    });
  });

  /* Itens de lista que entram com wipe lateral */
  gsap.utils.toArray(".lista-demanda li, .servico, .garantias li, .faq details").forEach((el) => {
    gsap.from(el, {
      clipPath: "inset(0% 100% 0% 0%)", duration: 1.1, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none reverse" },
    });
  });

  /* Sequências: rolagem → quadro; momentos → texto */
  const mostrarMomento = (s, m) => {
    if (s.ativo === m) return;
    if (s.ativo) {
      const sai = s.ativo;
      gsap.to(sai, { autoAlpha: 0, y: -24, duration: 0.45, ease: "power2.in", overwrite: true });
      sai.classList.remove("ativo");
    }
    s.ativo = m;
    if (!m) return;
    m.classList.add("ativo");
    gsap.fromTo(m, { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", overwrite: true });
    const ws = m.querySelectorAll(".p-i");
    if (ws.length) gsap.fromTo(ws, { yPercent: 115 }, { yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.06, overwrite: true });
    const painel = m.querySelector(".painel");
    if (painel) gsap.fromTo(painel, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power4.inOut" });
  };
  seqs.forEach((s) => {
    s.ajustar();
    addEventListener("resize", s.ajustar);
    if (s.sec.classList.contains("seq--hero")) {
      const ir = () => (window.requestIdleCallback || setTimeout)(() => s.carregarTudo(), { timeout: 1200 });
      document.readyState === "complete" ? ir() : addEventListener("load", ir, { once: true });
    }
    else new IntersectionObserver(([e], o) => { if (e.isIntersecting) { s.carregarTudo(); o.disconnect(); } }, { rootMargin: "200% 0px" }).observe(s.sec);
    const escolher = (p) => s.momentos.find((m) => { const de = +m.dataset.de, ate = +m.dataset.ate; return p >= de && (p < ate || (ate >= 1 && p >= 1)); }) || null;
    ScrollTrigger.create({
      trigger: s.sec, start: "top top", end: "bottom bottom",
      onUpdate: (st) => { s.alvo = st.progress * Math.max(0, s.total - 1); s.sec.classList.toggle("andou", st.progress > 0.02); mostrarMomento(s, escolher(st.progress)); },
      onLeaveBack: () => { if (!s.sec.classList.contains("seq--hero")) mostrarMomento(s, null); },
    });
  });
  // Primeiro momento do hero já aparece ao abrir a página
  const hero = seqs.find((s) => s.sec.classList.contains("seq--hero"));
  if (hero) gsap.delayedCall(0.25, () => mostrarMomento(hero, hero.momentos[0]));
  // Laço único de desenho: suaviza e só redesenha quando o quadro muda (60fps)
  gsap.ticker.add(() => {
    for (const s of seqs) {
      if (!s.total) continue;
      const r = s.sec.getBoundingClientRect();
      if (r.bottom < -innerHeight || r.top > innerHeight * 2) continue;
      s.atual += (s.alvo - s.atual) * 0.2;
      if (Math.abs(s.alvo - s.atual) < 0.02) s.atual = s.alvo;
      s.desenhar(false);
    }
  });

  /* Vitrine: barras de cinema fecham, abrem em 2.39:1, abrem tudo e fecham de novo */
  const letterbox = ((1 - (16 / 9) / 2.39) / 2) * 100; // 12,8% de cada lado
  document.querySelectorAll(".obra").forEach((o) => {
    const barras = o.querySelectorAll(".barra");
    const tl = gsap.timeline({ scrollTrigger: { trigger: o, start: "top bottom", end: "bottom top", scrub: 0.4 } });
    tl.fromTo(barras, { height: "50%" }, { height: `${letterbox}%`, ease: "power2.out", duration: 0.28 })
      .to(barras, { height: "0%", ease: "power1.inOut", duration: 0.16 })
      .to(barras, { height: "0%", duration: 0.12 })
      .to(barras, { height: `${letterbox}%`, ease: "power1.inOut", duration: 0.16 })
      .to(barras, { height: "50%", ease: "power2.in", duration: 0.28 });
    const poster = o.querySelector(".poster");
    gsap.fromTo(poster, { scale: 1.12 }, { scale: 1, ease: "none", scrollTrigger: { trigger: o, start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* Como trabalhamos: rolagem horizontal no desktop */
  const mm = gsap.matchMedia();
  mm.add("(min-width: 761px)", () => {
    const trilho = document.querySelector(".processo-trilho");
    if (!trilho) return;
    const dist = () => trilho.scrollWidth - innerWidth;
    gsap.to(trilho, {
      x: () => -dist(), ease: "none",
      scrollTrigger: { trigger: ".processo", start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 },
    });
  });

  /* Criativos: os celulares sobem em ritmos diferentes */
  mm.add("(min-width: 901px)", () => {
    gsap.utils.toArray(".celular").forEach((c, i) => {
      gsap.fromTo(c, { y: 80 + i * 40 }, { y: i === 1 ? -48 : 0, ease: "none", scrollTrigger: { trigger: ".celulares", start: "top bottom", end: "bottom 40%", scrub: true } });
    });
  });

  /* Monitor: cena atual + timecode que avança com a rolagem */
  const tc = document.querySelector(".monitor-tc"), cena = document.querySelector(".monitor-cena");
  const pad = (n) => String(n).padStart(2, "0");
  const atualizarTC = () => {
    const f = Math.floor((lenis ? lenis.scroll : scrollY) / 6); // 24 quadros por segundo
    tc.textContent = `${pad(Math.floor(f / 86400))}:${pad(Math.floor(f / 1440) % 60)}:${pad(Math.floor(f / 24) % 60)}:${pad(f % 24)}`;
  };
  gsap.ticker.add(atualizarTC);
  document.querySelectorAll("[data-cena]").forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: "top 50%", end: "bottom 50%", onToggle: (st) => { if (st.isActive) cena.textContent = el.dataset.cena; } });
  });

  /* Topo: some ao descer, volta ao subir */
  const topo = document.querySelector(".topo");
  let ultimo = 0;
  gsap.ticker.add(() => {
    const y = lenis ? lenis.scroll : scrollY;
    topo.classList.toggle("rolou", y > 40);
    if (Math.abs(y - ultimo) > 6) { topo.classList.toggle("escondido", y > ultimo && y > innerHeight * 0.8); ultimo = y; }
  });

  /* Mira de câmera (só desktop com mouse) */
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const mira = document.querySelector(".mira");
    html.classList.add("com-mira");
    const xTo = gsap.quickTo(mira, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(mira, "y", { duration: 0.35, ease: "power3" });
    addEventListener("pointermove", (e) => { xTo(e.clientX); yTo(e.clientY); mira.classList.remove("escondida"); });
    document.addEventListener("pointerleave", () => mira.classList.add("escondida"));
    document.addEventListener("pointerover", (e) => {
      const v = e.target.closest("[data-abrir]");
      const l = !v && e.target.closest("a, button, summary, select, input, label");
      mira.classList.toggle("sobre-video", !!v);
      mira.classList.toggle("sobre-link", !!l);
    });
    const obs = new MutationObserver(() => mira.classList.toggle("escondida", html.classList.contains("sala-aberta")));
    obs.observe(html, { attributes: true, attributeFilter: ["class"] });
  }

  addEventListener("load", () => ScrollTrigger.refresh());
  html.classList.add("app-ok");
})();
