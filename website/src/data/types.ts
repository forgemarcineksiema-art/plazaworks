export interface Project {
  id: string;
  name: string;
  category: string;
  status: string;
  platform: string;
  image: string | null;
  imageAlt: string | null;
  imageCaption: string;
  tech: string[];
  repo: string;
  commit: string;
  summary: string;
  effect: string;
  mechanism: string;
  features: string[];
  architecture: string[];
  scope: string;
  limits: string;
  excerpt?: string;
  sources: { label: string; path: string }[];
}
