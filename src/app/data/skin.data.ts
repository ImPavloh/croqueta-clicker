import { SkinModel } from "app/models/skin.model";

export const SKINS: SkinModel[] = [
  // ============================================================
  // 🟤 COMUNES
  // ============================================================
  {
    id: 1,
    name: 'Normal',
    description: 'Una croqueta pocha del Wercadona',
    image: '/assets/skins/croqueta-normal.webp',
    rarity: 'common',
  },
  {
    id: 2,
    name: 'Jamón',
    description: 'Una croqueta deliciosa de jamón ibérico',
    image: '/assets/skins/croqueta-jamon.webp',
    rarity: 'common'
  },
  {
    id: 3,
    name: 'Pollo',
    description: 'Una croqueta de pollo jugosa y sabrosa',
    image: '/assets/skins/croqueta-pollo.webp',
    rarity: 'common'
  },
  {
    id: 4,
    name: 'Queso',
    description: 'Una croqueta de queso cremosa y deliciosa',
    image: '/assets/skins/croqueta-queso.webp',
    rarity: 'common'
  },
  {
    id: 5,
    name: 'Bacalao',
    description: 'Una croqueta de bacalao tradicional y sabrosa',
    image: '/assets/skins/croqueta-bacalao.webp',
    rarity: 'common'
  },
  {
    id: 6,
    name: 'Setas',
    description: 'Una croqueta de setas exquisita y aromática',
    image: '/assets/skins/croqueta-setas.webp',
    rarity: 'common'
  },

  // ============================================================
  // 🟡 RARAS
  // ============================================================
  {
    id: 7,
    name: 'Dorada',
    description: 'Una croqueta de lujo, probablemente tóxica.',
    image: '/assets/skins/croqueta-dorada.webp',
    rarity: 'rare'
  },
  {
    id: 8,
    name: 'Quemada',
    description: 'Demasiado tiempo en la freidora... crujiente nivel carbón.',
    image: '/assets/skins/croqueta-quemada.webp',
    rarity: 'rare'
  },

  // ============================================================
  // 🔵 ÉPICAS
  // ============================================================
  {
    id: 9,
    name: 'Cósmica',
    description: 'Brilla con el poder del universo. No apta para humanos.',
    image: '/assets/skins/croqueta-cosmica.webp',
    rarity: 'epic'
  },
  {
    id: 10,
    name: 'Rey',
    description: 'Su majestad la croqueta, soberana de todas las frituras.',
    image: '/assets/skins/croqueta-rey.webp',
    rarity: 'epic'
  },
  {
    id: 11,
    name: 'Papa',
    description: 'La croqueta elegida: sabia, firme y un poco pasada de sal.',
    image: '/assets/skins/croqueta-papa.webp',
    rarity: 'epic'
  },

  // ============================================================
  // 🟣 LEGENDARIAS
  // ============================================================
  {
    id: 12,
    name: 'Dios',
    description: 'Más allá de la bechamel y el pan rallado...',
    image: '/assets/skins/croqueta-dios.webp',
    rarity: 'legendary'
  },
  {
    id: 13,
    name: 'Phillipe',
    description: 'phillipe.',
    image: '/assets/skins/croqueta-phillipe.webp',
    rarity: 'legendary'
  },
  {
    id: 14,
    name: 'Cookie',
    description: 'Una croqueta en crisis de identidad.',
    image: '/assets/skins/croqueta-cookie.webp',
    rarity: 'legendary'
  },
  {
    id: 15,
    name: '¿Plátano?',
    description: 'Una croqueta tropical que te deja con dudas existenciales.',
    image: '/assets/skins/croqueta-platano.webp',
    rarity: 'legendary'
  },

  // ============================================================
  // 🔴 MÍTICA
  // ============================================================
  {
    id: 16,
    name: 'Real',
    description: 'La croqueta definitiva.',
    image: '/assets/skins/croqueta-real.webp',
    rarity: 'mythic'
  },
];
