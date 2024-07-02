import { Chip } from "@mui/material";
import { create } from "zustand";

const useStatusStore = create(() => ({
  status: "",
}));

export const actions = {
  setStatus: (newStatus) => {
    useStatusStore.setState({ status: newStatus });
  },
};

export const ChatStatus = () => {
  const status = useStatusStore((state) => state.status);

  if (!status) {
    return null
  }

  return (
    <div>
      <Chip label={status} />
    </div>
  );
};
