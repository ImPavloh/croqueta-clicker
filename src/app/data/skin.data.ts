import { SkinModel } from 'app/models/skin.model';

// fondos implementados pero no usados (no hay imagenes de fondo de momento/no me convence ~ Pavloh)

export const SKINS: SkinModel[] = [
  // ============================================================
  // 🟤 COMUNES
  // ============================================================
  {
    id: 1,
    name: 'Normal',
    description: 'Una croqueta pocha del Wercadona',
    image: '/assets/skins/croqueta-normal.webp',
    rarity: 'Común',
    unlocked: true,
    unlockRequirement: { type: 'none' },
  },
  {
    id: 2,
    name: 'Jamón',
    description: 'Una croqueta deliciosa de jamón ibérico',
    image: '/assets/skins/croqueta-jamon.webp',
    rarity: 'Común',
    unlockRequirement: { type: 'croquetas', value: 500 },
  },
  {
    id: 3,
    name: 'Pollo',
    description: 'Una croqueta de pollo jugosa y sabrosa',
    image: '/assets/skins/croqueta-pollo.webp',
    rarity: 'Común',
    unlockRequirement: { type: 'level', value: 3 },
  },
  {
    id: 4,
    name: 'Queso',
    description: 'Una croqueta de queso cremosa y deliciosa',
    image: '/assets/skins/croqueta-queso.webp',
    rarity: 'Común',
    unlockRequirement: { type: 'croquetas', value: 2000 },
  },
  {
    id: 5,
    name: 'Bacalao',
    description: 'Una croqueta de bacalao tradicional y sabrosa',
    image: '/assets/skins/croqueta-bacalao.webp',
    rarity: 'Común',
    unlockRequirement: { type: 'level', value: 5 },
  },
  {
    id: 6,
    name: 'Setas',
    description: 'Una croqueta de setas exquisita y aromática',
    image: '/assets/skins/croqueta-setas.webp',
    rarity: 'Común',
    unlockRequirement: { type: 'level', value: 10 },
  },

  // ============================================================
  // 🟡 RARAS
  // ============================================================
  {
    id: 7,
    name: 'Coqueta',
    description: 'Una croqueta divina y con estilo',
    image: '/assets/skins/croqueta-coqueta.webp',
    rarity: 'Rara',
    particleImage: '/assets/skins/croqueta-coqueta.webp',
    unlockRequirement: { type: 'level', value: 13 },
  },
  {
    id: 8,
    name: 'Dorada',
    description: 'Una croqueta de lujo, probablemente tóxica.',
    image: '/assets/skins/croqueta-dorada.webp',
    rarity: 'Rara',
    particleImage: '/assets/skins/croqueta-dorada.webp',
    unlockRequirement: { type: 'level', value: 15 },
  },
  {
    id: 9,
    name: 'Quemada',
    description: 'Demasiado tiempo en la freidora... crujiente nivel carbón.',
    image: '/assets/skins/croqueta-quemada.webp',
    rarity: 'Rara',
    particleImage: '/assets/skins/croqueta-quemada.webp',
    unlockRequirement: { type: 'croquetas', value: 10000 },
    background: '/assets/backgrounds/bg-quemado.webp',
  },

  // ============================================================
  // 🔵 ÉPICAS
  // ============================================================
  {
    id: 10,
    name: 'Cósmica',
    description: 'Brilla con el poder del universo. No apta para humanos.',
    image: '/assets/skins/croqueta-cosmica.webp',
    rarity: 'Épica',
    particleImage: '/assets/skins/croqueta-cosmica.webp',
    unlockRequirement: { type: 'croquetas', value: 150000 },
    background: '/assets/backgrounds/bg-galaxy.webp',
  },
  {
    id: 11,
    name: 'Rey',
    description: 'Su majestad la croqueta, soberana de todas las frituras.',
    image: '/assets/skins/croqueta-rey.webp',
    rarity: 'Épica',
    particleImage: '/assets/skins/croqueta-rey.webp',
    unlockRequirement: { type: 'level', value: 20 },
  },
  {
    id: 12,
    name: 'Papa',
    description: 'La croqueta elegida: sabia, firme y un poco pasada de sal.',
    image: '/assets/skins/croqueta-papa.webp',
    rarity: 'Épica',
    particleImage: '/assets/skins/croqueta-papa.webp',
    unlockRequirement: { type: 'level', value: 30 },
  },
  {
    id: 13,
    name: 'Empresaria',
    description: 'Una croqueta lista para los negocios.',
    image: '/assets/skins/croqueta-empresaria.webp',
    rarity: 'Épica',
    particleImage: '/assets/skins/croqueta-empresaria.webp',
    unlockRequirement: { type: 'croquetas', value: 750000 },
  },
  {
    id: 14,
    name: 'DJ',
    description: 'La croqueta que pone la música en la fiesta.',
    image: '/assets/skins/croqueta-dj.webp',
    rarity: 'Épica',
    particleImage: '/assets/skins/croqueta-dj.webp',
    unlockRequirement: { type: 'level', value: 80 },
  },

  // ============================================================
  // 🟣 LEGENDARIAS
  // ============================================================
  {
    id: 15,
    name: 'Super',
    description: 'Una croqueta heroica que salva el día.',
    image: '/assets/skins/croqueta-super.webp',
    rarity: 'Legendaria',
    particleImage: '/assets/skins/croqueta-super.webp',
    unlockRequirement: { type: 'croquetas', value: 2_500_000 },
  },
  {
    id: 16,
    name: 'Dios',
    description: 'Más allá de la bechamel y el pan rallado...',
    image: '/assets/skins/croqueta-dios.webp',
    rarity: 'Legendaria',
    particleImage: '/assets/skins/croqueta-dios.webp',
    unlockRequirement: { type: 'level', value: 50 },
    background: '/assets/backgrounds/bg-heaven.webp',
  },
  {
    id: 17,
    name: 'Phillipe',
    description: 'phillipe.',
    image: '/assets/skins/croqueta-phillipe.webp',
    rarity: 'Legendaria',
    particleImage: '/assets/skins/croqueta-phillipe.webp',
    counterLabel: '¿croquetas?',
    unlockRequirement: { type: 'achievement', id: 'six_seven' },
    background: '/assets/backgrounds/bg-phillipe.webp',
  },
  {
    id: 18,
    name: 'Cookie',
    description: 'Una croqueta en crisis de identidad.',
    image: '/assets/skins/croqueta-cookie.webp',
    rarity: 'Legendaria',
    particleImage: '/assets/skins/croqueta-cookie.webp',
    counterLabel: '¿galletas?',
    unlockRequirement: { type: 'level', value: 60 },
  },
  {
    id: 19,
    name: '¿Plátano?',
    description: 'Una croqueta tropical que te deja con dudas existenciales.',
    image: '/assets/skins/croqueta-platano.webp',
    rarity: 'Legendaria',
    particleImage: '/assets/skins/croqueta-platano.webp',
    counterLabel: '¿plátanos?',
    unlockRequirement: { type: 'exp', value: 100000 },
  },
  {
    id: 20,
    name: 'Bocadillo...',
    description: 'Un bocadillo relleno de croquetas, para los más valientes.',
    image: '/assets/skins/croqueta-bocadillo.webp',
    rarity: 'Legendaria',
    counterLabel: '¿bocadillos?',
    unlockRequirement: { type: 'level', value: 75 },
  },
  // ============================================================
  // 🔴 MÍTICA
  // ============================================================
  {
    id: 21,
    name: 'Real',
    description: 'La croqueta definitiva.',
    image: '/assets/skins/croqueta-real.webp',
    rarity: 'Mítica',
    particleImage: '/assets/skins/croqueta-real.webp',
    unlockRequirement: { type: 'level', value: 100 },
  },
];
