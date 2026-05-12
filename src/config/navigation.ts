import { 
  ShieldCheck, 
  CreditCard,
  Terminal, 
  MapPin, 
  MessageSquare, 
  Send,
  Network,
  Mail
} from 'lucide-react';

export interface NavItem {
  to: string;
  icon: any;
  label: string;
  group: 'Utilities' | 'Community';
  external?: boolean;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  // Utility & Development Vectors
  { to: '/card-checker', icon: ShieldCheck, label: 'Live Gateway', group: 'Utilities' },
  { to: '/bin-checker', icon: CreditCard, label: 'BIN Lookup', group: 'Utilities' },
  { to: '/test-cards', icon: Terminal, label: 'Vector Gen', group: 'Utilities' },
  { to: '/fake-address', icon: MapPin, label: 'Mock Identity', group: 'Utilities' },
  { to: '/ip', icon: Mail, label: 'IP Check', group: 'Utilities' },
  { to: '/', icon: MessageSquare, label: 'Discussion Board', group: 'Community' },
  { to: '/messages', icon: Network, label: 'Live Chat', group: 'Community', badge: 'LIVE' },
  
  // External Endpoints
  { to: 'https://t.me/drkingbd', icon: Send, label: 'Telegram Channel', group: 'Community', external: true }
];
