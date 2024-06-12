import React, { useLayoutEffect } from "react";
import { useSystem } from "./model";

export const SystemStatus = () => {
  const getStatus = useSystem((state) => state.getStatus);
  useLayoutEffect(() => {
    getStatus();
  }, []);

  return null;
};
