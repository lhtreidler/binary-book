import { useEffect, useRef, useState } from "react";

export const useDebounce = <T>({
  value,
  callback,
  waitTime = 800,
}: {
  value: T;
  callback: (e: T) => void;
  waitTime?: number;
}) => {
  const [prev, setPrev] = useState<T>(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value !== prev) {
      if (timer.current) clearTimeout(timer.current);
      setPrev(value);
      timer.current = setTimeout(() => {
        callback(value);
      }, waitTime);
    }
  }, [callback, prev, value, waitTime]);
};
