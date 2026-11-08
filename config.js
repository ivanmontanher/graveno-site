window.SITE = {
  nome: "Graveno",

  whatsapp: {
    numero: "5519993163220", // só dígitos
    // Uma mensagem por botão. O "Origem" no final diz de onde veio o lead.
    mensagens: {
      header: "Oi! Vim pelo site da Graveno e quero um orçamento. Origem: header.",
      hero: "Oi! Vim pelo site da Graveno e quero um orçamento. Origem: hero.",
      evento: "Oi! Quero consultar disponibilidade de data para um evento. Origem: evento.",
      demanda: "Oi! Vim pelo site da Graveno e quero vender mais com vídeo e anúncio. Origem: demanda.",
      processo: "Oi! Vim pelo site da Graveno e quero um orçamento. Origem: processo.",
      servico_drone: "Oi! Vim pelo site da Graveno. Quero um institucional com drone para o meu espaço. Origem: servico_drone.",
      servico_filme: "Oi! Vim pelo site da Graveno. Quero contar a história da minha marca. Origem: servico_filme.",
      servico_eventos: "Oi! Vim pelo site da Graveno. Tenho um evento e quero orçamento de cobertura. Origem: servico_eventos.",
      servico_videomaker: "Oi! Vim pelo site da Graveno. Quero aparecer toda semana no feed. Origem: servico_videomaker.",
      servico_storymaker: "Oi! Vim pelo site da Graveno. Preciso de stories frequentes. Origem: servico_storymaker.",
      servico_anuncio: "Oi! Vim pelo site da Graveno. Quero vídeo e anúncio que tragam cliente. Origem: servico_anuncio.",
      contato: "Oi! Vim pelo site da Graveno e quero um orçamento. Origem: contato.",
      flutuante: "Oi! Vim pelo site da Graveno e quero um orçamento. Origem: flutuante.",
    },
  },

  // Sem e-mail: o formulário monta a mensagem e abre o WhatsApp.
  contato: { canal: "whatsapp", origem: "formulario" },

  vimeoFundo: "background=1&autoplay=1&loop=1&muted=1&autopause=0&controls=0&title=0&byline=0&portrait=0&dnt=1",
  vimeoPlayer: "autoplay=1&title=0&byline=0&portrait=0&dnt=1",

  // Sequências geradas no OpenRouter e fatiadas em quadros (rolagem frame a frame)
  sequencias: {
    hero:  { d: 150, m: 110 },
    drone: { d: 120, m: 90 },
    show:  { d: 120, m: 90 },
  },

  // Vitrine de cinema: ordem e legendas (todos 16:9)
  vitrine: [
    { id: "1244889261", cred: "Rancho Phoenix · Evento" },
    { id: "1244888783", cred: "Rancho Phoenix · Institucional" },
    { id: "1225310692", cred: "Arena Pontel Beach · Cobertura de evento" },
    { id: "1244889952", cred: "Arena Pontel Beach · Evento" },
    { id: "1244890576", cred: "Cabana UaiMeo · Hotelaria" },
    { id: "1244890778", cred: "Cabana UaiMeo · Hotelaria" },
    { id: "1223792083", cred: "Arena Pontel Beach · Institucional" },
    { id: "1227850982", cred: "Pontel para Empresas · Institucional" },
    { id: "1228917306", cred: "Fábrica de Monstros · Institucional" },
    { id: "1224928990", cred: "HS · Institucional" },
  ],
};
