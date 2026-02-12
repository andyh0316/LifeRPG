import type { SvgIconComponent } from '@mui/icons-material';

// ── Food & Drinks ──
import LocalCafe from '@mui/icons-material/LocalCafe';
import Cake from '@mui/icons-material/Cake';
import Icecream from '@mui/icons-material/Icecream';
import LocalPizza from '@mui/icons-material/LocalPizza';
import Restaurant from '@mui/icons-material/Restaurant';
import LocalBar from '@mui/icons-material/LocalBar';
import BakeryDining from '@mui/icons-material/BakeryDining';
import RamenDining from '@mui/icons-material/RamenDining';
import LunchDining from '@mui/icons-material/LunchDining';
import Fastfood from '@mui/icons-material/Fastfood';

// ── Entertainment ──
import SportsEsports from '@mui/icons-material/SportsEsports';
import Theaters from '@mui/icons-material/Theaters';
import MusicNote from '@mui/icons-material/MusicNote';
import Headphones from '@mui/icons-material/Headphones';
import LiveTv from '@mui/icons-material/LiveTv';
import TheaterComedy from '@mui/icons-material/TheaterComedy';
import CameraAlt from '@mui/icons-material/CameraAlt';
import Piano from '@mui/icons-material/Piano';

// ── Self-Care & Wellness ──
import Spa from '@mui/icons-material/Spa';
import SelfImprovement from '@mui/icons-material/SelfImprovement';
import FitnessCenter from '@mui/icons-material/FitnessCenter';
import Favorite from '@mui/icons-material/Favorite';
import Bathtub from '@mui/icons-material/Bathtub';
import HotTub from '@mui/icons-material/HotTub';

// ── Shopping & Gifts ──
import ShoppingBag from '@mui/icons-material/ShoppingBag';
import Diamond from '@mui/icons-material/Diamond';
import Redeem from '@mui/icons-material/Redeem';
import CardGiftcard from '@mui/icons-material/CardGiftcard';
import Checkroom from '@mui/icons-material/Checkroom';

// ── Travel & Outdoors ──
import Flight from '@mui/icons-material/Flight';
import BeachAccess from '@mui/icons-material/BeachAccess';
import Hiking from '@mui/icons-material/Hiking';
import Pool from '@mui/icons-material/Pool';
import DirectionsBike from '@mui/icons-material/DirectionsBike';
import Park from '@mui/icons-material/Park';
import Sailing from '@mui/icons-material/Sailing';
import Terrain from '@mui/icons-material/Terrain';

// ── Home & Relaxation ──
import Weekend from '@mui/icons-material/Weekend';
import Bed from '@mui/icons-material/Bed';
import MenuBook from '@mui/icons-material/MenuBook';
import Brush from '@mui/icons-material/Brush';
import Palette from '@mui/icons-material/Palette';

// ── Celebrations & Rewards ──
import Celebration from '@mui/icons-material/Celebration';
import EmojiEvents from '@mui/icons-material/EmojiEvents';
import Star from '@mui/icons-material/Star';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import Bolt from '@mui/icons-material/Bolt';
import Rocket from '@mui/icons-material/Rocket';
import WorkspacePremium from '@mui/icons-material/WorkspacePremium';

export interface IconEntry {
  name: string;
  component: SvgIconComponent;
  label: string;
  category: string;
}

