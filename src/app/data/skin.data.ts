import { SkinModel } from 'app/models/skin.model';

// fondos implementados pero no usados (no hay imagenes de fondo de momento/no me convence ~ Pavloh)

export const SKINS: SkinModel[] = [
  // ============================================================
  // 🟤 COMUNES
  // ============================================================
  {
    id: 1,
    name: 'skins.skin.1.name',
    description: 'skins.skin.1.description',
    image: '/assets/skins/croqueta-normal.webp',
    rarity: 'skins.rarity.common',
    unlocked: true,
    unlockRequirement: { type: 'none' },
  },
  {
    id: 2,
    name: 'skins.skin.2.name',
    description: 'skins.skin.2.description',
    image: '/assets/skins/croqueta-jamon.webp',
    rarity: 'skins.rarity.common',
    unlockRequirement: { type: 'croquetas', value: 500 },
  },
  {
    id: 3,
    name: 'skins.skin.3.name',
    description: 'skins.skin.3.description',
    image: '/assets/skins/croqueta-pollo.webp',
    rarity: 'skins.rarity.common',
    unlockRequirement: { type: 'level', value: 3 },
  },
  {
    id: 4,
    name: 'skins.skin.4.name',
    description: 'skins.skin.4.description',
    image: '/assets/skins/croqueta-queso.webp',
    rarity: 'skins.rarity.common',
    unlockRequirement: { type: 'croquetas', value: 2000 },
  },
  {
    id: 5,
    name: 'skins.skin.5.name',
    description: 'skins.skin.5.description',
    image: '/assets/skins/croqueta-bacalao.webp',
    rarity: 'skins.rarity.common',
    unlockRequirement: { type: 'level', value: 5 },
  },
  {
    id: 6,
    name: 'skins.skin.6.name',
    description: 'skins.skin.6.description',
    image: '/assets/skins/croqueta-setas.webp',
    rarity: 'skins.rarity.common',
    unlockRequirement: { type: 'level', value: 10 },
  },

  // ============================================================
  // 🟡 RARAS
  // ============================================================
  {
    id: 7,
    name: 'skins.skin.7.name',
    description: 'skins.skin.7.description',
    image: '/assets/skins/croqueta-coqueta.webp',
    rarity: 'skins.rarity.rare',
    particleImage: '/assets/skins/croqueta-coqueta.webp',
    unlockRequirement: { type: 'level', value: 13 },
  },
  {
    id: 22, // esto es una mierda
    name: 'skins.skin.22.name',
    description: 'skins.skin.22.description',
    image: '/assets/skins/croqueta-3d.webp',
    rarity: 'skins.rarity.rare',
    particleImage: '/assets/skins/croqueta-3d.webp',
    unlockRequirement: { type: 'level', value: 14 },
  },
  {
    id: 8,
    name: 'skins.skin.8.name',
    description: 'skins.skin.8.description',
    image: '/assets/skins/croqueta-dorada.webp',
    rarity: 'skins.rarity.rare',
    particleImage: '/assets/skins/croqueta-dorada.webp',
    unlockRequirement: { type: 'level', value: 15 },
  },
  {
    id: 9,
    name: 'skins.skin.9.name',
    description: 'skins.skin.9.description',
    image: '/assets/skins/croqueta-quemada.webp',
    rarity: 'skins.rarity.rare',
    particleImage: '/assets/skins/croqueta-quemada.webp',
    unlockRequirement: { type: 'croquetas', value: 10000 },
    background: '/assets/backgrounds/bg-quemado.webp',
  },

  // ============================================================
  // 🔵 ÉPICAS
  // ============================================================
  {
    id: 10,
    name: 'skins.skin.10.name',
    description: 'skins.skin.10.description',
    image: '/assets/skins/croqueta-cosmica.webp',
    rarity: 'skins.rarity.epic',
    particleImage: '/assets/skins/croqueta-cosmica.webp',
    unlockRequirement: { type: 'croquetas', value: 150000 },
    background: '/assets/backgrounds/bg-galaxy.webp',
  },
  {
    id: 11,
    name: 'skins.skin.11.name',
    description: 'skins.skin.11.description',
    image: '/assets/skins/croqueta-rey.webp',
    rarity: 'skins.rarity.epic',
    particleImage: '/assets/skins/croqueta-rey.webp',
    unlockRequirement: { type: 'level', value: 20 },
  },
  {
    id: 12,
    name: 'skins.skin.12.name',
    description: 'skins.skin.12.description',
    image: '/assets/skins/croqueta-papa.webp',
    rarity: 'skins.rarity.epic',
    particleImage: '/assets/skins/croqueta-papa.webp',
    unlockRequirement: { type: 'level', value: 30 },
  },
  {
    id: 13,
    name: 'skins.skin.13.name',
    description: 'skins.skin.13.description',
    image: '/assets/skins/croqueta-empresaria.webp',
    rarity: 'skins.rarity.epic',
    particleImage: '/assets/skins/croqueta-empresaria.webp',
    unlockRequirement: { type: 'croquetas', value: 750000 },
  },
  {
    id: 14,
    name: 'skins.skin.14.name',
    description: 'skins.skin.14.description',
    image: '/assets/skins/croqueta-dj.webp',
    rarity: 'skins.rarity.epic',
    particleImage: '/assets/skins/croqueta-dj.webp',
    unlockRequirement: { type: 'level', value: 80 },
  },

  // ============================================================
  // 🟣 LEGENDARIAS
  // ============================================================
  {
    id: 15,
    name: 'skins.skin.15.name',
    description: 'skins.skin.15.description',
    image: '/assets/skins/croqueta-super.webp',
    rarity: 'skins.rarity.legendary',
    particleImage: '/assets/skins/croqueta-super.webp',
    unlockRequirement: { type: 'croquetas', value: 2_500_000 },
  },
  {
    id: 16,
    name: 'skins.skin.16.name',
    description: 'skins.skin.16.description',
    image: '/assets/skins/croqueta-dios.webp',
    rarity: 'skins.rarity.legendary',
    particleImage: '/assets/skins/croqueta-dios.webp',
    unlockRequirement: { type: 'level', value: 50 },
    background: '/assets/backgrounds/bg-heaven.webp',
  },
  {
    id: 17,
    name: 'skins.skin.17.name',
    description: 'skins.skin.17.description',
    image: '/assets/skins/croqueta-phillipe.webp',
    rarity: 'skins.rarity.legendary',
    particleImage: '/assets/skins/croqueta-phillipe.webp',
    counterLabel: 'skins.skin.17.counterLabel',
    unlockRequirement: { type: 'achievement', id: 'six_seven' },
    background: '/assets/backgrounds/bg-phillipe.webp',
  },
  {
    id: 18,
    name: 'skins.skin.18.name',
    description: 'skins.skin.18.description',
    image: '/assets/skins/croqueta-cookie.webp',
    rarity: 'skins.rarity.legendary',
    particleImage: '/assets/skins/croqueta-cookie.webp',
    counterLabel: 'skins.skin.18.counterLabel',
    unlockRequirement: { type: 'level', value: 60 },
  },
  {
    id: 19,
    name: 'skins.skin.19.name',
    description: 'skins.skin.19.description',
    image: '/assets/skins/croqueta-platano.webp',
    rarity: 'skins.rarity.legendary',
    particleImage: '/assets/skins/croqueta-platano.webp',
    counterLabel: 'skins.skin.19.counterLabel',
    unlockRequirement: { type: 'exp', value: 100000 },
  },
  {
    id: 20,
    name: 'skins.skin.20.name',
    description: 'skins.skin.20.description',
    image: '/assets/skins/croqueta-bocadillo.webp',
    rarity: 'skins.rarity.legendary',
    counterLabel: 'skins.skin.20.counterLabel',
    unlockRequirement: { type: 'level', value: 75 },
  },
  // ============================================================
  // 🔴 MÍTICA
  // ============================================================
  {
    id: 21,
    name: 'skins.skin.21.name',
    description: 'skins.skin.21.description',
    image: '/assets/skins/croqueta-real.webp',
    rarity: 'skins.rarity.mythic',
    particleImage: '/assets/skins/croqueta-real.webp',
    unlockRequirement: { type: 'level', value: 100 },
  },
];
