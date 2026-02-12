import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import { useLocation, useNavigate } from 'react-router-dom';
import { $api } from '@life-rpg/api-client';
import { useToast } from '@/components/toast';
import {
  GAME_COLORS,
  GAME_SHADOWS,
  sxPageTitle,
  sxAccentButton,
  sxCard,
} from '@/theme/gameTheme';
import ItemCard from './ItemCard';

export default function Items() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { data: items = [] } = $api.useQuery('get', '/items');

  useEffect(() => {
    const state = location.state as { flash?: string } | null;
    if (state?.flash) {
      toast.success(state.flash);
      window.history.replaceState({}, '');
    }
  }, [location.state, toast]);

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography sx={{ ...sxPageTitle, flex: 1 }}>Items</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => navigate('/items/create')}
          sx={{ ...sxAccentButton, boxShadow: GAME_SHADOWS.button }}
        >
          New Item
        </Button>
      </Box>

      {items.length === 0 ? (
        <Box sx={{ ...sxCard, p: 3, textAlign: 'center' }}>
          <Typography
            sx={{ fontSize: '0.9rem', color: GAME_COLORS.textSecondary }}
          >
            No items yet. Create your first reward item!
          </Typography>
        </Box>
      ) : (
        items.map((item, index) => (
          <ItemCard key={item.id} {...item} index={index} />
        ))
      )}
    </Box>
  );
}
