/**
 * Configuração da landing do Festival Desapegue-se.
 * URLs de contato e redes para CTAs e footer.
 */

export const FESTIVAL_WHATSAPP = "https://wa.me/5521999668342";
export const FESTIVAL_INSTAGRAM = "https://instagram.com/festivaldesapeguese";
export const FESTIVAL_INSTAGRAM_CASA = "https://instagram.com/casa.anitcha";
export const FESTIVAL_FACEBOOK = "https://facebook.com/festivaldesapeguese";

/** Comunidade Desapega no WhatsApp (Guia) */
export const COMUNIDADE_WHATSAPP_URL = "https://chat.whatsapp.com/CNxcti8e2FNHFuFyrd37Bu";

/** Sympla – ingresso (em breve) */
export const SYMPLA_URL = "sympla.com.br/evento/festival-desapegue-se-124-edicao/3286556?algoliaID=911c8b4edb80ca5ae4f88b16dcf90bd2&share_id=copiarlink";

/** Políticas de Cookies e Privacidade (Guia – Google Drive) */
export const POLITICAS_COOKIES_PRIVACIDADE_URL =
  "https://drive.google.com/file/d/1KuGn5gAqfZel-jCTV0N4mEZ-pWK4RLe7/view?usp=drive_link";

export const landingConfig = {
  whatsappUrl: FESTIVAL_WHATSAPP,
  whatsappNumber: "+55 21 99966-8342",
  instagramUrl: FESTIVAL_INSTAGRAM,
  instagramHandle: "@festivaldesapeguese",
  instagramCasaUrl: FESTIVAL_INSTAGRAM_CASA,
  instagramCasaHandle: "@casa.anitcha",
  facebookUrl: FESTIVAL_FACEBOOK,
  facebookHandle: "/festivaldesapeguese",
  comunidadeWhatsAppUrl: COMUNIDADE_WHATSAPP_URL,
  symplaUrl: SYMPLA_URL,
  politicasCookiesPrivacidadeUrl: POLITICAS_COOKIES_PRIVACIDADE_URL,
  /** @deprecated Use whatsappUrl. Mantido para compatibilidade durante migração. */
  abaixoAssinadoUrl: FESTIVAL_WHATSAPP,
} as const;
