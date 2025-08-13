import { Invoice } from "@getalby/lightning-tools";
import QRCode from "qrcode.react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Backbar } from "../../components/Backbar";
import useStore from "../../state/store";
import { getMerchantConfig } from "../../config";

export function Pay() {
  const { invoice } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { provider, setLastInvoiceData } = useStore();
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [hasCopied, setCopied] = useState(false);
  const isTipPayment = location.state?.isTipPayment || false;
  const config = getMerchantConfig();

  function copyQr() {
    try {
      if (!invoice) {
        return;
      }
      window.navigator.clipboard.writeText(invoice);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (!provider) {
      return;
    }
    if (invoice) {
      const inv = new Invoice({ pr: invoice });
      const { satoshi, description } = inv;
      setAmount(satoshi);
      if (description) {
        setDescription(description);
      }
      
      // Save invoice data for potential tip
      if (!isTipPayment) {
        // Get the current currency
        const currency = localStorage.getItem("pos:currency") || "SATS";
        setLastInvoiceData({ 
          amount: satoshi, 
          description,
          currency 
        });
      }

      const interval = setInterval(async () => {
        console.log("Checking invoice", invoice);
        const response = await provider.lookupInvoice({
          paymentRequest: invoice,
        });
        if (response.paid) {
          // Pass through whether this was a tip payment
          navigate("../paid", { state: { isTipPayment } });
        }
      }, 3000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [invoice, navigate, provider, setLastInvoiceData, isTipPayment]);

  if (!invoice) {
    return null;
  }

  return (
    <>
      <div className="bg-black text-white h-full" data-theme={config.theme}>
        <Backbar />
        <div className="flex grow flex-col items-center justify-center gap-3">
          <span className="text-3xl font-bold">{new Intl.NumberFormat().format(amount)} sats</span>
          <span className="font-semibold text-sm">{description}</span>
          <div className="relative flex items-center justify-center p-3 bg-white" onClick={copyQr}>
            <QRCode value={invoice} size={200} />
          </div>
          <p className="mb-2 flex flex-row items-center justify-center gap-2 text-sm">
            {!hasCopied && <span className="loading loading-spinner text-white"></span>}
            {hasCopied ? "✅ Invoice Copied!" : "Waiting for payment..."}
          </p>
          <button
            onClick={() => {
              navigate("../new");
            }}
            className="btn bg-white text-black hover:bg-gray-200 h-10 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}