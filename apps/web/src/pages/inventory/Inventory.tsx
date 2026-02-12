import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { $api } from '@life-rpg/api-client';
import { GAME_COLORS, sxPageTitle, sxCard } from '@/theme/gameTheme';
import InventoryItemCard from './InventoryItemCard';

export default function Inventory() {
  const { data: inventoryItems = [] } = $api.useQuery(
    'get',
    '/inventory-items',
    { params: { query: { usedAt: 'null' } } },
  );
  const { data: items = [] } = $api.useQuery('get', '/items');

  const itemMap = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography sx={{ ...sxPageTitle, flex: 1 }}>Inventory</Typography>
      </Box>

      {inventoryItems.length === 0 ? (
        <Box sx={{ ...sxCard, p: 3, textAlign: 'center' }}>
          <Typography
            sx={{ fontSize: '0.9rem', color: GAME_COLORS.textSecondary }}
          >
            Your inventory is empty. Acquire items from the shop!
          </Typography>
        </Box>
      ) : (
        inventoryItems.map((inv, index) => (
          <InventoryItemCard
            key={inv.id}
            {...inv}
            item={itemMap.get(inv.itemId)}
            index={index}
          />
        ))
      )}
    </Box>
  );
}
