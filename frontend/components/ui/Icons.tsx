import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';

// Import all icon SVGs
import HomeIcon from '@/assets/icons/home.svg';
import CalendarIcon from '@/assets/icons/calendar.svg';
import UsersIcon from '@/assets/icons/users.svg';
import UserIcon from '@/assets/icons/user.svg';
import SearchIcon from '@/assets/icons/search.svg';
import CloseIcon from '@/assets/icons/close.svg';
import CameraIcon from '@/assets/icons/camera.svg';
import PictureIcon from '@/assets/icons/picture.svg';
import EnvelopeIcon from '@/assets/icons/envelope.svg';
import DoorIcon from '@/assets/icons/door.svg';
import PadlockIcon from '@/assets/icons/padlock.svg';
import CloudIcon from '@/assets/icons/cloud.svg';
import TrashIcon from '@/assets/icons/trash.svg';
import ClockIcon from '@/assets/icons/clock.svg';
import BellIcon from '@/assets/icons/bell.svg';
import InfoIcon from '@/assets/icons/info.svg';
import FileIcon from '@/assets/icons/file.svg';
import ShareIcon from '@/assets/icons/share.svg';
import PencilIcon from '@/assets/icons/pencil.svg';
import ChevronRightIcon from '@/assets/icons/chevron-right.svg';
import MenuIcon from '@/assets/icons/menu.svg';
import ArrowLeftIcon from '@/assets/icons/arrow-left.svg';
import PlusIcon from '@/assets/icons/plus.svg';
import CogIcon from '@/assets/icons/cog.svg';
import HeartIcon from '@/assets/icons/heart.svg';
import StarIcon from '@/assets/icons/star.svg';
import BookmarkIcon from '@/assets/icons/bookmark.svg';
import TagIcon from '@/assets/icons/tag.svg';
import MapMarkerIcon from '@/assets/icons/map-marker.svg';

export type JamIconName =
  | 'home'
  | 'calendar'
  | 'users'
  | 'user'
  | 'search'
  | 'close'
  | 'camera'
  | 'picture'
  | 'envelope'
  | 'door'
  | 'padlock'
  | 'cloud'
  | 'trash'
  | 'clock'
  | 'bell'
  | 'info'
  | 'file'
  | 'share'
  | 'pencil'
  | 'chevron-right'
  | 'menu'
  | 'arrow-left'
  | 'plus'
  | 'cog'
  | 'heart'
  | 'star'
  | 'bookmark'
  | 'tag'
  | 'map-marker';

type IconComponentProps = {
  color?: string;
  size?: number;
  width?: number;
  height?: number;
  fill?: string;
  style?: ViewStyle | TextStyle;
  opacity?: number;
};

const iconMap: Record<JamIconName, React.ComponentType<IconComponentProps>> = {
  home: HomeIcon as React.ComponentType<IconComponentProps>,
  calendar: CalendarIcon as React.ComponentType<IconComponentProps>,
  users: UsersIcon as React.ComponentType<IconComponentProps>,
  user: UserIcon as React.ComponentType<IconComponentProps>,
  search: SearchIcon as React.ComponentType<IconComponentProps>,
  close: CloseIcon as React.ComponentType<IconComponentProps>,
  camera: CameraIcon as React.ComponentType<IconComponentProps>,
  picture: PictureIcon as React.ComponentType<IconComponentProps>,
  envelope: EnvelopeIcon as React.ComponentType<IconComponentProps>,
  door: DoorIcon as React.ComponentType<IconComponentProps>,
  padlock: PadlockIcon as React.ComponentType<IconComponentProps>,
  cloud: CloudIcon as React.ComponentType<IconComponentProps>,
  trash: TrashIcon as React.ComponentType<IconComponentProps>,
  clock: ClockIcon as React.ComponentType<IconComponentProps>,
  bell: BellIcon as React.ComponentType<IconComponentProps>,
  info: InfoIcon as React.ComponentType<IconComponentProps>,
  file: FileIcon as React.ComponentType<IconComponentProps>,
  share: ShareIcon as React.ComponentType<IconComponentProps>,
  pencil: PencilIcon as React.ComponentType<IconComponentProps>,
  'chevron-right': ChevronRightIcon as React.ComponentType<IconComponentProps>,
  menu: MenuIcon as React.ComponentType<IconComponentProps>,
  'arrow-left': ArrowLeftIcon as React.ComponentType<IconComponentProps>,
  plus: PlusIcon as React.ComponentType<IconComponentProps>,
  cog: CogIcon as React.ComponentType<IconComponentProps>,
  heart: HeartIcon as React.ComponentType<IconComponentProps>,
  star: StarIcon as React.ComponentType<IconComponentProps>,
  bookmark: BookmarkIcon as React.ComponentType<IconComponentProps>,
  tag: TagIcon as React.ComponentType<IconComponentProps>,
  'map-marker': MapMarkerIcon as React.ComponentType<IconComponentProps>,
};

export type IconProps = {
  name: JamIconName;
  size?: number;
  color?: string;
  style?: ViewStyle | TextStyle;
  fill?: string;
  opacity?: number;
};

export function Icon({ name, size = 24, color, style, fill, opacity }: IconProps) {
  const IconComponent = iconMap[name];
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <IconComponent
      width={size}
      height={size}
      fill={fill || color}
      opacity={opacity}
      style={style}
    />
  );
}

// Convenience component for tab bar icons with focused state
export type TabIconProps = {
  name: JamIconName;
  focused?: boolean;
  size?: number;
  activeColor?: string;
  inactiveColor?: string;
  style?: ViewStyle;
};

export function TabIcon({ name, focused = false, size = 22, activeColor, inactiveColor, style }: TabIconProps) {
  return (
    <Icon
      name={name}
      size={size}
      color={focused ? activeColor : inactiveColor}
      style={style}
    />
  );
}