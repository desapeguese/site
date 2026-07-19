export type LandingOption = {
  label: string;
  value: string;
};

export const LANDING_ICON_OPTIONS: LandingOption[] = [
  { label: "Acessibilidade", value: "Accessibility" },
  { label: "Prêmio", value: "Award" },
  { label: "Calendário", value: "Calendar" },
  { label: "Caminhada", value: "Footprints" },
  { label: "Coração", value: "Heart" },
  { label: "Folha", value: "Leaf" },
  { label: "Localização", value: "MapPin" },
  { label: "Pacote", value: "Package" },
  { label: "Paleta", value: "Palette" },
  { label: "Pet", value: "PawPrint" },
  { label: "Reciclagem", value: "Recycle" },
  { label: "Brilho", value: "Sparkles" },
  { label: "Broto", value: "Sprout" },
  { label: "Pessoas", value: "Users" },
  { label: "Utensílios", value: "Utensils" },
  { label: "Alimentação", value: "UtensilsCrossed" },
  { label: "Oficina", value: "Wrench" },
  { label: "Comunidade", value: "MessageCircle" },
  { label: "Instagram", value: "Instagram" },
  { label: "Facebook", value: "Facebook" },
  { label: "Youtube", value: "Youtube" },
];

export const CARD_BACKGROUND_OPTIONS: LandingOption[] = [
  { label: "Claro", value: "bg-primary-10" },
  { label: "Verde", value: "bg-espacos-verde-escuro" },
  { label: "Roxo", value: "bg-espacos-roxo" },
  { label: "Rosa", value: "bg-espacos-magenta" },
];

export const CARD_ACCENT_OPTIONS: LandingOption[] = [
  { label: "Verde", value: "bg-espacos-verde-escuro" },
  { label: "Roxo", value: "bg-espacos-roxo" },
  { label: "Rosa", value: "bg-espacos-magenta" },
  { label: "Laranja", value: "bg-secondary" },
  { label: "Primário", value: "bg-primary" },
];

export const STAT_BACKGROUND_OPTIONS: LandingOption[] = [
  { label: "Verde", value: "bg-gradient-linear-card" },
  { label: "Laranja", value: "bg-gradient-linear-orange" },
  { label: "Roxo", value: "bg-espacos-roxo" },
  { label: "Rosa", value: "bg-espacos-magenta" },
];

export const THEMATIC_SPACE_COLOR_OPTIONS: LandingOption[] = [
  { label: "Roxo", value: "bg-espacos-roxo" },
  { label: "Rosa", value: "bg-espacos-magenta" },
  { label: "Verde", value: "bg-espacos-verde-escuro" },
];

export function getMetadataString(
  metadata: Record<string, unknown> | null | undefined,
  key: string,
  fallback: string
): string {
  const value = metadata?.[key];
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

export function getMetadataBoolean(
  metadata: Record<string, unknown> | null | undefined,
  key: string,
  fallback: boolean
): boolean {
  const value = metadata?.[key];
  return typeof value === "boolean" ? value : fallback;
}

export function mergeMetadata(
  metadata: Record<string, unknown> | null | undefined,
  patch: Record<string, unknown>
): Record<string, unknown> {
  return {
    ...(metadata ?? {}),
    ...patch,
  };
}
