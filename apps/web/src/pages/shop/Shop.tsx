import { useEffect, useMemo } from 'react';
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
import ShopListingCard from './ShopListingCard';

export default function Shop() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { data: listings = [] } = $api.useQuery('get', '/shop-listings');
  const { data: items = [] } = $api.useQuery('get', '/items');

  const itemMap = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

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
        <Typography sx={{ ...sxPageTitle, flex: 1 }}>Shop</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => navigate('/shop/create')}
          sx={{ ...sxAccentButton, boxShadow: GAME_SHADOWS.button }}
        >
          New Listing
        </Button>
      </Box>

      {listings.length === 0 ? (
        <Box sx={{ ...sxCard, p: 3, textAlign: 'center' }}>
          <Typography
            sx={{ fontSize: '0.9rem', color: GAME_COLORS.textSecondary }}
          >
            No shop listings yet. Add your first item to the shop!
          </Typography>
        </Box>
      ) : (
        listings.map((listing, index) => (
          <ShopListingCard
            key={listing.id}
            {...listing}
            item={itemMap.get(listing.itemId)}
            index={index}
          />
        ))
      )}
    </Box>
  );
}
