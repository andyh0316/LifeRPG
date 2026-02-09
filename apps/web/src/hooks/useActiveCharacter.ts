import { $api } from '@life-rpg/api-client';

export default function useActiveCharacter() {
  const { data: summary } = $api.useQuery('get', '/user-character/summary');
  const characters = summary?.characters ?? [];
  const activeCharacterId = summary?.activeCharacterId;
  const active =
    characters.find((c) => c.id === activeCharacterId) ?? characters[0];

  return { characters, activeCharacterId, active };
}
