import { useEffect, useLayoutEffect, useRef } from "react";
import { supabase, ORDERS_REALTIME_TOPIC } from "@/lib/supabase";

export interface NewOrderPayload {
  orderId: string;
  type: string;
}

export interface OrderStatusChangedPayload {
  orderId: string;
  status: string;
}

interface RealtimeHandlers {
  onNewOrder?: (payload: NewOrderPayload) => void;
  onStatusChanged?: (payload: OrderStatusChangedPayload) => void;
}

export function useOrdersRealtime(handlers: RealtimeHandlers) {
  const handlersRef = useRef(handlers);

  useLayoutEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    const channel = supabase
      .channel(ORDERS_REALTIME_TOPIC)
      .on("broadcast", { event: "new_order" }, ({ payload }) => {
        handlersRef.current.onNewOrder?.(payload as NewOrderPayload);
      })
      .on("broadcast", { event: "order_status_changed" }, ({ payload }) => {
        handlersRef.current.onStatusChanged?.(payload as OrderStatusChangedPayload);
      });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
