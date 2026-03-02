/**
 * Biome configurations for ecodia marketing pages.
 * Each biome represents a distinct eco-philosophy with its own visual identity.
 */

export interface BiomeConfig {
  slug: BiomeSlug;
  name: string;
  tagline: string;
  description: string;
  gradient: string;
  accentColor: string;
  icon: string;
}

export const BIOMES = [
  {
    slug: "horizon",
    name: "Horizon",
    tagline: "Look ahead to a sustainable future",
    description:
      "Horizon is about expansive thinking and long-term vision. It challenges us to look beyond the immediate and design for generations, embracing the warm glow of possibility on the edge of tomorrow.",
    gradient:
      "linear-gradient(135deg, var(--ec-gold-600) 0%, var(--ec-gold-400) 40%, #f5a623 100%)",
    accentColor: "var(--ec-gold-500)",
    icon: "sunrise",
  },
  {
    slug: "soil",
    name: "Soil",
    tagline: "Regenerative practices start from the ground",
    description:
      "Soil grounds us in the fundamentals of regeneration. Every thriving ecosystem begins beneath our feet - with the slow, patient work of building healthy foundations that sustain life above.",
    gradient: "linear-gradient(135deg, #5d3a1a 0%, #8b5e3c 45%, #c4805a 100%)",
    accentColor: "#8b5e3c",
    icon: "mountain",
  },
  {
    slug: "kinetic",
    name: "Kinetic",
    tagline: "Renewable energy powers every bold action",
    description:
      "Kinetic is the biome of motion and momentum. It captures the electric pulse of renewable energy and transforms it into tangible action, proving that sustainability and dynamism are inseparable forces.",
    gradient:
      "linear-gradient(135deg, var(--ec-mint-600) 0%, #00d4aa 50%, #00bcd4 100%)",
    accentColor: "var(--ec-mint-500)",
    icon: "zap",
  },
  {
    slug: "studio",
    name: "Studio",
    tagline: "Creative reuse through making and upcycling",
    description:
      "Studio celebrates the maker spirit - where waste becomes material and discarded objects find new purpose. It is the creative engine of the circular economy, proving that imagination is our most renewable resource.",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #a855f7 45%, #d946ef 100%)",
    accentColor: "#a855f7",
    icon: "palette",
  },
  {
    slug: "source",
    name: "Source",
    tagline: "Conserve water, protect our shared origin",
    description:
      "Source flows from the understanding that water is life's first language. It honours the rivers, aquifers, and rainfall that connect every living system, reminding us that conservation begins at the origin.",
    gradient: "linear-gradient(135deg, #1e40af 0%, #3b82f6 45%, #22d3ee 100%)",
    accentColor: "#3b82f6",
    icon: "droplets",
  },
  {
    slug: "roots",
    name: "Roots",
    tagline: "Community and interconnection strengthen everything",
    description:
      "Roots is the biome of belonging. Like mycorrhizal networks beneath the forest floor, it maps the invisible connections between people, places, and purpose - proving that we are stronger intertwined.",
    gradient:
      "linear-gradient(135deg, var(--ec-forest-800) 0%, var(--ec-forest-600) 45%, var(--ec-mint-700) 100%)",
    accentColor: "var(--ec-forest-600)",
    icon: "network",
  },
] as const satisfies readonly BiomeConfig[];

export const BIOME_SLUGS = [
  "horizon",
  "soil",
  "kinetic",
  "studio",
  "source",
  "roots",
] as const;

export type BiomeSlug = (typeof BIOME_SLUGS)[number];
