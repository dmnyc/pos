import { webln } from "@getalby/sdk";
import { create } from "zustand";

interface InvoiceData {
  amount: number;
  description: string | null;
  currency?: string; // Added currency field
}

interface State {
  readonly provider: webln.NostrWebLNProvider | undefined;
  readonly tipProvider: webln.NostrWebLNProvider | undefined; // Secondary provider for tips
  readonly lastInvoiceData: InvoiceData | null;
}

interface Actions {
  setProvider(provider: webln.NostrWebLNProvider | undefined): void;
  setTipProvider(provider: webln.NostrWebLNProvider | undefined): void;
  setLastInvoiceData(data: InvoiceData | null): void;
}

const useStore = create<State & Actions>((set) => ({
  provider: undefined,
  tipProvider: undefined,
  lastInvoiceData: null,
  setProvider: (provider) =>
    set({
      provider,
    }),
  setTipProvider: (provider) =>
    set({
      tipProvider: provider,
    }),
  setLastInvoiceData: (data) =>
    set({
      lastInvoiceData: data,
    }),
}));

export default useStore;