import type { TagIcon } from "@/schema";
import {
  BookIcon,
  CakeIcon,
  CartIcon,
  ComicIcon,
  DumbbellIcon,
  FilmIcon,
  GamepadIcon,
  GiftIcon,
  MonitorIcon,
  MusicIcon,
  PopcornIcon,
  TicketIcon,
  TvIcon,
  UtensilsIcon,
} from "@/components/PixelIcons";

export const getIconByType = (type: TagIcon | string) => {
  switch (type) {
    case "gamepad":
      return GamepadIcon;
    case "book":
      return BookIcon;
    case "film":
      return FilmIcon;
    case "music":
      return MusicIcon;
    case "tv":
      return TvIcon;
    case "monitor":
      return MonitorIcon;
    case "popcorn":
      return PopcornIcon;
    case "comic":
      return ComicIcon;
    case "utensils":
      return UtensilsIcon;
    case "ticket":
      return TicketIcon;
    case "cake":
      return CakeIcon;
    case "gift":
      return GiftIcon;
    case "cart":
      return CartIcon;
    case "dumbbell":
      return DumbbellIcon;
    default:
      return GamepadIcon;
  }
};
