export type DefaultLandingAsset = {
  key: string;
  type: 'logo' | 'image' | 'background';
  theme?: 'light' | 'dark';
  fileName: string;
  sourcePath: string;
  mimeType: string;
  altText: string;
  sortOrder: number;
};

export type DefaultLandingItem = {
  key: string;
  type:
    | 'pillar_card'
    | 'stat'
    | 'commitment_card'
    | 'timeline_event'
    | 'program_event'
    | 'thematic_space'
    | 'ods_logo'
    | 'footer_link'
    | 'social_link'
    | 'cta_link';
  title?: string;
  subtitle?: string;
  description?: string;
  value?: string;
  icon?: string;
  color?: string;
  url?: string;
  metadata?: Record<string, unknown>;
  sortOrder: number;
};

export type DefaultLandingSection = {
  key: string;
  type: string;
  title?: string;
  subtitle?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  sortOrder: number;
  items: DefaultLandingItem[];
  assets: DefaultLandingAsset[];
};

export type DefaultLandingContent = {
  page: {
    slug: string;
    locale: string;
    seoTitle: string;
    seoDescription: string;
  };
  sections: DefaultLandingSection[];
};

export const DEFAULT_LANDING_CONTENT: DefaultLandingContent = {
  page: {
    slug: 'default',
    locale: 'pt-BR',
    seoTitle:
      'Festival Desapegue-se | Sustentabilidade, Economia Circular e Arte',
    seoDescription:
      'Festival itinerante de sustentabilidade, economia circular, arte e conexão. 19 a 22 de Março 2026 no Grajaú, Rio de Janeiro. Feira de trocas, oficinas, shows e muito mais!',
  },
  sections: [
    {
      key: 'hero',
      type: 'hero_carousel',
      title: 'Festival Desapegue-se',
      description:
        'Um festival itinerante de sustentabilidade, economia circular, arte e conexão. Mais que um evento, é um movimento de construção coletiva para cidades sustentáveis através da educação.',
      metadata: { helperText: 'Autoplay Ativo • Clique para expandir' },
      sortOrder: 10,
      items: [],
      assets: [
        {
          key: 'main_logo_dark',
          type: 'logo',
          theme: 'dark',
          fileName: 'Logo DESAPEGUE-SE branco horz 2025.png',
          sourcePath: 'public/img/Logo DESAPEGUE-SE branco horz 2025.png',
          mimeType: 'image/png',
          altText: 'Logo Festival Desapegue-se branco',
          sortOrder: 0,
        },
        {
          key: 'main_logo_light',
          type: 'logo',
          theme: 'light',
          fileName: 'Logo DESAPEGUE-SE verde horz 2025.png',
          sourcePath: 'public/img/Logo DESAPEGUE-SE verde horz 2025.png',
          mimeType: 'image/png',
          altText: 'Logo Festival Desapegue-se verde',
          sortOrder: 0,
        },
        {
          key: 'carousel_danca_circular',
          type: 'image',
          fileName: 'dançacircular.jpg',
          sourcePath: 'public/img/carousel/dançacircular.jpg',
          mimeType: 'image/jpeg',
          altText: 'Dança circular no Festival Desapegue-se',
          sortOrder: 1,
        },
        {
          key: 'carousel_expositores',
          type: 'image',
          fileName: 'expositores.jpg',
          sourcePath: 'public/img/carousel/expositores.jpg',
          mimeType: 'image/jpeg',
          altText: 'Expositores do Festival Desapegue-se',
          sortOrder: 2,
        },
        {
          key: 'carousel_festival20',
          type: 'image',
          fileName: 'festival20.jpg',
          sourcePath: 'public/img/carousel/festival20.jpg',
          mimeType: 'image/jpeg',
          altText: 'Registro do Festival Desapegue-se 20',
          sortOrder: 3,
        },
        {
          key: 'carousel_festival21',
          type: 'image',
          fileName: 'festival21.jpg',
          sourcePath: 'public/img/carousel/festival21.jpg',
          mimeType: 'image/jpeg',
          altText: 'Registro do Festival Desapegue-se 21',
          sortOrder: 4,
        },
        {
          key: 'carousel_festival22',
          type: 'image',
          fileName: 'festival22.jpg',
          sourcePath: 'public/img/carousel/festival22.jpg',
          mimeType: 'image/jpeg',
          altText: 'Registro do Festival Desapegue-se 22',
          sortOrder: 5,
        },
        {
          key: 'carousel_festival30',
          type: 'image',
          fileName: 'festival30.jpg',
          sourcePath: 'public/img/carousel/festival30.jpg',
          mimeType: 'image/jpeg',
          altText: 'Registro do Festival Desapegue-se 30',
          sortOrder: 6,
        },
        {
          key: 'carousel_festival31',
          type: 'image',
          fileName: 'festival31.jpg',
          sourcePath: 'public/img/carousel/festival31.jpg',
          mimeType: 'image/jpeg',
          altText: 'Registro do Festival Desapegue-se 31',
          sortOrder: 7,
        },
        {
          key: 'carousel_festival32',
          type: 'image',
          fileName: 'festival32.jpg',
          sourcePath: 'public/img/carousel/festival32.jpg',
          mimeType: 'image/jpeg',
          altText: 'Registro do Festival Desapegue-se 32',
          sortOrder: 8,
        },
        {
          key: 'carousel_festival33',
          type: 'image',
          fileName: 'festival33.jpg',
          sourcePath: 'public/img/carousel/festival33.jpg',
          mimeType: 'image/jpeg',
          altText: 'Registro do Festival Desapegue-se 33',
          sortOrder: 9,
        },
        {
          key: 'carousel_festival34',
          type: 'image',
          fileName: 'festival34.jpg',
          sourcePath: 'public/img/carousel/festival34.jpg',
          mimeType: 'image/jpeg',
          altText: 'Registro do Festival Desapegue-se 34',
          sortOrder: 10,
        },
        {
          key: 'carousel_festival35',
          type: 'image',
          fileName: 'festival35.jpg',
          sourcePath: 'public/img/carousel/festival35.jpg',
          mimeType: 'image/jpeg',
          altText: 'Registro do Festival Desapegue-se 35',
          sortOrder: 11,
        },
        {
          key: 'carousel_cultura',
          type: 'image',
          fileName: 'cultura.jpg',
          sourcePath: 'public/img/carousel/cultura.jpg',
          mimeType: 'image/jpeg',
          altText: 'Atividade cultural no Festival Desapegue-se',
          sortOrder: 12,
        },
        {
          key: 'carousel_festival36',
          type: 'image',
          fileName: 'festival36.jpg',
          sourcePath: 'public/img/carousel/festival36.jpg',
          mimeType: 'image/jpeg',
          altText: 'Registro do Festival Desapegue-se 36',
          sortOrder: 13,
        },
        {
          key: 'carousel_festival37',
          type: 'image',
          fileName: 'festival37.jpg',
          sourcePath: 'public/img/festival37.jpg',
          mimeType: 'image/jpeg',
          altText: 'Registro do Festival Desapegue-se 37',
          sortOrder: 14,
        },
      ],
    },
    {
      key: 'regenerar',
      type: 'cards_and_stats',
      title: 'Desapegar para Regenerar',
      description:
        'Desapegar de crenças, hábitos e atitudes e sonhar um futuro é essencial para a construção de um mundo mais justo, responsável e resiliente.',
      metadata: { statsBackgroundColor: 'bg-gradient-linear-card' },
      sortOrder: 20,
      items: [
        {
          key: 'sustentabilidade',
          type: 'pillar_card',
          title: 'Sustentabilidade',
          description:
            'Promovemos práticas sustentáveis e regenerativas para o território',
          icon: 'Leaf',
          color: 'bg-espacos-verde-escuro',
          sortOrder: 1,
        },
        {
          key: 'economia_circular',
          type: 'pillar_card',
          title: 'Economia Circular',
          description:
            'Incentivamos o reuso, a troca e a ressignificação de objetos',
          icon: 'Recycle',
          color: 'bg-secondary',
          sortOrder: 2,
        },
        {
          key: 'conexao_comunitaria',
          type: 'pillar_card',
          title: 'Conexão Comunitária',
          description: 'Fortalecemos laços entre pessoas e territórios.',
          icon: 'Users',
          color: 'bg-espacos-roxo',
          metadata: { backgroundColor: 'bg-primary-10' },
          sortOrder: 3,
        },
        {
          key: 'arte_cultura',
          type: 'pillar_card',
          title: 'Arte & Cultura',
          description:
            'Arte e cultura como forma de sensibilização para criação de um mundo mais justo.',
          icon: 'Heart',
          color: 'bg-espacos-magenta',
          sortOrder: 4,
        },
        {
          key: 'edicoes',
          type: 'stat',
          title: 'edições',
          value: '+120',
          sortOrder: 10,
        },
        {
          key: 'pessoas_impactadas',
          type: 'stat',
          title: 'pessoas impactadas',
          value: '+360k',
          sortOrder: 11,
        },
        {
          key: 'oficinas_realizadas',
          type: 'stat',
          title: 'oficinas realizadas',
          value: '+400',
          sortOrder: 12,
        },
        {
          key: 'parceiros',
          type: 'stat',
          title: 'parceiros',
          value: '+1000',
          sortOrder: 13,
        },
        {
          key: 'anos_de_historias',
          type: 'stat',
          title: 'anos de histórias',
          value: '+18',
          sortOrder: 14,
        },
      ],
      assets: [],
    },
    {
      key: 'compromissos',
      type: 'commitment_grid',
      title: 'Nossos Compromissos',
      description:
        'Certificações e práticas que garantem um evento verdadeiramente sustentável',
      sortOrder: 30,
      items: [
        {
          key: 'lixo_zero',
          type: 'commitment_card',
          title: 'Lixo Zero',
          icon: 'Recycle',
          color: '#1B3226',
          sortOrder: 1,
        },
        {
          key: 'iso_20121_2024',
          type: 'commitment_card',
          title: 'ISO 20121:2024',
          icon: 'Award',
          color: '#fa9c38',
          sortOrder: 2,
        },
        {
          key: 'plastico_zero',
          type: 'commitment_card',
          title: 'Plástico Zero',
          icon: 'Package',
          color: '#27684A',
          sortOrder: 3,
        },
        {
          key: 'carbono_neutro',
          type: 'commitment_card',
          title: 'Carbono Neutro',
          icon: 'Leaf',
          color: '#f4b36d',
          sortOrder: 4,
        },
        {
          key: 'diversidade_inclusao',
          type: 'commitment_card',
          title: 'Diversidade e Inclusão',
          icon: 'Users',
          color: '#92C56E',
          sortOrder: 5,
        },
        {
          key: 'praca_alimentacao_sem_carne',
          type: 'commitment_card',
          title: 'Praça de Alimentação sem Carne',
          icon: 'UtensilsCrossed',
          color: '#f4b36d',
          sortOrder: 6,
        },
        {
          key: 'pet_friendly',
          type: 'commitment_card',
          title: 'Pet Friendly',
          icon: 'PawPrint',
          color: '#34681A',
          sortOrder: 7,
        },
        {
          key: 'evento_acessivel',
          type: 'commitment_card',
          title: 'Evento Acessível',
          icon: 'Accessibility',
          color: '#E46095',
          sortOrder: 8,
        },
      ],
      assets: [],
    },
    {
      key: 'missao',
      type: 'mission',
      title: 'Nossa Missão',
      description:
        'Implementar os Objetivos Globais para o Desenvolvimento Sustentável (ODSs) e a Agenda 2030, promovendo a regeneração dos territórios através do foco em Cidades e Comunidades Sustentáveis, Consumo e Produção Responsáveis, Ação contra a Mudança Global do Clima e Parcerias e Meios de Implementação.',
      sortOrder: 40,
      items: [
        {
          key: 'ods_11',
          type: 'ods_logo',
          title: 'ODS 11 - Cidades Sustentáveis',
          sortOrder: 1,
        },
        {
          key: 'ods_12',
          type: 'ods_logo',
          title: 'ODS 12 - Consumo Responsável',
          sortOrder: 2,
        },
        {
          key: 'ods_13',
          type: 'ods_logo',
          title: 'ODS 13 - Ação Climática',
          sortOrder: 3,
        },
        {
          key: 'ods_17',
          type: 'ods_logo',
          title: 'ODS 17 - Parcerias',
          sortOrder: 4,
        },
      ],
      assets: [
        {
          key: 'ods_11_logo',
          type: 'image',
          fileName: 'ods11.jpg',
          sourcePath: 'public/img/carousel/ods11.jpg',
          mimeType: 'image/jpeg',
          altText: 'Logo ODS 11 - Cidades Sustentáveis',
          sortOrder: 1,
        },
        {
          key: 'ods_12_logo',
          type: 'image',
          fileName: 'ods12.webp',
          sourcePath: 'public/img/carousel/ods12.webp',
          mimeType: 'image/webp',
          altText: 'Logo ODS 12 - Consumo Responsável',
          sortOrder: 2,
        },
        {
          key: 'ods_13_logo',
          type: 'image',
          fileName: 'ods13.webp',
          sourcePath: 'public/img/carousel/ods13.webp',
          mimeType: 'image/webp',
          altText: 'Logo ODS 13 - Ação Climática',
          sortOrder: 3,
        },
        {
          key: 'ods_17_logo',
          type: 'image',
          fileName: 'ods17.jpg',
          sourcePath: 'public/img/carousel/ods17.jpg',
          mimeType: 'image/jpeg',
          altText: 'Logo ODS 17 - Parcerias',
          sortOrder: 4,
        },
        {
          key: 'mission_background_festival7',
          type: 'background',
          fileName: 'festival7.jpg',
          sourcePath: 'public/img/carousel/festival7.jpg',
          mimeType: 'image/jpeg',
          altText: 'Imagem de fundo da seção Nossa Missão 7',
          sortOrder: 10,
        },
        {
          key: 'mission_background_festival8',
          type: 'background',
          fileName: 'festival8.jpg',
          sourcePath: 'public/img/carousel/festival8.jpg',
          mimeType: 'image/jpeg',
          altText: 'Imagem de fundo da seção Nossa Missão 8',
          sortOrder: 11,
        },
        {
          key: 'mission_background_festival9',
          type: 'background',
          fileName: 'festival9.jpg',
          sourcePath: 'public/img/carousel/festival9.jpg',
          mimeType: 'image/jpeg',
          altText: 'Imagem de fundo da seção Nossa Missão 9',
          sortOrder: 12,
        },
        {
          key: 'mission_background_festival10',
          type: 'background',
          fileName: 'festival10.jpg',
          sourcePath: 'public/img/carousel/festival10.jpg',
          mimeType: 'image/jpeg',
          altText: 'Imagem de fundo da seção Nossa Missão 10',
          sortOrder: 13,
        },
        {
          key: 'mission_background_festival11',
          type: 'background',
          fileName: 'festival11.jpg',
          sourcePath: 'public/img/carousel/festival11.jpg',
          mimeType: 'image/jpeg',
          altText: 'Imagem de fundo da seção Nossa Missão 11',
          sortOrder: 14,
        },
      ],
    },
    {
      key: 'trajetoria',
      type: 'timeline',
      title: 'Nossa Trajetória',
      sortOrder: 50,
      items: [
        {
          key: 'timeline_2008',
          type: 'timeline_event',
          value: '2008',
          description:
            '1ª edição como parte do projeto Bairro Vivo da Casa Anitcha',
          sortOrder: 1,
        },
        {
          key: 'timeline_2010',
          type: 'timeline_event',
          value: '2010',
          description:
            'Integra a rede internacional Transition Towns - Cidades em Transição',
          sortOrder: 2,
        },
        {
          key: 'timeline_2015',
          type: 'timeline_event',
          value: '2015',
          description: 'Criação da Horta Urbana Comunitária do Grajaú',
          sortOrder: 3,
        },
        {
          key: 'timeline_2015_6',
          type: 'timeline_event',
          value: '2015/6',
          description: 'Chancela da Prefeitura do Rio como Ação Local',
          sortOrder: 4,
        },
        {
          key: 'timeline_2018',
          type: 'timeline_event',
          value: '2018',
          description:
            'Reconhecido pela lei nº 6.396 como de interesse cultural, social e ecológico para o Município do RJ',
          sortOrder: 5,
        },
        {
          key: 'timeline_2019',
          type: 'timeline_event',
          value: '2019',
          description:
            'Reestruturação com apoio do projeto USIS - Unidade de Suporte à Inovação Social, da UFRJ',
          sortOrder: 6,
        },
        {
          key: 'timeline_2020',
          type: 'timeline_event',
          value: '2020',
          description: 'Lançamento da moeda NIT',
          sortOrder: 7,
        },
        {
          key: 'timeline_2026',
          type: 'timeline_event',
          value: '2026',
          description:
            'Relançamento: + Inovação + Parcerias + Sustentabilidade + Impacto',
          sortOrder: 8,
        },
      ],
      assets: [],
    },
    {
      key: 'reconhecimento',
      type: 'legal_recognition',
      title: 'Reconhecimento Legal',
      subtitle: 'Lei Municipal nº 6.396/2018',
      description:
        'O Festival Desapegue-se é reconhecido pela lei municipal 6.396 de 2018 como de interesse cultural, social e ecológico para o Município do Rio de Janeiro.',
      sortOrder: 60,
      items: [],
      assets: [
        {
          key: 'legal_background_festival1',
          type: 'background',
          fileName: 'festival1.jpg',
          sourcePath: 'public/img/carousel/festival1.jpg',
          mimeType: 'image/jpeg',
          altText: 'Imagem de fundo da seção Reconhecimento Legal 1',
          sortOrder: 1,
        },
        {
          key: 'legal_background_festival2',
          type: 'background',
          fileName: 'festival2.jpg',
          sourcePath: 'public/img/carousel/festival2.jpg',
          mimeType: 'image/jpeg',
          altText: 'Imagem de fundo da seção Reconhecimento Legal 2',
          sortOrder: 2,
        },
        {
          key: 'legal_background_festival4',
          type: 'background',
          fileName: 'festival4.jpg',
          sourcePath: 'public/img/carousel/festival4.jpg',
          mimeType: 'image/jpeg',
          altText: 'Imagem de fundo da seção Reconhecimento Legal 4',
          sortOrder: 3,
        },
        {
          key: 'legal_background_festival5',
          type: 'background',
          fileName: 'festival5.jpg',
          sourcePath: 'public/img/carousel/festival5.jpg',
          mimeType: 'image/jpeg',
          altText: 'Imagem de fundo da seção Reconhecimento Legal 5',
          sortOrder: 4,
        },
        {
          key: 'legal_background_festival6',
          type: 'background',
          fileName: 'festival6.jpg',
          sourcePath: 'public/img/carousel/festival6.jpg',
          mimeType: 'image/jpeg',
          altText: 'Imagem de fundo da seção Reconhecimento Legal 6',
          sortOrder: 5,
        },
      ],
    },
    {
      key: 'programacao',
      type: 'schedule_and_spaces',
      title: 'Edição Março 2026',
      description:
        'Nesta edição, o Festival Desapegue-se escolhe falar sobre justiça climática porque as mudanças no clima já estão acontecendo, e seus impactos não são iguais para todos. Justiça climática é reconhecer essas desigualdades e buscar soluções que sejam justas, coletivas e possíveis, garantindo apoio a quem mais precisa para enfrentar os novos desafios.',
      sortOrder: 70,
      items: [
        {
          key: 'programa_19_03',
          type: 'program_event',
          title: 'Quinta-feira',
          subtitle: 'Escola Municipal Duque de Caxias',
          description:
            'Ação educativa com oficinas de economia circular e educação climática',
          value: '19/03',
          icon: 'Calendar',
          metadata: { destaque: false },
          sortOrder: 1,
        },
        {
          key: 'programa_20_03',
          type: 'program_event',
          title: 'Sexta-feira',
          subtitle: 'Escola Municipal Professor Lourenço Filho',
          description: 'Jornada de sensibilização sobre socialização climática',
          value: '20/03',
          icon: 'Calendar',
          metadata: { destaque: false },
          sortOrder: 2,
        },
        {
          key: 'programa_21_03',
          type: 'program_event',
          title: 'Sábado',
          subtitle: 'Praça Edmundo Rego',
          description:
            'Mutirão da Horta Comunitária / Caminhada Histórica e Ecológica',
          value: '21/03',
          icon: 'Calendar',
          metadata: { destaque: false },
          sortOrder: 3,
        },
        {
          key: 'programa_22_03',
          type: 'program_event',
          title: 'Domingo',
          subtitle: 'Praça Edmundo Rego',
          description:
            'Feira de Trocas / Feira de Usados e Brechós / Expositores / Shows e Apresentações Artísticas / Oficinas e Compartilhamento de Saberes / Danças Circulares / Praça de Alimentação sem carne / Estação de Reparos / Espaço Holístico / Cinema / Artivismo e muito mais!',
          value: '22/03',
          icon: 'Calendar',
          metadata: { destaque: false },
          sortOrder: 4,
        },
        {
          key: 'feira_de_trocas',
          type: 'thematic_space',
          title: 'Feira de Trocas',
          description:
            'Participe da troca de produtos e serviço em um espaço com curadoria e moeda social onde a economia circular é colocada em prática',
          icon: 'Palette',
          color: 'bg-espacos-roxo-escuro',
          sortOrder: 10,
        },
        {
          key: 'feira_de_brecho_e_economia_criativa',
          type: 'thematic_space',
          title: 'Feira de Brechó e Economia Criativa',
          description:
            'Encontre diversos produtos sustentáveis como roupas, artesanatos, objetos de decoração, entre outros',
          icon: 'Users',
          color: 'bg-espacos-magenta',
          sortOrder: 11,
        },
        {
          key: 'escola_viva',
          type: 'thematic_space',
          title: 'Escola Viva',
          description:
            'Participe de momentos de construção coletiva de saberes e troca livre de conhecimento',
          icon: 'Wrench',
          color: 'bg-espacos-verde-escuro',
          sortOrder: 12,
        },
        {
          key: 'espaco_multicultural',
          type: 'thematic_space',
          title: 'Espaço Multicultural',
          description:
            'Assista e participe de apresentações artísticas em diversas linguagens como música, danças circulares, batalha de rima, baile charme, entre outras',
          icon: 'Heart',
          color: 'bg-espacos-roxo',
          sortOrder: 13,
        },
        {
          key: 'estacao_de_reparos',
          type: 'thematic_space',
          title: 'Estação de Reparos',
          description:
            'Encontre profissionais para realizar pequenos reparos em bicicletas, roupas, sapatos e eletrônicos',
          icon: 'Utensils',
          color: 'bg-espacos-magenta',
          sortOrder: 14,
        },
        {
          key: 'praca_de_alimentacao',
          type: 'thematic_space',
          title: 'Praça de Alimentação',
          description:
            'Deguste de opções gastronômicas incríveis em nossa praça de alimentação sem carne',
          icon: 'MapPin',
          color: 'bg-espacos-verde-escuro',
          sortOrder: 15,
        },
        {
          key: 'mutirao_da_horta_comunitaria',
          type: 'thematic_space',
          title: 'Mutirão da Horta Comunitária',
          description:
            'Participe desse movimento coletivo de plantio, reconexão e educação ambiental do território',
          icon: 'Sprout',
          color: 'bg-espacos-roxo',
          sortOrder: 16,
        },
        {
          key: 'caminhada_historica_e_ecologica',
          type: 'thematic_space',
          title: 'Caminhada Histórica e Ecológica',
          description:
            'Explore a história e ecologia do bairro em caminhadas guiadas',
          icon: 'Footprints',
          color: 'bg-espacos-magenta',
          sortOrder: 17,
        },
        {
          key: 'terapias_integrativas',
          type: 'thematic_space',
          title: 'Terapias Integrativas',
          description:
            'Reiki, yoga, meditação, óleos e outras práticas de bem-estar',
          icon: 'Sparkles',
          color: 'bg-espacos-verde-escuro',
          sortOrder: 18,
        },
        {
          key: 'sympla-ingresso',
          type: 'cta_link',
          title: 'Retire seu ingresso',
          url: 'https://www.sympla.com.br/evento/festival-desapegue-se-124-edicao/3286556?algoliaID=911c8b4edb80ca5ae4f88b16dcf90bd2&share_id=copiarlink',
          metadata: { ctaEnabled: true },
          sortOrder: 30,
        },
      ],
      assets: [],
    },
    {
      key: 'footer',
      type: 'footer',
      title: 'Inscreva-se na Transformação',
      description:
        'Receba insights exclusivos e atualize seu conhecimento sobre acessibilidade e sustentabilidade. Envie seu email para ficar por dentro de tudo.',
      sortOrder: 80,
      items: [
        {
          key: 'community_whatsapp',
          type: 'cta_link',
          title: 'Entrar na comunidade',
          icon: 'MessageCircle',
          color: '#25D366',
          url: 'https://chat.whatsapp.com/CNxct8e2FNHFuFyrd37Bu',
          sortOrder: 1,
        },
        {
          key: 'privacy_policy',
          type: 'footer_link',
          title: 'Política de Cookies e Privacidade',
          url: 'https://drive.google.com/file/d/1KuGn5gAqfZel-jCTV0N4mEZ-pWK4RLe7/view?usp=drive_link',
          sortOrder: 2,
        },
        {
          key: 'sustainability_policy',
          type: 'footer_link',
          title: 'Política de Sustentabilidade',
          url: 'https://drive.google.com/file/d/1jvQW1k0ackW8d42DGa1vB_uZTqKbH_S5/view?usp=drive_link',
          sortOrder: 3,
        },
        {
          key: 'instagram',
          type: 'social_link',
          title: 'Instagram',
          icon: 'Instagram',
          url: 'https://www.instagram.com/festivaldesapeguese',
          sortOrder: 4,
        },
        {
          key: 'facebook',
          type: 'social_link',
          title: 'Facebook',
          icon: 'Facebook',
          url: 'https://www.facebook.com/festivaldesapeguese',
          sortOrder: 5,
        },
        {
          key: 'youtube',
          type: 'social_link',
          title: 'Youtube',
          icon: 'Youtube',
          url: 'https://www.youtube.com/@FestivalDesapeguese',
          sortOrder: 6,
        },
      ],
      assets: [],
    },
  ],
};
