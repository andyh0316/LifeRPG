import type { SvgIconComponent } from '@mui/icons-material';

// ── Health & Fitness ──
import FitnessCenter from '@mui/icons-material/FitnessCenter';
import DirectionsRun from '@mui/icons-material/DirectionsRun';
import SelfImprovement from '@mui/icons-material/SelfImprovement';
import Spa from '@mui/icons-material/Spa';
import Favorite from '@mui/icons-material/Favorite';
import Psychology from '@mui/icons-material/Psychology';
import LocalHospital from '@mui/icons-material/LocalHospital';
import MonitorHeart from '@mui/icons-material/MonitorHeart';

// ── Work & Productivity ──
import Work from '@mui/icons-material/Work';
import BusinessCenter from '@mui/icons-material/BusinessCenter';
import Laptop from '@mui/icons-material/Laptop';
import Schedule from '@mui/icons-material/Schedule';
import Assignment from '@mui/icons-material/Assignment';
import Build from '@mui/icons-material/Build';
import Engineering from '@mui/icons-material/Engineering';
import Task from '@mui/icons-material/Task';

// ── Education & Learning ──
import MenuBook from '@mui/icons-material/MenuBook';
import School from '@mui/icons-material/School';
import Science from '@mui/icons-material/Science';
import Calculate from '@mui/icons-material/Calculate';
import AutoStories from '@mui/icons-material/AutoStories';
import Translate from '@mui/icons-material/Translate';
import HistoryEdu from '@mui/icons-material/HistoryEdu';

// ── Home & Daily ──
import Home from '@mui/icons-material/Home';
import Kitchen from '@mui/icons-material/Kitchen';
import CleaningServices from '@mui/icons-material/CleaningServices';
import LocalLaundryService from '@mui/icons-material/LocalLaundryService';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import Handyman from '@mui/icons-material/Handyman';
import Bed from '@mui/icons-material/Bed';
import Restaurant from '@mui/icons-material/Restaurant';

// ── Creative & Hobbies ──
import Brush from '@mui/icons-material/Brush';
import MusicNote from '@mui/icons-material/MusicNote';
import CameraAlt from '@mui/icons-material/CameraAlt';
import SportsEsports from '@mui/icons-material/SportsEsports';
import Palette from '@mui/icons-material/Palette';
import Piano from '@mui/icons-material/Piano';
import Draw from '@mui/icons-material/Draw';
import TheaterComedy from '@mui/icons-material/TheaterComedy';

// ── Finance ──
import AccountBalance from '@mui/icons-material/AccountBalance';
import Savings from '@mui/icons-material/Savings';
import MonetizationOn from '@mui/icons-material/MonetizationOn';
import TrendingUp from '@mui/icons-material/TrendingUp';
import Receipt from '@mui/icons-material/Receipt';

// ── Social & Communication ──
import People from '@mui/icons-material/People';
import Forum from '@mui/icons-material/Forum';
import Email from '@mui/icons-material/Email';
import Call from '@mui/icons-material/Call';
import Celebration from '@mui/icons-material/Celebration';
import VolunteerActivism from '@mui/icons-material/VolunteerActivism';

// ── Travel & Outdoors ──
import DirectionsBike from '@mui/icons-material/DirectionsBike';
import Hiking from '@mui/icons-material/Hiking';
import Park from '@mui/icons-material/Park';
import Flight from '@mui/icons-material/Flight';
import Pool from '@mui/icons-material/Pool';
import Terrain from '@mui/icons-material/Terrain';

// ── General ──
import Star from '@mui/icons-material/Star';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Flag from '@mui/icons-material/Flag';
import EmojiEvents from '@mui/icons-material/EmojiEvents';
import Bolt from '@mui/icons-material/Bolt';
import Rocket from '@mui/icons-material/Rocket';
import Timer from '@mui/icons-material/Timer';
import WaterDrop from '@mui/icons-material/WaterDrop';
import LightMode from '@mui/icons-material/LightMode';
import NightsStay from '@mui/icons-material/NightsStay';

export interface IconEntry {
  name: string;
  component: SvgIconComponent;
  label: string;
  category: string;
}

