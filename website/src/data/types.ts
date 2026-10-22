export interface Project {
  id: string;
  name: string;
  category: string;
  status: string;
  platform: string;
  image: string | null;
  imageAlt: string | null;
  imageCaption: string;
  video?: {
    src: string;
    width: number;
    height: number;
    caption: string;
    description: string;
  };
  tech: string[];
  repo: string;
  commit: string;
  summary: string;
  effect: string;
  focus: string;
  challenge: string;
  mechanism: string;
  features: string[];
  architecture: string[];
  scope: string;
  limits: string;
  excerpt?: string;
  sources: { label: string; path: string }[];
}
