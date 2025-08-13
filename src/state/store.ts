import { webln } from "@getalby/sdk";
import { create } from "zustand";

interface InvoiceData {
  amount: number;
  description: string | null;
  currency?: string; // Added currency field
}

interface State {
  readonly provider: webln.NostrWebLNProvider | undefined;
  readonly lastInvoiceData: InvoiceData | null;
}

interface Actions {
  setProvider(provider: webln.NostrWebLNProvider | undefined): void;
  setLastInvoiceData(data: InvoiceData | null): void;
}

const useStore = create<State & Actions>((set) => ({
  provider: undefined,
  lastInvoiceData: null,
  setProvider: (provider) =>
    set({
      provider,
    }),
  setLastInvoiceData: (data) =>
    set({
      lastInvoiceData: data,
    }),
}));

export default useStore;