export const ICON_REGISTRY: IconEntry[] = [
  // Health & Fitness
  {
    name: 'FitnessCenter',
    component: FitnessCenter,
    label: 'Fitness Center',
    category: 'Health & Fitness',
  },
  {
    name: 'DirectionsRun',
    component: DirectionsRun,
    label: 'Running',
    category: 'Health & Fitness',
  },
  {
    name: 'SelfImprovement',
    component: SelfImprovement,
    label: 'Self Improvement',
    category: 'Health & Fitness',
  },
  { name: 'Spa', component: Spa, label: 'Spa', category: 'Health & Fitness' },
  {
    name: 'Favorite',
    component: Favorite,
    label: 'Favorite',
    category: 'Health & Fitness',
  },
  {
    name: 'Psychology',
    component: Psychology,
    label: 'Psychology',
    category: 'Health & Fitness',
  },
  {
    name: 'LocalHospital',
    component: LocalHospital,
    label: 'Hospital',
    category: 'Health & Fitness',
  },
  {
    name: 'MonitorHeart',
    component: MonitorHeart,
    label: 'Heart Monitor',
    category: 'Health & Fitness',
  },

  // Work & Productivity
  {
    name: 'Work',
    component: Work,
    label: 'Work',
    category: 'Work & Productivity',
  },
  {
    name: 'BusinessCenter',
    component: BusinessCenter,
    label: 'Business',
    category: 'Work & Productivity',
  },
  {
    name: 'Laptop',
    component: Laptop,
    label: 'Laptop',
    category: 'Work & Productivity',
  },
  {
    name: 'Schedule',
    component: Schedule,
    label: 'Schedule',
    category: 'Work & Productivity',
  },
  {
    name: 'Assignment',
    component: Assignment,
    label: 'Assignment',
    category: 'Work & Productivity',
  },
  {
    name: 'Build',
    component: Build,
    label: 'Build',
    category: 'Work & Productivity',
  },
  {
    name: 'Engineering',
    component: Engineering,
    label: 'Engineering',
    category: 'Work & Productivity',
  },
  {
    name: 'Task',
    component: Task,
    label: 'Task',
    category: 'Work & Productivity',
  },

  // Education & Learning
  {
    name: 'MenuBook',
    component: MenuBook,
    label: 'Book',
    category: 'Education & Learning',
  },
  {
    name: 'School',
    component: School,
    label: 'School',
    category: 'Education & Learning',
  },
  {
    name: 'Science',
    component: Science,
    label: 'Science',
    category: 'Education & Learning',
  },
  {
    name: 'Calculate',
    component: Calculate,
    label: 'Calculate',
    category: 'Education & Learning',
  },
  {
    name: 'AutoStories',
    component: AutoStories,
    label: 'Stories',
    category: 'Education & Learning',
  },
  {
    name: 'Translate',
    component: Translate,
    label: 'Translate',
    category: 'Education & Learning',
  },
  {
    name: 'HistoryEdu',
    component: HistoryEdu,
    label: 'History',
    category: 'Education & Learning',
  },

  // Home & Daily
  { name: 'Home', component: Home, label: 'Home', category: 'Home & Daily' },
  {
    name: 'Kitchen',
    component: Kitchen,
    label: 'Kitchen',
    category: 'Home & Daily',
  },
  {
    name: 'CleaningServices',
    component: CleaningServices,
    label: 'Cleaning',
    category: 'Home & Daily',
  },
  {
    name: 'LocalLaundryService',
    component: LocalLaundryService,
    label: 'Laundry',
    category: 'Home & Daily',
  },
  {
    name: 'ShoppingCart',
    component: ShoppingCart,
    label: 'Shopping',
    category: 'Home & Daily',
  },
  {
    name: 'Handyman',
    component: Handyman,
    label: 'Handyman',
    category: 'Home & Daily',
  },
  { name: 'Bed', component: Bed, label: 'Bed', category: 'Home & Daily' },
  {
    name: 'Restaurant',
    component: Restaurant,
    label: 'Restaurant',
    category: 'Home & Daily',
  },

  // Creative & Hobbies
  {
    name: 'Brush',
    component: Brush,
    label: 'Brush',
    category: 'Creative & Hobbies',
  },
  {
    name: 'MusicNote',
    component: MusicNote,
    label: 'Music',
    category: 'Creative & Hobbies',
  },
  {
    name: 'CameraAlt',
    component: CameraAlt,
    label: 'Camera',
    category: 'Creative & Hobbies',
  },
  {
    name: 'SportsEsports',
    component: SportsEsports,
    label: 'Gaming',
    category: 'Creative & Hobbies',
  },
  {
    name: 'Palette',
    component: Palette,
    label: 'Palette',
    category: 'Creative & Hobbies',
  },
  {
    name: 'Piano',
    component: Piano,
    label: 'Piano',
    category: 'Creative & Hobbies',
  },
  {
    name: 'Draw',
    component: Draw,
    label: 'Draw',
    category: 'Creative & Hobbies',
  },
  {
    name: 'TheaterComedy',
    component: TheaterComedy,
    label: 'Theater',
    category: 'Creative & Hobbies',
  },

  // Finance
  {
    name: 'AccountBalance',
    component: AccountBalance,
    label: 'Bank',
    category: 'Finance',
  },
  {
    name: 'Savings',
    component: Savings,
    label: 'Savings',
    category: 'Finance',
  },
  {
    name: 'MonetizationOn',
    component: MonetizationOn,
    label: 'Money',
    category: 'Finance',
  },
  {
    name: 'TrendingUp',
    component: TrendingUp,
    label: 'Trending Up',
    category: 'Finance',
  },
  {
    name: 'Receipt',
    component: Receipt,
    label: 'Receipt',
    category: 'Finance',
  },

  // Social & Communication
  {
    name: 'People',
    component: People,
    label: 'People',
    category: 'Social & Communication',
  },
  {
    name: 'Forum',
    component: Forum,
    label: 'Forum',
    category: 'Social & Communication',
  },
  {
    name: 'Email',
    component: Email,
    label: 'Email',
    category: 'Social & Communication',
  },
  {
    name: 'Call',
    component: Call,
    label: 'Call',
    category: 'Social & Communication',
  },
  {
    name: 'Celebration',
    component: Celebration,
    label: 'Celebration',
    category: 'Social & Communication',
  },
  {
    name: 'VolunteerActivism',
    component: VolunteerActivism,
    label: 'Volunteer',
    category: 'Social & Communication',
  },

  // Travel & Outdoors
  {
    name: 'DirectionsBike',
    component: DirectionsBike,
    label: 'Biking',
    category: 'Travel & Outdoors',
  },
  {
    name: 'Hiking',
    component: Hiking,
    label: 'Hiking',
    category: 'Travel & Outdoors',
  },
  {
    name: 'Park',
    component: Park,
    label: 'Park',
    category: 'Travel & Outdoors',
  },
  {
    name: 'Flight',
    component: Flight,
    label: 'Flight',
    category: 'Travel & Outdoors',
  },
  {
    name: 'Pool',
    component: Pool,
    label: 'Pool',
    category: 'Travel & Outdoors',
  },
  {
    name: 'Terrain',
    component: Terrain,
    label: 'Terrain',
    category: 'Travel & Outdoors',
  },

  // General
  { name: 'Star', component: Star, label: 'Star', category: 'General' },
  {
    name: 'CheckCircle',
    component: CheckCircle,
    label: 'Check Circle',
    category: 'General',
  },
  { name: 'Flag', component: Flag, label: 'Flag', category: 'General' },
  {
    name: 'EmojiEvents',
    component: EmojiEvents,
    label: 'Trophy',
    category: 'General',
  },
  { name: 'Bolt', component: Bolt, label: 'Bolt', category: 'General' },
  { name: 'Rocket', component: Rocket, label: 'Rocket', category: 'General' },
  { name: 'Timer', component: Timer, label: 'Timer', category: 'General' },
  {
    name: 'WaterDrop',
    component: WaterDrop,
    label: 'Water',
    category: 'General',
  },
  {
    name: 'LightMode',
    component: LightMode,
    label: 'Sun',
    category: 'General',
  },
  {
    name: 'NightsStay',
    component: NightsStay,
    label: 'Moon',
    category: 'General',
  },
];

export const ICON_MAP: Record<string, SvgIconComponent> = Object.fromEntries(
  ICON_REGISTRY.map((entry) => [entry.name, entry.component]),
);

export const ICON_CATEGORIES = [
  ...new Set(ICON_REGISTRY.map((e) => e.category)),
];
