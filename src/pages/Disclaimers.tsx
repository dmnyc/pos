import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExactBackButton } from '../components/ExactBackButton';

export function Disclaimers() {
  const navigate = useNavigate();
  
  const handleBack = () => {
    const hasWallet = window.localStorage.getItem("pos:nwcUrl");
    if (hasWallet) {
      navigate("/wallet/new");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="h-full bg-black text-white">
      <ExactBackButton onBack={handleBack} />
      <div className="flex flex-grow flex-col overflow-auto pt-16">
        <div className="w-full max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
          <div className="prose prose-invert">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8">Disclaimers & Privacy Information</h1>
            
            <p className="text-gray-400 mb-8">Last Updated: August 14, 2025</p>
            
            <div className="mb-12">
              <p>Please read these disclaimers and privacy information carefully before using the Sats Factory POS application.</p>
            </div>

            <h2 className="text-xl md:text-2xl font-bold mb-6">I. Disclaimers</h2>
            
            <p>By using the Sats Factory POS application ("the software"), you acknowledge that you have read, understood, and agree to be bound by the terms outlined below. If you do not agree with these terms, do not use the software.</p>
            
            <h3 className="text-lg font-bold mt-8 mb-4">1. Use At Your Own Risk</h3>
            <p>Your use of the Sats Factory POS software is entirely <strong>AT YOUR OWN RISK</strong>. This software is an open-source project that uses Nostr Wallet Connect (NWC) technology. You are solely responsible for your actions and for any loss or damage that may arise from using this application.</p>
            
            <h3 className="text-lg font-bold mt-8 mb-4">2. Non-Custodial Software</h3>
            <p className="mb-4">
              Sats Factory POS is a <strong>100% non-custodial</strong> application. This means:
            </p>
            <ul className="list-disc pl-6 mb-6 mt-4">
              <li>We <strong>NEVER</strong> hold, custody, or control your funds</li>
              <li>The software is an interface that connects to your wallet via NWC</li>
              <li>You control whether to use read-only or payment-enabled wallet connections</li>
              <li>You are solely responsible for the security of your connected wallet and NWC connection string</li>
              <li>Your PIN code is stored only in your local device and cannot be recovered if lost</li>
            </ul>

            <h3 className="text-lg font-bold mt-8 mb-4">3. No Warranties or Guarantees</h3>
            <p>THE SOFTWARE IS PROVIDED <strong>"AS IS"</strong>, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT.</p>
            <p>We do not guarantee that the software will be secure, uninterrupted, or bug-free. The entire risk as to the quality and performance of the software is with you.</p>

            <h3 className="text-lg font-bold mt-8 mb-4">4. Limitation of Liability</h3>
            <p>IN NO EVENT SHALL THE DEVELOPERS, CONTRIBUTORS, OR COPYRIGHT HOLDERS OF SATS FACTORY POS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>
            <p>This includes any loss of funds, loss of profits, business interruption, or any other direct or indirect damages.</p>

            <h3 className="text-lg font-bold mt-8 mb-4">5. Education vs Financial Advice</h3>
            <p className="mb-4">
              Sats Factory POS is a software tool. While Sats Factory does provide professional bitcoin education and consultation services, including guidance on:
            </p>
            <ul className="list-disc pl-6 mb-6 mt-4">
              <li>Lightning node setup and management</li>
              <li>Wallet selection and configuration</li>
              <li>Bitcoin technical education</li>
              <li>Best practices for merchants</li>
            </ul>
            <p className="mb-4">
              The software itself and its documentation do not constitute:
            </p>
            <ul className="list-disc pl-6 mb-6 mt-4">
              <li>Financial advice</li>
              <li>Investment advice</li>
              <li>Tax advice</li>
              <li>Legal advice</li>
            </ul>
            <p>
              For matters related to your business's financial, tax, or legal situation, please consult with qualified professionals in these areas before making any decisions.
              For bitcoin education and technical consultation, you can reach out to us through{' '}
              <a href="https://satsfactory.com/hi" className="text-[#ffcc99] hover:text-[#ffbb77]">our contact form</a>.
            </p>

            <h3 className="text-lg font-bold mt-8 mb-4">6. Progressive Web App</h3>
            <p className="mb-4">Sats Factory POS is a Progressive Web App (PWA) that can be installed on your device. When installed:</p>
            <ul className="list-disc pl-6 mb-6 mt-4">
              <li>Your settings are stored locally on your device</li>
              <li>Your PIN is specific to that installation</li>
              <li>Reinstalling the PWA will reset all settings including your PIN</li>
            </ul>

            <h2 className="text-xl md:text-2xl font-bold mt-12 mb-6">II. Privacy Information</h2>
            
            <p className="mb-6">Effective Date: August 14, 2025</p>
            
            <h3 className="text-lg font-bold mt-8 mb-4">1. Introduction</h3>
            <p>This privacy information describes how Sats Factory POS handles information. We are committed to collecting only the minimum information necessary to provide the service.</p>
            
            <h3 className="text-lg font-bold mt-8 mb-4">2. Information We Do Not Collect</h3>
            <p className="mb-4">We do not collect or store:</p>
            <ul className="list-disc pl-6 mb-6 mt-4">
              <li>Personal Information</li>
              <li>Wallet private keys or seed phrases</li>
              <li>NWC connection strings</li>
              <li>Transaction history</li>
              <li>PIN codes</li>
              <li>Merchant settings</li>
            </ul>

            <h3 className="text-lg font-bold mt-8 mb-4">3. Local Storage</h3>
            <p className="mb-4">The following information is stored only on your local device:</p>
            <ul className="list-disc pl-6 mb-6 mt-4">
              <li>Your PIN code</li>
              <li>Merchant name and logo settings</li>
              <li>Theme preferences</li>
              <li>NWC connection string</li>
              <li>Currency preferences</li>
            </ul>

            <h3 className="text-lg font-bold mt-8 mb-4">4. Contact</h3>
            <p>
              For questions about these disclaimers or to report security concerns, please visit{' '}
              <a href="https://satsfactory.com/hi" className="text-[#ffcc99] hover:text-[#ffbb77]">
                https://satsfactory.com/hi
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Disclaimers;