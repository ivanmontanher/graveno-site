(() => {
  const html = document.documentElement;
  html.classList.add("cas-js");
  const NUM = "5519993163220";
  const linkWhats = (t) => `https://wa.me/${NUM}?text=${encodeURIComponent(t)}`;

  /* Revelar ao rolar */
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visto"); io.unobserve(e.target); } }), { threshold: 0.15 });
  document.querySelectorAll(".revelar").forEach((el) => io.observe(el));

  /* Topo: fundo ao rolar */
  const topo = document.querySelector(".topo");
  addEventListener("scroll", () => topo.classList.toggle("rolou", scrollY > 40), { passive: true });

  /* Botão flutuante some no formulário e no rodapé */
  const flutuante = document.querySelector(".whats");
  const zonas = new Set();
  const zio = new IntersectionObserver((es) => { es.forEach((e) => (e.isIntersecting ? zonas.add(e.target) : zonas.delete(e.target))); flutuante.classList.toggle("whats-some", zonas.size > 0); });
  document.querySelectorAll("#consultar-data, .rodape").forEach((el) => zio.observe(el));

  /* Filtros */
  const fotos = [...document.querySelectorAll(".foto")];
  document.querySelectorAll(".filtro").forEach((b) => b.addEventListener("click", () => {
    const f = b.dataset.filtro;
    document.querySelectorAll(".filtro").forEach((x) => { x.classList.toggle("ativo", x === b); x.setAttribute("aria-pressed", x === b); });
    fotos.forEach((el) => (el.hidden = f !== "Todos" && el.dataset.cat !== f));
  }));

  /* Lightbox com setas, teclado e arraste */
  const caixa = document.querySelector(".caixa");
  const img = caixa.querySelector("img"), leg = caixa.querySelector("figcaption");
  let atual = 0;
  const visiveis = () => fotos.filter((f) => !f.hidden);
  const mostrar = (i) => {
    const lista = visiveis();
    atual = (i + lista.length) % lista.length;
    const f = lista[atual], n = f.dataset.n, alt = f.querySelector("img").alt;
    img.src = `/assets/casamentos/d/${n}.webp`;
    img.alt = alt;
    leg.textContent = `${String(atual + 1).padStart(2, "0")} / ${String(lista.length).padStart(2, "0")} · ${f.dataset.cat}`;
  };
  fotos.forEach((f) => f.addEventListener("click", () => { mostrar(visiveis().indexOf(f)); caixa.showModal(); }));
  caixa.querySelector(".caixa-ant").addEventListener("click", () => mostrar(atual - 1));
  caixa.querySelector(".caixa-prox").addEventListener("click", () => mostrar(atual + 1));
  caixa.querySelector(".caixa-fechar").addEventListener("click", () => caixa.close());
  caixa.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") mostrar(atual - 1); if (e.key === "ArrowRight") mostrar(atual + 1); });
  let x0 = null;
  caixa.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
  caixa.addEventListener("touchend", (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) mostrar(atual + (dx < 0 ? 1 : -1)); x0 = null; });
  caixa.addEventListener("click", (e) => { if (e.target === caixa || e.target.tagName === "FIGURE") caixa.close(); });

  /* Formulário: monta a mensagem e abre o WhatsApp */
  const form = document.querySelector(".form-cas");
  const semData = form.elements.semdata, data = form.elements.data;
  semData.addEventListener("change", () => { data.disabled = semData.checked; if (semData.checked) data.value = ""; });
  const status = form.querySelector(".form-status");
  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    let ok = true;
    const marcar = (el, bom) => { el.closest(".campo").classList.toggle("erro", !bom); if (!bom) ok = false; };
    marcar(form.elements.nomes, form.elements.nomes.value.trim().length > 1);
    marcar(form.elements.whats, form.elements.whats.value.replace(/\D/g, "").length >= 10);
    marcar(form.elements.cidade, form.elements.cidade.value.trim().length > 1);
    marcar(data, semData.checked || !!data.value);
    if (!ok) { status.textContent = "Preencham os nomes, o WhatsApp, a cidade e a data (ou marquem que ainda não está definida)."; status.className = "form-status campo--inteiro falha"; return; }
    status.textContent = ""; status.className = "form-status campo--inteiro";
    const el = form.elements;
    let dataTxt = "ainda não definida";
    if (!semData.checked && data.value) { const [a, m, d] = data.value.split("-"); dataTxt = `${d}/${m}/${a}`; }
    const servicos = [...form.querySelectorAll('input[name="servicos"]:checked')].map((c) => c.value);
    const linhas = [
      "Oi! Vim pela página de casamentos da Graveno e quero consultar a nossa data.",
      `Nomes do casal: ${el.nomes.value.trim()}`,
      `WhatsApp: ${el.whats.value.trim()}`,
      `Data do casamento: ${dataTxt}`,
      `Cidade: ${el.cidade.value.trim()}`,
    ];
    if (el.local.value.trim()) linhas.push(`Local: ${el.local.value.trim()}`);
    if (el.convidados.value) linhas.push(`Convidados: ${el.convidados.value}`);
    if (servicos.length) linhas.push(`Serviços de interesse: ${servicos.join(", ")}`);
    if (el.como.value) linhas.push(`Como conheceram a Graveno: ${el.como.value}`);
    linhas.push("Origem: casamentos.");
    const url = linkWhats(linhas.join("\n"));
    const aba = window.open(url, "_blank", "noopener");
    if (!aba) location.href = url;
  });
})();
