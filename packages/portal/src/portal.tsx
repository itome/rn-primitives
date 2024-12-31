import * as React from 'react';
import { Platform, type View, type ViewStyle } from 'react-native';

const DEFAULT_PORTAL_HOST = 'INTERNAL_PRIMITIVE_DEFAULT_HOST_NAME';
type PortalMap = Map<string, React.ReactNode>;
type PortalHostMap = Map<string, PortalMap>;

interface PortalContextType {
  map: PortalHostMap;
  updatePortal: (hostName: string, name: string, children: React.ReactNode) => void;
  removePortal: (hostName: string, name: string) => void;
}

const PortalContext = React.createContext<PortalContextType | null>(null);

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const [portalHostMap, setPortalHostMap] = React.useState<PortalHostMap>(
    () => new Map([[DEFAULT_PORTAL_HOST, new Map()]])
  );

  const updatePortal = React.useCallback((hostName: string, name: string, children: React.ReactNode) => {
    setPortalHostMap(prev => {
      const next = new Map(prev);
      const portal = next.get(hostName) ?? new Map<string, React.ReactNode>();
      portal.set(name, children);
      next.set(hostName, portal);
      return next;
    });
  }, []);

  const removePortal = React.useCallback((hostName: string, name: string) => {
    setPortalHostMap(prev => {
      const next = new Map(prev);
      const portal = next.get(hostName) ?? new Map<string, React.ReactNode>();
      portal.delete(name);
      next.set(hostName, portal);
      return next;
    });
  }, []);

  const value = React.useMemo(
    () => ({
      map: portalHostMap,
      updatePortal,
      removePortal,
    }),
    [portalHostMap, updatePortal, removePortal]
  );

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

function usePortalContext() {
  const context = React.useContext(PortalContext);
  if (!context) {
    throw new Error('Portal components must be used within a PortalProvider');
  }
  return context;
}

export function PortalHost({ name = DEFAULT_PORTAL_HOST }: { name?: string }) {
  const { map } = usePortalContext();
  const portalMap = map.get(name) ?? new Map<string, React.ReactNode>();
  
  if (portalMap.size === 0) return null;
  return <>{Array.from(portalMap.values())}</>;
}

export function Portal({
  name,
  hostName = DEFAULT_PORTAL_HOST,
  children,
}: {
  name: string;
  hostName?: string;
  children: React.ReactNode;
}) {
  const { updatePortal, removePortal } = usePortalContext();

  React.useEffect(() => {
    updatePortal(hostName, name, children);
  }, [hostName, name, children, updatePortal]);

  React.useEffect(() => {
    return () => {
      removePortal(hostName, name);
    };
  }, [hostName, name, removePortal]);

  return null;
}

const ROOT: ViewStyle = {
  flex: 1,
};

/**
 * @deprecated use `FullWindowOverlay` from `react-native-screens` instead
 * @example
import { FullWindowOverlay } from "react-native-screens"
const WindowOverlay = Platform.OS === "ios" ? FullWindowOverlay : Fragment
// Wrap the `<PortalHost/>` with `<WindowOverlay/>`
<WindowOverlay><PortalHost/></WindowOverlay>
 */
export function useModalPortalRoot() {
  const ref = React.useRef<View>(null);
  const [sideOffset, setSideOffSet] = React.useState(0);

  const onLayout = React.useCallback(() => {
    if (Platform.OS === 'web') return;
    ref.current?.measure((_x, _y, _width, _height, _pageX, pageY) => {
      setSideOffSet(-pageY);
    });
  }, []);

  return {
    ref,
    sideOffset,
    onLayout,
    style: ROOT,
  };
}
