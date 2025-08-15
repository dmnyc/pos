import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AlertModal } from '../components/Modals'
import { ExactBackButton } from '../components/ExactBackButton'
import { verifyPin } from '../utils/pinUtils'

// Standard class names for consistent styling
const buttonClasses = "w-full bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg transition-colors"
const secondaryButtonClasses = "w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
const pinInputClasses = "w-full p-3 text-center text-2xl tracking-widest bg-gray-700 border border-gray-600 rounded-lg text-white"

const Security = () => {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [isChangingPin, setIsChangingPin] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  const isStatusView = location.pathname === '/security/status'
  
  // Alert modal state
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  const showAlert = (title: string, message: string) => {
    setAlertState({ isOpen: true, title, message });
  };

  const handleAlertClose = () => {
    if (alertState.title.includes('Store Your PIN')) {
      navigate('/wallet/new');
    }
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };
  
  // Check if PIN already exists in localStorage on component mount
  React.useEffect(() => {
    const existingPin = localStorage.getItem('pos_pin')

    // If viewing status page but no PIN is set, redirect to setup
    if (isStatusView && !existingPin && !isChangingPin) {
      navigate('/security')
    }
    // If viewing setup page but PIN is already set and not changing PIN, redirect to status
    else if (!isStatusView && existingPin && !isChangingPin) {
      navigate('/security/status')
    }
  }, [navigate, isStatusView, isChangingPin])

  const handleSetPin = () => {
    if (pin !== confirmPin) {
      showAlert('PIN Mismatch', 'PINs do not match');
      return;
    }
    
    if (pin.length < 4) {
      showAlert('Invalid PIN', 'PIN must be at least 4 digits');
      return;
    }

    localStorage.setItem('pos_pin', pin);
    setIsChangingPin(false);
    showAlert('Important: Store Your PIN Safely', 'Please write down or securely store your PIN code. You cannot recover it if forgotten, and you will need to reset the entire POS application if you lose it.');
  }

  const handleBack = () => {
    navigate(-1)
  }

  const initiateChangePIN = async () => {
    const verified = await verifyPin();
    if (verified) {
      localStorage.removeItem('pos_pin');
      setPin('');
      setConfirmPin('');
      setIsChangingPin(true);
    }
  };

  return (
    <div className="h-full bg-black text-white">
      {isStatusView && !isChangingPin && <ExactBackButton onBack={handleBack} />}
      <div className="flex flex-grow flex-col overflow-auto pt-16">
        <div className="w-full max-w-xs md:max-w-md lg:max-w-lg mx-auto p-2 md:p-4">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4">Security Settings</h1>
          
          <div className="bg-gray-800 p-6 pb-4 rounded-lg">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">{isStatusView ? 'POS Security PIN' : 'Set security PIN to continue'}</h2>
              {(isStatusView && !isChangingPin && localStorage.getItem('pos_pin')) ? (
                <div>
                  <p className="text-green-400 font-medium mb-4">
                    Security PIN is currently set and active.
                  </p>
                  <p className="text-gray-400">
                    Your POS is protected by a PIN code. This PIN:
                  </p>
                  <ul className="list-disc ml-5 mt-2 mb-8 text-gray-400 space-y-1">
                    <li>Must be entered to access settings</li>
                    <li>Must be entered to log out</li>
                    <li>Cannot be recovered if forgotten</li>
                    <li>Can only be reset by reinstalling the POS</li>
                  </ul>
                  <div className="space-y-2">
                    <button
                      onClick={initiateChangePIN}
                      className={secondaryButtonClasses}
                    >
                      Change PIN
                    </button>
                    <button
                      onClick={() => navigate('/wallet/new')}
                      className={buttonClasses}
                    >
                      Return to POS
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-red-500 mb-4 font-bold">
                    Warning: This PIN cannot be recovered. If forgotten, you will need to reset the POS application completely.
                  </p>
                  <div className="space-y-4 max-w-[200px] mx-auto">
                    <div>
                      <label className="block mb-2 text-center">Enter PIN</label>
                      <input
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className={pinInputClasses}
                        placeholder="••••"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={8}
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-center">Confirm PIN</label>
                      <input
                        type="password"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value)}
                        className={pinInputClasses}
                        placeholder="••••"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={8}
                      />
                    </div>
                    <button
                      onClick={handleSetPin}
                      className={buttonClasses}
                    >
                      Set PIN
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={alertState.isOpen}
        onClose={handleAlertClose}
        title={alertState.title}
        message={alertState.message}
        buttonText={alertState.title.includes('Store Your PIN') ? 'Continue to POS' : 'OK'}
      />
    </div>
  )
}

export default Security