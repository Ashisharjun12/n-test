import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const BASE_Z_INDEX = 200;
const LAYER_STEP = 50;

const ModalStackContext = createContext(null);

export function ModalStackProvider({ children }) {
  const counterRef = useRef(0);
  const [stack, setStack] = useState([]);

  const pushLayer = useCallback(() => {
    const id = ++counterRef.current;
    setStack((prev) => [...prev, id]);
    return id;
  }, []);

  const popLayer = useCallback((id) => {
    setStack((prev) => prev.filter((layerId) => layerId !== id));
  }, []);

  const getZIndex = useCallback(
    (id) => {
      const index = stack.indexOf(id);
      if (index < 0) return BASE_Z_INDEX + stack.length * LAYER_STEP;
      return BASE_Z_INDEX + index * LAYER_STEP;
    },
    [stack]
  );

  useEffect(() => {
    if (stack.length > 0) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [stack.length]);

  const value = useMemo(
    () => ({
      stack,
      pushLayer,
      popLayer,
      getZIndex,
      hasOverlayModal: stack.length > 0,
    }),
    [stack, pushLayer, popLayer, getZIndex]
  );

  return <ModalStackContext.Provider value={value}>{children}</ModalStackContext.Provider>;
}

export function useModalStack() {
  const context = useContext(ModalStackContext);
  if (!context) {
    throw new Error("useModalStack must be used within ModalStackProvider");
  }
  return context;
}

export function useHasOverlayModal() {
  const context = useContext(ModalStackContext);
  return (context?.stack?.length ?? 0) > 0;
}

export function useModalLayer(open) {
  const { pushLayer, popLayer, getZIndex, stack } = useModalStack();
  const [layerId, setLayerId] = useState(null);

  // Register synchronously before paint so z-index is correct on first frame
  useLayoutEffect(() => {
    if (!open) {
      setLayerId(null);
      return undefined;
    }

    const id = pushLayer();
    setLayerId(id);

    return () => {
      popLayer(id);
      setLayerId(null);
    };
  }, [open, pushLayer, popLayer]);

  const zIndex = layerId != null ? getZIndex(layerId) : BASE_Z_INDEX + stack.length * LAYER_STEP;

  // Keep interactive while registering; only block parent modals once stacked below a child
  const isTopLayer =
    open && (layerId == null || stack[stack.length - 1] === layerId);

  return { zIndex, layerId, isTopLayer };
}
