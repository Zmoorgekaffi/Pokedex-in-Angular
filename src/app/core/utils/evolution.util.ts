import { ChainLink } from '../models';
import { extractIdFromResourceUrl } from './pokemon.util';

export interface EvolutionNode {
  id: number;
  name: string;
  /** undefined for the chain's base species — it wasn't "evolved into". */
  requirement?: EvolutionRequirement;
}

export interface EvolutionRequirement {
  triggerName: string;
  minLevel: number | null;
  minHappiness: number | null;
  itemName: string | null;
}

/** Flattens the (usually linear, occasionally branching e.g. Eevee) chain tree into slide order via DFS. */
export function flattenEvolutionChain(link: ChainLink): EvolutionNode[] {
  const nodes: EvolutionNode[] = [];

  const visit = (node: ChainLink): void => {
    const [firstDetail] = node.evolution_details;
    nodes.push({
      id: extractIdFromResourceUrl(node.species.url),
      name: node.species.name,
      requirement: firstDetail
        ? {
            triggerName: firstDetail.trigger.name,
            minLevel: firstDetail.min_level,
            minHappiness: firstDetail.min_happiness,
            itemName: firstDetail.item?.name ?? null
          }
        : undefined
    });
    node.evolves_to.forEach(visit);
  };

  visit(link);
  return nodes;
}

export function evolutionRequirementLabel(requirement: EvolutionRequirement, language: 'en' | 'de'): string {
  if (requirement.minLevel !== null) {
    return `Lvl. ${requirement.minLevel}`;
  }
  if (requirement.itemName) {
    return capitalizeSlug(requirement.itemName);
  }
  if (requirement.minHappiness !== null) {
    return language === 'de' ? 'Freundschaft' : 'Friendship';
  }
  if (requirement.triggerName === 'trade') {
    return language === 'de' ? 'Tausch' : 'Trade';
  }
  return capitalizeSlug(requirement.triggerName);
}

function capitalizeSlug(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
