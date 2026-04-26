import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bell,
  Bookmark,
  CalendarCheck,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CircleAlert,
  CircleCheck,
  CircleHelp,
  CircleUser,
  ConciergeBell,
  Download,
  Gavel,
  Heart,
  Home,
  LayoutDashboard,
  ListFilter,
  LoaderCircle,
  LogOut,
  Menu,
  Minus,
  MoreHorizontal,
  PanelLeftOpen,
  PanelRightOpen,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Scale,
  Search,
  Settings,
  Share2,
  SquarePen,
  Store,
  Tag,
  Trash2,
  TriangleAlert,
  User,
  X,
  type LucideIcon,
} from "lucide-react";

type IconColor =
  | "primary"
  | "white"
  | "black"
  | "success"
  | "warn"
  | "error"
  | "errror"
  | "current";

type IconProps = {
  icon: string;
  size?: number;
  color?: IconColor;
  fill?: boolean;
  className?: string;
};

const iconColorMap: Record<IconColor, string> = {
  primary: "var(--app-primary)",
  white: "var(--app-text-inverse)",
  black: "var(--color-black-1)",
  success: "var(--app-success)",
  warn: "var(--app-warning)",
  error: "var(--app-error)",
  errror: "var(--app-error)",
  current: "currentColor",
};

const iconMap: Record<string, LucideIcon> = {
  account_circle: CircleUser,
  account_tree: Store,
  add: Plus,
  arrow_back: ArrowLeft,
  arrow_forward: ArrowRight,
  autorenew: RefreshCw,
  bookmark: Bookmark,
  check: Check,
  check_circle: CircleCheck,
  chevron_left: ChevronLeft,
  chevron_right: ChevronRight,
  filter_list: ListFilter,
  more_horiz: MoreHorizontal,
  close: X,
  dashboard: LayoutDashboard,
  delete: Trash2,
  download: Download,
  edit: Pencil,
  edit_square: SquarePen,
  error: CircleAlert,
  event_available: CalendarCheck,
  expand_more: ChevronDown,
  favorite: Heart,
  gavel: Gavel,
  help: CircleHelp,
  home: Home,
  left_panel_open: PanelLeftOpen,
  right_panel_open: PanelRightOpen,
  logout: LogOut,
  menu: Menu,
  notifications: Bell,
  person: User,
  progress_activity: LoaderCircle,
  remove: Minus,
  room_service: ConciergeBell,
  save: Save,
  search: Search,
  sell: Tag,
  settings: Settings,
  share: Share2,
  unfold_more: ChevronsUpDown,
  verified: BadgeCheck,
  warning: TriangleAlert,
  // aliases
  scale: Scale,
};

export function Icon({
  icon,
  size = 16,
  color = "black",
  className,
}: IconProps) {
  const LucideIconComponent = iconMap[icon];

  if (!LucideIconComponent) {
    return null;
  }

  return (
    <LucideIconComponent
      aria-hidden="true"
      size={size}
      color={iconColorMap[color]}
      className={className}
    />
  );
}
