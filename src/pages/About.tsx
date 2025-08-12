import { Backbar } from "../components/Backbar";
import { getMerchantConfig } from "../config";

export function About() {
  const config = getMerchantConfig();
  
  return (
    <div className="flex flex-col w-full h-full bg-black text-white" data-theme="dark">
      <Backbar />
      <div className="flex flex-col items-center justify-start gap-8 mt-12 p-4">
        <h1 className="text-4xl font-bold">{config.displayName}</h1>
        <p className="text-center">{config.description}</p>
        <div className="text-center">
          <p className="mb-4">
            Sats Factory POS ⚡️🏭 is powered by Alby and NWC. 🐝💜
          </p>
          <p>
            Based on the open-source Lightning POS by Alby
          </p>
        </div>
      </div>
    </div>
  );
}