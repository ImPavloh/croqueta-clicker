import { SkinModel } from 'app/models/skin.model';

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
    unlockRequirement: { type: 'none' },
  },
  {
    id: 2,
    name: 'Jamón',
    description: 'Una croqueta deliciosa de jamón ibérico',
    image: '/assets/skins/croqueta-jamon.webp',
    rarity: 'common',
    unlockRequirement: { type: 'croquetas', value: 100 },
  },
  {
    id: 3,
    name: 'Pollo',
    description: 'Una croqueta de pollo jugosa y sabrosa',
    image: '/assets/skins/croqueta-pollo.webp',
    rarity: 'common',
    unlockRequirement: { type: 'level', value: 3 },
  },
  {
    id: 4,
    name: 'Queso',
    description: 'Una croqueta de queso cremosa y deliciosa',
    image: '/assets/skins/croqueta-queso.webp',
    rarity: 'common',
    unlockRequirement: { type: 'croquetas', value: 500 },
  },
  {
    id: 5,
    name: 'Bacalao',
    description: 'Una croqueta de bacalao tradicional y sabrosa',
    image: '/assets/skins/croqueta-bacalao.webp',
    rarity: 'common',
    unlockRequirement: { type: 'level', value: 5 },
  },
  {
    id: 6,
    name: 'Setas',
    description: 'Una croqueta de setas exquisita y aromática',
    image: '/assets/skins/croqueta-setas.webp',
    rarity: 'common',
    unlockRequirement: { type: 'level', value: 10 },
  },

  // ============================================================
  // 🟡 RARAS
  // ============================================================
  {
    id: 7,
    name: 'Dorada',
    description: 'Una croqueta de lujo, probablemente tóxica.',
    image: '/assets/skins/croqueta-dorada.webp',
    rarity: 'rare',
    particleImage: '/assets/skins/croqueta-dorada.webp',
    unlockRequirement: { type: 'level', value: 15 },
  },
  {
    id: 8,
    name: 'Quemada',
    description: 'Demasiado tiempo en la freidora... crujiente nivel carbón.',
    image: '/assets/skins/croqueta-quemada.webp',
    rarity: 'rare',
    particleImage: '/assets/skins/croqueta-quemada.webp',
    unlockRequirement: { type: 'croquetas', value: 10000 },
  },

  // ============================================================
  // 🔵 ÉPICAS
  // ============================================================
  {
    id: 9,
    name: 'Cósmica',
    description: 'Brilla con el poder del universo. No apta para humanos.',
    image: '/assets/skins/croqueta-cosmica.webp',
    rarity: 'epic',
    particleImage: '/assets/skins/croqueta-cosmica.webp',
    unlockRequirement: { type: 'level', value: 20 },
  },
  {
    id: 10,
    name: 'Rey',
    description: 'Su majestad la croqueta, soberana de todas las frituras.',
    image: '/assets/skins/croqueta-rey.webp',
    rarity: 'epic',
    particleImage: '/assets/skins/croqueta-rey.webp',
    unlockRequirement: { type: 'croquetas', value: 50000 },
  },
  {
    id: 11,
    name: 'Papa',
    description: 'La croqueta elegida: sabia, firme y un poco pasada de sal.',
    image: '/assets/skins/croqueta-papa.webp',
    rarity: 'epic',
    particleImage: '/assets/skins/croqueta-papa.webp',
    unlockRequirement: { type: 'level', value: 30 },
  },

  // ============================================================
  // 🟣 LEGENDARIAS
  // ============================================================
  {
    id: 12,
    name: 'Dios',
    description: 'Más allá de la bechamel y el pan rallado...',
    image: '/assets/skins/croqueta-dios.webp',
    rarity: 'legendary',
    particleImage: '/assets/skins/croqueta-dios.webp',
    unlockRequirement: { type: 'level', value: 50 },
  },
  {
    id: 13,
    name: 'Phillipe',
    description: 'phillipe.',
    image: '/assets/skins/croqueta-phillipe.webp',
    rarity: 'legendary',
    particleImage: '/assets/skins/croqueta-phillipe.webp',
    counterLabel: '¿croquetas?',
    unlockRequirement: { type: 'achievement', id: 'six_seven' },
  },
  {
    id: 14,
    name: 'Cookie',
    description: 'Una croqueta en crisis de identidad.',
    image: '/assets/skins/croqueta-cookie.webp',
    rarity: 'legendary',
    particleImage: '/assets/skins/croqueta-cookie.webp',
    counterLabel: '¿galletas?',
    unlockRequirement: { type: 'level', value: 60 },
  },
  {
    id: 15,
    name: '¿Plátano?',
    description: 'Una croqueta tropical que te deja con dudas existenciales.',
    image: '/assets/skins/croqueta-platano.webp',
    rarity: 'legendary',
    particleImage: '/assets/skins/croqueta-platano.webp',
    counterLabel: '¿plátanos?',
    unlockRequirement: { type: 'exp', value: 100000 },
  },

  // ============================================================
  // 🔴 MÍTICA
  // ============================================================
  {
    id: 16,
    name: 'Real',
    description: 'La croqueta definitiva.',
    image: '/assets/skins/croqueta-real.webp',
    rarity: 'mythic',
    particleImage: '/assets/skins/croqueta-real.webp',
    unlockRequirement: { type: 'level', value: 100 },
  },
];