export const ITEM_ICON_REGISTRY: IconEntry[] = [
  // Food & Drinks
  {
    name: 'LocalCafe',
    component: LocalCafe,
    label: 'Coffee',
    category: 'Food & Drinks',
  },
  { name: 'Cake', component: Cake, label: 'Cake', category: 'Food & Drinks' },
  {
    name: 'Icecream',
    component: Icecream,
    label: 'Ice Cream',
    category: 'Food & Drinks',
  },
  {
    name: 'LocalPizza',
    component: LocalPizza,
    label: 'Pizza',
    category: 'Food & Drinks',
  },
  {
    name: 'Restaurant',
    component: Restaurant,
    label: 'Dining',
    category: 'Food & Drinks',
  },
  {
    name: 'LocalBar',
    component: LocalBar,
    label: 'Drinks',
    category: 'Food & Drinks',
  },
  {
    name: 'BakeryDining',
    component: BakeryDining,
    label: 'Bakery',
    category: 'Food & Drinks',
  },
  {
    name: 'RamenDining',
    component: RamenDining,
    label: 'Ramen',
    category: 'Food & Drinks',
  },
  {
    name: 'LunchDining',
    component: LunchDining,
    label: 'Lunch',
    category: 'Food & Drinks',
  },
  {
    name: 'Fastfood',
    component: Fastfood,
    label: 'Fast Food',
    category: 'Food & Drinks',
  },

  // Entertainment
  {
    name: 'SportsEsports',
    component: SportsEsports,
    label: 'Gaming',
    category: 'Entertainment',
  },
  {
    name: 'Theaters',
    component: Theaters,
    label: 'Movies',
    category: 'Entertainment',
  },
  {
    name: 'MusicNote',
    component: MusicNote,
    label: 'Music',
    category: 'Entertainment',
  },
  {
    name: 'Headphones',
    component: Headphones,
    label: 'Headphones',
    category: 'Entertainment',
  },
  {
    name: 'LiveTv',
    component: LiveTv,
    label: 'Streaming',
    category: 'Entertainment',
  },
  {
    name: 'TheaterComedy',
    component: TheaterComedy,
    label: 'Comedy',
    category: 'Entertainment',
  },
  {
    name: 'CameraAlt',
    component: CameraAlt,
    label: 'Photography',
    category: 'Entertainment',
  },
  {
    name: 'Piano',
    component: Piano,
    label: 'Piano',
    category: 'Entertainment',
  },

  // Self-Care & Wellness
  {
    name: 'Spa',
    component: Spa,
    label: 'Spa',
    category: 'Self-Care & Wellness',
  },
  {
    name: 'SelfImprovement',
    component: SelfImprovement,
    label: 'Meditation',
    category: 'Self-Care & Wellness',
  },
  {
    name: 'FitnessCenter',
    component: FitnessCenter,
    label: 'Gym',
    category: 'Self-Care & Wellness',
  },
  {
    name: 'Favorite',
    component: Favorite,
    label: 'Heart',
    category: 'Self-Care & Wellness',
  },
  {
    name: 'Bathtub',
    component: Bathtub,
    label: 'Bath',
    category: 'Self-Care & Wellness',
  },
  {
    name: 'HotTub',
    component: HotTub,
    label: 'Hot Tub',
    category: 'Self-Care & Wellness',
  },

  // Shopping & Gifts
  {
    name: 'ShoppingBag',
    component: ShoppingBag,
    label: 'Shopping',
    category: 'Shopping & Gifts',
  },
  {
    name: 'Diamond',
    component: Diamond,
    label: 'Luxury',
    category: 'Shopping & Gifts',
  },
  {
    name: 'Redeem',
    component: Redeem,
    label: 'Redeem',
    category: 'Shopping & Gifts',
  },
  {
    name: 'CardGiftcard',
    component: CardGiftcard,
    label: 'Gift Card',
    category: 'Shopping & Gifts',
  },
  {
    name: 'Checkroom',
    component: Checkroom,
    label: 'Fashion',
    category: 'Shopping & Gifts',
  },

  // Travel & Outdoors
  {
    name: 'Flight',
    component: Flight,
    label: 'Travel',
    category: 'Travel & Outdoors',
  },
  {
    name: 'BeachAccess',
    component: BeachAccess,
    label: 'Beach',
    category: 'Travel & Outdoors',
  },
  {
    name: 'Hiking',
    component: Hiking,
    label: 'Hiking',
    category: 'Travel & Outdoors',
  },
  {
    name: 'Pool',
    component: Pool,
    label: 'Swimming',
    category: 'Travel & Outdoors',
  },
  {
    name: 'DirectionsBike',
    component: DirectionsBike,
    label: 'Biking',
    category: 'Travel & Outdoors',
  },
  {
    name: 'Park',
    component: Park,
    label: 'Park',
    category: 'Travel & Outdoors',
  },
  {
    name: 'Sailing',
    component: Sailing,
    label: 'Sailing',
    category: 'Travel & Outdoors',
  },
  {
    name: 'Terrain',
    component: Terrain,
    label: 'Nature',
    category: 'Travel & Outdoors',
  },

  // Home & Relaxation
  {
    name: 'Weekend',
    component: Weekend,
    label: 'Relaxing',
    category: 'Home & Relaxation',
  },
  {
    name: 'Bed',
    component: Bed,
    label: 'Sleep',
    category: 'Home & Relaxation',
  },
  {
    name: 'MenuBook',
    component: MenuBook,
    label: 'Reading',
    category: 'Home & Relaxation',
  },
  {
    name: 'Brush',
    component: Brush,
    label: 'Art',
    category: 'Home & Relaxation',
  },
  {
    name: 'Palette',
    component: Palette,
    label: 'Painting',
    category: 'Home & Relaxation',
  },

  // Celebrations & Rewards
  {
    name: 'Celebration',
    component: Celebration,
    label: 'Party',
    category: 'Celebrations & Rewards',
  },
  {
    name: 'EmojiEvents',
    component: EmojiEvents,
    label: 'Trophy',
    category: 'Celebrations & Rewards',
  },
  {
    name: 'Star',
    component: Star,
    label: 'Star',
    category: 'Celebrations & Rewards',
  },
  {
    name: 'AutoAwesome',
    component: AutoAwesome,
    label: 'Sparkle',
    category: 'Celebrations & Rewards',
  },
  {
    name: 'Bolt',
    component: Bolt,
    label: 'Energy',
    category: 'Celebrations & Rewards',
  },
  {
    name: 'Rocket',
    component: Rocket,
    label: 'Rocket',
    category: 'Celebrations & Rewards',
  },
  {
    name: 'WorkspacePremium',
    component: WorkspacePremium,
    label: 'Premium',
    category: 'Celebrations & Rewards',
  },
];

export const ITEM_ICON_CATEGORIES = [
  ...new Set(ITEM_ICON_REGISTRY.map((e) => e.category)),
];
