declare module 'next' {
  export type Metadata = {
    title?: string | { default: string; template?: string; absolute?: string };
    description?: string;
    manifest?: string;
    icons?: any;
    appleWebApp?: any;
    formatDetection?: any;
    openGraph?: any;
    twitter?: any;
    [key: string]: any;
  };
  export type Viewport = {
    themeColor?: string | Array<{ media?: string; color: string }>;
    width?: string | number;
    initialScale?: number;
    maximumScale?: number;
    userScalable?: boolean;
    viewportFit?: 'auto' | 'cover' | 'contain';
    [key: string]: any;
  };
  export type ResolvingMetadata = Promise<Metadata>;
  export type ResolvingViewport = Promise<Viewport>;
  export default function next(options?: any): any;
}

declare module 'lucide-react' {
  export type LucideIcon = import('react').ForwardRefExoticComponent<any>;
  export type LucideProps = any;
  export const Users: LucideIcon;
  export const Clock: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const ShieldAlert: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const Eye: LucideIcon;
  export const Building: LucideIcon;
  export const Building2: LucideIcon;
  export const QrCode: LucideIcon;
  export const Flame: LucideIcon;
  export const Award: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const MessageSquareHeart: LucideIcon;
  export const Shield: LucideIcon;
  export const Zap: LucideIcon;
  export const Info: LucideIcon;
  export const HardHat: LucideIcon;
  export const Stethoscope: LucideIcon;
  export const GraduationCap: LucideIcon;
  export const Factory: LucideIcon;
  export const Play: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const Receipt: LucideIcon;
  export const Globe: LucideIcon;
  export const Sparkles: LucideIcon;
  export const UserCheck: LucideIcon;
  export const Volume2: LucideIcon;
  export const VolumeX: LucideIcon;
  export const Calendar: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const Square: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const FileText: LucideIcon;
  export const X: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const IndianRupee: LucideIcon;
  export const Copy: LucideIcon;
  export const Share2: LucideIcon;
  export const Check: LucideIcon;
  export const Mic: LucideIcon;
  export const MicOff: LucideIcon;
  export const Camera: LucideIcon;
  export const Loader2: LucideIcon;
  export const Send: LucideIcon;
  export const Download: LucideIcon;
  export const Printer: LucideIcon;
  export const MapPin: LucideIcon;
  export const LogOut: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const Bell: LucideIcon;
  export const Filter: LucideIcon;
  export const Search: LucideIcon;
  export const Smile: LucideIcon;
  export const Meh: LucideIcon;
  export const Frown: LucideIcon;
  export const ThumbsUp: LucideIcon;
  export const Heart: LucideIcon;
  export const Briefcase: LucideIcon;
  export const DollarSign: LucideIcon;
  export const HeartHandshake: LucideIcon;
}

declare module 'recharts' {
  export const ResponsiveContainer: any;
  export const BarChart: any;
  export const Bar: any;
  export const XAxis: any;
  export const YAxis: any;
  export const Tooltip: any;
  export const Legend: any;
  export const CartesianGrid: any;
  export const LineChart: any;
  export const Line: any;
  export const AreaChart: any;
  export const Area: any;
  export const PieChart: any;
  export const Pie: any;
  export const Cell: any;
}

declare module 'next/dist/lib/metadata/types/metadata-interface.js' {
  export type ResolvingMetadata = Promise<any>;
  export type ResolvingViewport = Promise<any>;
}

declare module 'next/dist/lib/metadata/types/*.js' {
  const content: any;
  export default content;
}

declare module 'next/dynamic' {
  export type DynamicOptions<P = {}> = {
    loading?: (loadingProps: { error?: Error | null; isLoading?: boolean; pastDelay?: boolean; retry?: () => void }) => import('react').ReactNode;
    ssr?: boolean;
  };
  export default function dynamic<P = {}>(
    dynamicOptions: () => Promise<{ default: import('react').ComponentType<P> } | import('react').ComponentType<P>>,
    options?: DynamicOptions<P>
  ): import('react').ComponentType<P>;
}

declare module 'next/link' {
  export type LinkProps = import('react').ComponentPropsWithoutRef<'a'> & {
    href: string | any;
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    locale?: string | false;
    [key: string]: any;
  };
  const Link: import('react').ForwardRefExoticComponent<LinkProps & import('react').RefAttributes<HTMLAnchorElement>>;
  export default Link;
}

declare module 'next/image' {
  export type ImageProps = import('react').ComponentPropsWithoutRef<'img'> & {
    src: string | any;
    alt: string;
    width?: number | `${number}`;
    height?: number | `${number}`;
    fill?: boolean;
    priority?: boolean;
    [key: string]: any;
  };
  export default function Image(props: ImageProps): import('react').ReactElement;
}

declare module 'next/navigation' {
  export function useRouter(): {
    push(href: string): void;
    replace(href: string): void;
    back(): void;
    forward(): void;
    refresh(): void;
    prefetch(href: string): void;
  };
  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
  export function useParams(): Record<string, string | string[]>;
}

declare module 'next/server' {
  export class NextRequest extends Request {
    readonly nextUrl: URL;
    readonly ip?: string;
    readonly geo?: {
      city?: string;
      country?: string;
      region?: string;
      latitude?: string;
      longitude?: string;
    };
    json(): Promise<any>;
  }

  export class NextResponse<Body = any> extends Response {
    static json<JsonBody>(data: JsonBody, init?: ResponseInit): NextResponse<JsonBody>;
    static redirect(url: string | URL, status?: number): NextResponse;
    static next(): NextResponse;
  }
}

declare module 'next/server.js' {
  export class NextRequest extends Request {
    readonly nextUrl: URL;
    readonly ip?: string;
    readonly geo?: {
      city?: string;
      country?: string;
      region?: string;
      latitude?: string;
      longitude?: string;
    };
    json(): Promise<any>;
  }

  export class NextResponse<Body = any> extends Response {
    static json<JsonBody>(data: JsonBody, init?: ResponseInit): NextResponse<JsonBody>;
    static redirect(url: string | URL, status?: number): NextResponse;
    static next(): NextResponse;
  }
}
