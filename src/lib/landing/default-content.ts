import type { LandingAsset, LandingItem, LandingPageContent, LandingSection } from "@/lib/landing/types";

function asset(
  key: string,
  type: string,
  src: string,
  sortOrder: number,
  altText: string,
  theme: string | null = null
): LandingAsset {
  const fileName = src.split("/").pop() ?? key;
  const extension = fileName.split(".").pop()?.toLowerCase();
  const mimeType =
    extension === "webp"
      ? "image/webp"
      : extension === "svg"
        ? "image/svg+xml"
        : extension === "png"
          ? "image/png"
          : "image/jpeg";

  return {
    id: `fallback-asset-${key}`,
    key,
    type,
    theme,
    fileName,
    mimeType,
    src,
    altText,
    sortOrder,
  };
}

function item(input: Omit<LandingItem, "id" | "assets">): LandingItem {
  return {
    id: `fallback-item-${input.key}`,
    assets: [],
    ...input,
  };
}

function section(input: Omit<LandingSection, "id">): LandingSection {
  return {
    id: `fallback-section-${input.key}`,
    ...input,
  };
}

export const DEFAULT_LANDING_PAGE_CONTENT: LandingPageContent = {
  id: "fallback-page-default",
  slug: "default",
  locale: "pt-BR",
  seoTitle: "Festival Desapegue-se | Sustentabilidade, Economia Circular e Arte",
  seoDescription:
    "Festival itinerante de sustentabilidade, economia circular, arte e conexão. 19 a 22 de Março 2026 no Grajaú, Rio de Janeiro.",
  assets: [],
  sections: [
    section({
      key: "hero",
      type: "hero_carousel",
      title: "Festival Desapegue-se",
      subtitle: null,
      description:
        "Um festival itinerante de sustentabilidade, economia circular, arte e conexão. Mais que um evento, é um movimento de construção coletiva para cidades sustentáveis através da educação.",
      metadata: { helperText: "Autoplay Ativo • Clique para expandir" },
      sortOrder: 10,
      items: [],
      assets: [
        asset(
          "main_logo_dark",
          "logo",
          "/img/Logo DESAPEGUE-SE branco horz 2025.png",
          0,
          "Logo Festival Desapegue-se branco",
          "dark"
        ),
        asset(
          "main_logo_light",
          "logo",
          "/img/Logo DESAPEGUE-SE verde horz 2025.png",
          0,
          "Logo Festival Desapegue-se verde",
          "light"
        ),
        asset(
          "carousel_danca_circular",
          "image",
          "/img/carousel/dançacircular.jpg",
          1,
          "Dança circular no Festival Desapegue-se"
        ),
        asset(
          "carousel_expositores",
          "image",
          "/img/carousel/expositores.jpg",
          2,
          "Expositores do Festival Desapegue-se"
        ),
        ...[
          "festival20",
          "festival21",
          "festival22",
          "festival30",
          "festival31",
          "festival32",
          "festival33",
          "festival34",
          "festival35",
        ].map((name, index) =>
          asset(
            `carousel_${name}`,
            "image",
            `/img/carousel/${name}.jpg`,
            index + 3,
            `Registro do Festival Desapegue-se ${name.replace("festival", "")}`
          )
        ),
        asset(
          "carousel_cultura",
          "image",
          "/img/carousel/cultura.jpg",
          12,
          "Atividade cultural no Festival Desapegue-se"
        ),
        asset(
          "carousel_festival36",
          "image",
          "/img/carousel/festival36.jpg",
          13,
          "Registro do Festival Desapegue-se 36"
        ),
        asset("carousel_festival37", "image", "/img/festival37.jpg", 14, "Registro do Festival Desapegue-se 37"),
      ],
    }),
    section({
      key: "regenerar",
      type: "cards_and_stats",
      title: "Desapegar para Regenerar",
      subtitle: null,
      description:
        "Desapegar de crenças, hábitos e atitudes e sonhar um futuro é essencial para a construção de um mundo mais justo, responsável e resiliente.",
      metadata: null,
      sortOrder: 20,
      assets: [],
      items: [
        item({
          key: "sustentabilidade",
          type: "pillar_card",
          title: "Sustentabilidade",
          subtitle: null,
          description: "Promovemos práticas sustentáveis e regenerativas para o território",
          value: null,
          icon: "Leaf",
          color: "bg-espacos-verde-escuro",
          url: null,
          metadata: null,
          sortOrder: 1,
        }),
        item({
          key: "economia_circular",
          type: "pillar_card",
          title: "Economia Circular",
          subtitle: null,
          description: "Incentivamos o reuso, a troca e a ressignificação de objetos",
          value: null,
          icon: "Recycle",
          color: "bg-espacos-roxo",
          url: null,
          metadata: null,
          sortOrder: 2,
        }),
        item({
          key: "conexao_comunitaria",
          type: "pillar_card",
          title: "Conexão Comunitária",
          subtitle: null,
          description: "Fortalecemos laços entre pessoas e territórios.",
          value: null,
          icon: "Users",
          color: "bg-secondary",
          url: null,
          metadata: null,
          sortOrder: 3,
        }),
        item({
          key: "arte_cultura",
          type: "pillar_card",
          title: "Arte & Cultura",
          subtitle: null,
          description: "Arte e cultura como forma de sensibilização para criação de um mundo mais justo.",
          value: null,
          icon: "Heart",
          color: "bg-espacos-magenta",
          url: null,
          metadata: null,
          sortOrder: 4,
        }),
        ...[
          ["edicoes", "+120", "edições"],
          ["pessoas_impactadas", "+360k", "pessoas impactadas"],
          ["oficinas_realizadas", "+400", "oficinas realizadas"],
          ["parceiros", "+1000", "parceiros"],
          ["anos_de_historias", "+18", "anos de histórias"],
        ].map(([key, value, title], index) =>
          item({
            key,
            type: "stat",
            title,
            subtitle: null,
            description: null,
            value,
            icon: null,
            color: null,
            url: null,
            metadata: null,
            sortOrder: index + 10,
          })
        ),
      ],
    }),
    section({
      key: "compromissos",
      type: "commitment_grid",
      title: "Nossos Compromissos",
      subtitle: null,
      description: "Certificações e práticas que garantem um evento verdadeiramente sustentável",
      metadata: null,
      sortOrder: 30,
      assets: [],
      items: [
        ["lixo_zero", "Lixo Zero", "Recycle", "#1B3226"],
        ["iso_20121_2024", "ISO 20121:2024", "Award", "#fa9c38"],
        ["plastico_zero", "Plástico Zero", "Package", "#27684A"],
        ["carbono_neutro", "Carbono Neutro", "Leaf", "#e08e37"],
        ["diversidade_inclusao", "Diversidade e Inclusão", "Users", "#92C56E"],
        ["praca_alimentacao_sem_carne", "Praça de Alimentação sem Carne", "UtensilsCrossed", "#f4b36d"],
        ["pet_friendly", "Pet Friendly", "PawPrint", "#34681A"],
        ["evento_acessivel", "Evento Acessível", "Accessibility", "#E46095"],
      ].map(([key, title, icon, color], index) =>
        item({
          key,
          type: "commitment_card",
          title,
          subtitle: null,
          description: null,
          value: null,
          icon,
          color,
          url: null,
          metadata: null,
          sortOrder: index + 1,
        })
      ),
    }),
    section({
      key: "missao",
      type: "mission",
      title: "Nossa Missão",
      subtitle: null,
      description:
        "Implementar os Objetivos Globais para o Desenvolvimento Sustentável (ODSs) e a Agenda 2030, promovendo a regeneração dos territórios através do foco em Cidades e Comunidades Sustentáveis, Consumo e Produção Responsáveis, Ação contra a Mudança Global do Clima e Parcerias e Meios de Implementação.",
      metadata: null,
      sortOrder: 40,
      items: [
        ["ods_11", "ODS 11 - Cidades Sustentáveis"],
        ["ods_12", "ODS 12 - Consumo Responsável"],
        ["ods_13", "ODS 13 - Ação Climática"],
        ["ods_17", "ODS 17 - Parcerias"],
      ].map(([key, title], index) =>
        item({
          key,
          type: "ods_logo",
          title,
          subtitle: null,
          description: null,
          value: null,
          icon: null,
          color: null,
          url: null,
          metadata: null,
          sortOrder: index + 1,
        })
      ),
      assets: [
        asset("ods_11_logo", "image", "/img/carousel/ods11.jpg", 1, "Logo ODS 11"),
        asset("ods_12_logo", "image", "/img/carousel/ods12.webp", 2, "Logo ODS 12"),
        asset("ods_13_logo", "image", "/img/carousel/ods13.webp", 3, "Logo ODS 13"),
        asset("ods_17_logo", "image", "/img/carousel/ods17.jpg", 4, "Logo ODS 17"),
        ...["festival7", "festival8", "festival9", "festival10", "festival11"].map((name, index) =>
          asset(
            `mission_background_${name}`,
            "background",
            `/img/carousel/${name}.jpg`,
            index + 10,
            `Imagem de fundo da seção Nossa Missão ${index + 1}`
          )
        ),
      ],
    }),
    section({
      key: "trajetoria",
      type: "timeline",
      title: "Nossa Trajetória",
      subtitle: null,
      description: null,
      metadata: null,
      sortOrder: 50,
      assets: [],
      items: [
        ["timeline_2008", "2008", "1ª edição como parte do projeto Bairro Vivo da Casa Anitcha"],
        ["timeline_2010", "2010", "Integra a rede internacional Transition Towns - Cidades em Transição"],
        ["timeline_2015", "2015", "Criação da Horta Urbana Comunitária do Grajaú"],
        ["timeline_2015_6", "2015/6", "Chancela da Prefeitura do Rio como Ação Local"],
        [
          "timeline_2018",
          "2018",
          "Reconhecido pela lei nº 6.396 como de interesse cultural, social e ecológico para o Município do RJ",
        ],
        [
          "timeline_2019",
          "2019",
          "Reestruturação com apoio do projeto USIS - Unidade de Suporte à Inovação Social, da UFRJ",
        ],
        ["timeline_2020", "2020", "Lançamento da moeda NIT"],
        ["timeline_2026", "2026", "Relançamento: + Inovação + Parcerias + Sustentabilidade + Impacto"],
      ].map(([key, value, description], index) =>
        item({
          key,
          type: "timeline_event",
          title: null,
          subtitle: null,
          description,
          value,
          icon: null,
          color: null,
          url: null,
          metadata: null,
          sortOrder: index + 1,
        })
      ),
    }),
    section({
      key: "reconhecimento",
      type: "legal_recognition",
      title: "Reconhecimento Legal",
      subtitle: "Lei Municipal nº 6.396/2018",
      description:
        "O Festival Desapegue-se é reconhecido pela lei municipal 6.396 de 2018 como de interesse cultural, social e ecológico para o Município do Rio de Janeiro.",
      metadata: null,
      sortOrder: 60,
      items: [],
      assets: ["festival1", "festival2", "festival4", "festival5", "festival6"].map((name, index) =>
        asset(
          `legal_background_${name}`,
          "background",
          `/img/carousel/${name}.jpg`,
          index + 1,
          `Imagem de fundo da seção Reconhecimento Legal ${index + 1}`
        )
      ),
    }),
    section({
      key: "programacao",
      type: "schedule_and_spaces",
      title: "Edição Março 2026",
      subtitle: null,
      description:
        "Nesta edição, o Festival Desapegue-se escolhe falar sobre justiça climática porque as mudanças no clima já estão acontecendo, e seus impactos não são iguais para todos. Justiça climática é reconhecer essas desigualdades e buscar soluções que sejam justas, coletivas e possíveis, garantindo apoio a quem mais precisa para enfrentar os novos desafios.",
      metadata: null,
      sortOrder: 70,
      assets: [],
      items: [
        ...[
          [
            "programa_19_03",
            "19/03",
            "Quinta-feira",
            "Escola Municipal Duque de Caxias",
            "Ação educativa com oficinas de economia circular e educação climática",
          ],
          [
            "programa_20_03",
            "20/03",
            "Sexta-feira",
            "Escola Municipal Professor Lourenço Filho",
            "Jornada de sensibilização sobre socialização climática",
          ],
          [
            "programa_21_03",
            "21/03",
            "Sábado",
            "Praça Edmundo Rego",
            "Mutirão da Horta Comunitária / Caminhada Histórica e Ecológica",
          ],
          [
            "programa_22_03",
            "22/03",
            "Domingo",
            "Praça Edmundo Rego",
            "Feira de Trocas / Feira de Usados e Brechós / Expositores / Shows e Apresentações Artísticas / Oficinas e Compartilhamento de Saberes / Danças Circulares / Praça de Alimentação sem carne / Estação de Reparos / Espaço Holístico / Cinema / Artivismo e muito mais!",
          ],
        ].map(([key, value, title, subtitle, description], index) =>
          item({
            key,
            type: "program_event",
            title,
            subtitle,
            description,
            value,
            icon: "Calendar",
            color: null,
            url: null,
            metadata: { destaque: false },
            sortOrder: index + 1,
          })
        ),
        ...[
          [
            "feira_de_trocas",
            "Feira de Trocas",
            "Palette",
            "Participe da troca de produtos e serviço em um espaço com curadoria e moeda social onde a economia circular é colocada em prática",
            "bg-espacos-roxo-escuro",
          ],
          [
            "feira_de_brecho_e_economia_criativa",
            "Feira de Brechó e Economia Criativa",
            "Users",
            "Encontre diversos produtos sustentáveis como roupas, artesanatos, objetos de decoração, entre outros",
            "bg-espacos-magenta",
          ],
          [
            "escola_viva",
            "Escola Viva",
            "Wrench",
            "Participe de momentos de construção coletiva de saberes e troca livre de conhecimento",
            "bg-espacos-verde-escuro",
          ],
          [
            "espaco_multicultural",
            "Espaço Multicultural",
            "Heart",
            "Assista e participe de apresentações artísticas em diversas linguagens como música, danças circulares, batalha de rima, baile charme, entre outras",
            "bg-espacos-roxo",
          ],
          [
            "estacao_de_reparos",
            "Estação de Reparos",
            "Utensils",
            "Encontre profissionais para realizar pequenos reparos em bicicletas, roupas, sapatos e eletrônicos",
            "bg-espacos-magenta",
          ],
          [
            "praca_de_alimentacao",
            "Praça de Alimentação",
            "MapPin",
            "Deguste de opções gastronômicas incríveis em nossa praça de alimentação sem carne",
            "bg-espacos-verde-escuro",
          ],
          [
            "mutirao_da_horta_comunitaria",
            "Mutirão da Horta Comunitária",
            "Sprout",
            "Participe desse movimento coletivo de plantio, reconexão e educação ambiental do território",
            "bg-espacos-roxo",
          ],
          [
            "caminhada_historica_e_ecologica",
            "Caminhada Histórica e Ecológica",
            "Footprints",
            "Explore a história e ecologia do bairro em caminhadas guiadas",
            "bg-espacos-magenta",
          ],
          [
            "terapias_integrativas",
            "Terapias Integrativas",
            "Sparkles",
            "Reiki, yoga, meditação, óleos e outras práticas de bem-estar",
            "bg-espacos-verde-escuro",
          ],
        ].map(([key, title, icon, description, color], index) =>
          item({
            key,
            type: "thematic_space",
            title,
            subtitle: null,
            description,
            value: null,
            icon,
            color,
            url: null,
            metadata: null,
            sortOrder: index + 10,
          })
        ),
        item({
          key: "sympla-ingresso",
          type: "cta_link",
          title: "Retire seu ingresso",
          subtitle: null,
          description: null,
          value: null,
          icon: null,
          color: null,
          url: "https://www.sympla.com.br/evento/festival-desapegue-se-124-edicao/3286556?algoliaID=911c8b4edb80ca5ae4f88b16dcf90bd2&share_id=copiarlink",
          metadata: null,
          sortOrder: 30,
        }),
      ],
    }),
    section({
      key: "footer",
      type: "footer",
      title: "Inscreva-se na Transformação",
      subtitle: null,
      description:
        "Receba insights exclusivos e atualize seu conhecimento sobre acessibilidade e sustentabilidade. Envie seu email para ficar por dentro de tudo.",
      metadata: {
        brandTitle: "Festival Desapegue-se",
        brandDescription:
          "Um movimento que conecta pessoas, ideias e práticas sustentáveis para transformar a forma como consumimos e nos relacionamos com o mundo.",
        copyrightText: "© 2025 Festival Desapegue-se. Todos os direitos reservados.",
        creditLabel: "Biomob - Instituto Brasileiro de Mobilidade e Acessibilidade",
        creditUrl: "https://biomob.org/pt",
      },
      sortOrder: 80,
      assets: [],
      items: [
        item({
          key: "community_whatsapp",
          type: "cta_link",
          title: "Entrar na comunidade",
          subtitle: null,
          description: null,
          value: null,
          icon: "MessageCircle",
          color: "#25D366",
          url: "https://chat.whatsapp.com/CNxct8e2FNHFuFyrd37Bu",
          metadata: null,
          sortOrder: 1,
        }),
        item({
          key: "privacy_policy",
          type: "footer_link",
          title: "Política de Cookies e Privacidade",
          subtitle: null,
          description: null,
          value: null,
          icon: null,
          color: null,
          url: "https://drive.google.com/file/d/1KuGn5gAqfZel-jCTV0N4mEZ-pWK4RLe7/view?usp=drive_link",
          metadata: null,
          sortOrder: 2,
        }),
        item({
          key: "sustainability_policy",
          type: "footer_link",
          title: "Política de Sustentabilidade",
          subtitle: null,
          description: null,
          value: null,
          icon: null,
          color: null,
          url: "https://drive.google.com/file/d/1jvQW1k0ackW8d42DGa1vB_uZTqKbH_S5/view?usp=drive_link",
          metadata: null,
          sortOrder: 3,
        }),
        ...[
          ["instagram", "Instagram", "Instagram", "https://www.instagram.com/festivaldesapeguese"],
          ["facebook", "Facebook", "Facebook", "https://www.facebook.com/festivaldesapeguese"],
          ["youtube", "Youtube", "Youtube", "https://www.youtube.com/@FestivalDesapeguese"],
        ].map(([key, title, icon, url], index) =>
          item({
            key,
            type: "social_link",
            title,
            subtitle: null,
            description: null,
            value: null,
            icon,
            color: null,
            url,
            metadata: null,
            sortOrder: index + 10,
          })
        ),
      ],
    }),
  ],
};

export function getFallbackSection(key: string): LandingSection | undefined {
  return DEFAULT_LANDING_PAGE_CONTENT.sections.find((section) => section.key === key);
}
