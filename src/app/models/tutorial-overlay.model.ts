export interface TutorialOverlayStep {
  id: string;
  titleKey: string;
  bodyKey: string;
  image?: string;
  localizedImages?: Record<string, string>;
}
