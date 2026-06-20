export const LAYERS = [
  {
    id: "marketing",
    number: 1,
    name: "Marketing",
    question: "Como un desconocido puede saber que existes?",
  },
  {
    id: "ventas",
    number: 2,
    name: "Ventas",
    question: "Como conviertes a ese desconocido en alguien interesado?",
  },
  {
    id: "cierre",
    number: 3,
    name: "Cierre",
    question: "Como conviertes a ese interesado en alguien que paga?",
  },
  {
    id: "onboarding",
    number: 4,
    name: "Onboarding",
    question: "Como recibes a ese cliente nuevo?",
  },
  {
    id: "entrega",
    number: 5,
    name: "Entrega",
    question: "Como le entregas el producto o servicio que compro?",
  },
  {
    id: "posventa",
    number: 6,
    name: "Posventa",
    question: "Como lo retienes y aumentas su LTV?",
  },
] as const;

export type BusinessLayer = (typeof LAYERS)[number]["id"];
export type NoteLayer = BusinessLayer | "none";

export const NOTE_LAYERS = [
  "marketing",
  "ventas",
  "cierre",
  "onboarding",
  "entrega",
  "posventa",
  "none",
] as const satisfies readonly NoteLayer[];

export function isBusinessLayer(layer: NoteLayer): layer is BusinessLayer {
  return layer !== "none";
}
