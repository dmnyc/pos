import { VersionLabel } from './utility/VersionLabel';

export function Footer() {
  return (
    <div className="mb-4 md:mb-6 lg:mb-8 flex flex-col w-full justify-center items-center text-gray-400 px-4 text-center">
      <span className="block text-sm md:text-base lg:text-lg">Sats Factory POS ⚡️🏭 is powered by Alby & NWC. 🐝💜</span>
      <VersionLabel className="mt-1" showPrefix={true} />
    </div>
  );
}