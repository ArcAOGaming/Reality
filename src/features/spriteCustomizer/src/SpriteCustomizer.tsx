import { useState, useEffect } from 'react'
import ColorSlider from './components/ColorSlider'
import PreviewCanvas from './components/PreviewCanvas'
import ExportButton from './components/ExportButton'
import LayerSelector from './components/LayerSelector'
import WalkingPreview from './components/WalkingPreview'
import { SPRITE_CATEGORIES } from './constants/spriteAssets'
import ExportAndUploadButton from './services/testupload'
import { ArconnectSigner } from '@ardrive/turbo-sdk/web'
import logoPath from './assets/rune-realm-transparent.png'
import { checkWalletStatus, TokenOption, purchaseAccess } from './utils/aoHelpers'
import PurchaseModal from './components/PurchaseModal'
import Confetti from 'react-confetti';
import { TurboFactory } from '@ardrive/turbo-sdk/web';
import { AdminSkinChanger } from './constants/spriteAssets';
import { message, createDataItemSigner } from './config/aoConnection';
import { AdminBulkUnlock } from './components/AdminBulkUnlock';
import WarpTransition from './components/WarpTransition';
import AdminRemoveUser from './components/AdminRemoveUser';

interface LayerState {
  style: string;
  color: string;
}

interface Layers {
  [key: string]: LayerState;
}

interface SpriteCustomizerProps {
  wallet?: string;
  onEnter?: () => void;
}

const SpriteCustomizer: React.FC<SpriteCustomizerProps> = ({ wallet, onEnter }) => {
  const [layers, setLayers] = useState<Layers>({});
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [signer, setSigner] = useState<any>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentSkin, setCurrentSkin] = useState(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availableStyles, setAvailableStyles] = useState(SPRITE_CATEGORIES);
  const [contractIcon, setContractIcon] = useState<string | undefined>();
  const [contractName, setContractName] = useState<string | undefined>();
  const [showCelebration, setShowCelebration] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [showWarp, setShowWarp] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);

  const REQUIRED_PERMISSIONS = [
    'ACCESS_ADDRESS',
    'ACCESS_PUBLIC_KEY',
    'SIGN_TRANSACTION',
    'DISPATCH'
  ];

  // Theme constants
  const THEME_COLORS = {
    light: {
      bg: 'from-[#4A2C1E] via-[#814E33]/40 to-[#2A1912]',
      container: 'bg-[#814E33]/20',
      text: 'text-[#FCF5D8]',
      border: 'border-[#F4860A]/30',
      buttonBg: 'bg-[#814E33]/20',
      buttonHover: 'hover:bg-[#814E33]/40',
      gradient: 'from-[#FCF5D8] to-[#F4860A]',
      previewBg: 'bg-[#814E33]/20'
    },
    dark: {
      bg: 'from-[#0D0705] via-[#1A0F0A]/40 to-[#000000]',
      container: 'bg-[#1A0F0A]/30',
      text: 'text-[#FCF5D8]',
      border: 'border-[#F4860A]/20',
      buttonBg: 'bg-[#1A0F0A]/40',
      buttonHover: 'hover:bg-[#1A0F0A]/60',
      gradient: 'from-[#FCF5D8] to-[#F4860A]',
      previewBg: 'bg-[#1A0F0A]/40'
    }
  };

  const currentTheme = darkMode ? THEME_COLORS.dark : THEME_COLORS.light;

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        console.log('SpriteCustomizer: Checking existing wallet connection');
        setLoading(true);
        const browserSigner = await arweaveWallet();
        if (browserSigner) {
          console.log('SpriteCustomizer: Wallet connected');
          setSigner(browserSigner);
          const status = await checkWalletStatus();
          setIsUnlocked(status.isUnlocked);
          setContractIcon(status.contractIcon);
          setContractName(status.contractName);
          if (status.currentSkin) {
            console.log('SpriteCustomizer: Current skin found:', status.currentSkin);
            setCurrentSkin(status.currentSkin);
            // If we have a valid skin, enter immediately
            if (status.currentSkin !== "none") {
              setShowPreview(true);
              setShowCustomizer(true);
              if (onEnter) {
                setShowWarp(true);
              }
            }
          }
          setIsConnected(true);
        } else {
          console.log('SpriteCustomizer: No wallet connected');
        }
      } catch (error) {
        console.log('SpriteCustomizer: Connection error:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
    initializeLayers();
  }, []);

  useEffect(() => {
    if (wallet && !isConnected) {
      const initializeWithWallet = async () => {
        try {
          const addr = await wallet.getActiveAddress();
          if (addr) {
            setIsConnected(true);
            const browserSigner = new ArconnectSigner(wallet);
            setSigner(browserSigner);
            const status = await checkWalletStatus();
            setIsUnlocked(status.isUnlocked);
            setContractIcon(status.contractIcon);
            setContractName(status.contractName);
            if (status.currentSkin) {
              setCurrentSkin(status.currentSkin);
              if (status.currentSkin !== "none") {
                setShowPreview(true);
                setShowCustomizer(true);
                if (onEnter) {
                  setShowWarp(true);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error initializing with wallet:', error);
        }
      };

      initializeWithWallet();
    }
  }, [wallet, isConnected]);

  useEffect(() => {
    const checkConnection = async () => {
      if (window.arweaveWallet) {
        try {
          const addr = await window.arweaveWallet.getActiveAddress();
          if (addr) {
            setIsConnected(true);
            const browserSigner = new ArconnectSigner(window.arweaveWallet);
            setSigner(browserSigner);
            const status = await checkWalletStatus();
            setIsUnlocked(status.isUnlocked);
            if (status.currentSkin) {
              setCurrentSkin(status.currentSkin);
              if (status.currentSkin !== "none") {
                setShowPreview(true);
                setShowCustomizer(true);
                if (onEnter) {
                  setShowWarp(true);
                }
              }
            }
          }
        } catch (error) {
          console.log('Not connected:', error);
        }
      }
    };
    checkConnection();
  }, []);

  const initializeLayers = () => {
    const initialLayers: Layers = {};
    availableStyles.forEach(category => {
      initialLayers[category.name] = {
        style: 'None',
        color: '#ffffff'
      };
    });
    setLayers(initialLayers);
    setLoading(false);
  };

  const handleStyleChange = (layerName: string, style: string) => {
    setLayers(prev => ({
      ...prev,
      [layerName]: { ...prev[layerName], style }
    }));
  };

  const handleColorChange = (layerName: string, color: string) => {
    setLayers(prev => ({
      ...prev,
      [layerName]: { ...prev[layerName], color }
    }));
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleReset = () => {
    initializeLayers();
  };

  const connectWallet = async () => {
    try {
      if (!window.arweaveWallet) {
        throw new Error('Please install ArConnect extension');
      }
      await window.arweaveWallet.connect(REQUIRED_PERMISSIONS);
      const address = await window.arweaveWallet.getActiveAddress();
      const browserSigner = new ArconnectSigner(window.arweaveWallet);
      
      setSigner(browserSigner);
      setIsConnected(true);
      
      const status = await checkWalletStatus({ address });
      setIsUnlocked(status.isUnlocked);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError('Failed to connect wallet. Please try again.');
    }
  };

  const handleExport = () => {
    console.log('Exporting...');
  };

  const handlePurchase = async (selectedToken: TokenOption) => {
    console.log('SpriteCustomizer: Initiating purchase with token:', selectedToken);
    try {
      if (!window.arweaveWallet) {
        throw new Error('Please connect your Arweave wallet');
      }
      const success = await purchaseAccess(selectedToken);
      if (success) {
        setShowCelebration(true);
        
        // Close the modal quickly
        setTimeout(() => setIsPurchaseModalOpen(false), 2500);
        
        // Start checking status immediately and continue for a few seconds
        const checkInterval = setInterval(async () => {
          const status = await checkWalletStatus();
          console.log('Rechecking status:', status);
          if (status.isUnlocked) {
            setIsUnlocked(true);
            clearInterval(checkInterval);
          }
        }, 1000);

        // Clear interval after 10 seconds if it hasn't succeeded
        setTimeout(() => clearInterval(checkInterval), 10000);
        
        // Keep confetti for a bit longer
        setTimeout(() => setShowCelebration(false), 5000);
        console.log('SpriteCustomizer: Purchase and setup successful');
      } else {
        throw new Error('Purchase failed');
      }
    } catch (error) {
      console.error('SpriteCustomizer: Purchase error:', error);
      throw error;
    }
  };

  const getRandomColor = () => {
    // Generate a random hex color
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
  };

  const getRandomLayers = (availableStyles: typeof SPRITE_CATEGORIES) => {
    const newLayers: Layers = {};
    
    availableStyles.forEach(category => {
      // Get non-empty options (exclude 'None' if it exists)
      const validOptions = category.options.filter(option => option !== 'None');
      
      if (validOptions.length > 0) {
        // 70% chance to add a layer
        if (Math.random() < 0.7) {
          newLayers[category.name] = {
            style: validOptions[Math.floor(Math.random() * validOptions.length)],
            color: getRandomColor()
          };
        } else {
          // If not adding a layer, set it to 'None'
          newLayers[category.name] = {
            style: 'None',
            color: '#ffffff'
          };
        }
      }
    });
    
    return newLayers;
  };

  const handleRandomize = () => {
    setLayers(getRandomLayers(availableStyles));
  };

  useEffect(() => {
    // Initialize with random layers instead of empty ones
    const loadAssets = async () => {
      try {
        setLoading(true);
        // Wait for a small delay to ensure Phaser is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        setLayers(getRandomLayers(availableStyles));
      } catch (error) {
        console.error('Error loading initial layers:', error);
        setError('Failed to load initial layers');
      } finally {
        setLoading(false);
      }
    };
    
    loadAssets();
  }, [availableStyles]);

  const handleUnlockClick = () => {
    if (!signer) {
      connectWallet();
    } else if (!isUnlocked) {
      setIsPurchaseModalOpen(true);
    }
  };

  const handleWarpComplete = () => {
    if (onEnter) {
      onEnter();
    }
  };

  const handleSkipClick = () => {
    if (onEnter) {
      setShowWarp(true);
    }
  };

  const handleExportComplete = () => {
    if (onEnter) {
      setShowWarp(true);
    }
  };

  if (loading) return <div>Loading assets...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={`min-h-screen h-screen bg-gradient-to-br ${currentTheme.bg} p-2 sm:p-4 overflow-y-auto lg:overflow-hidden relative`}>
      {showCelebration && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.3}
            colors={['#F4860A', '#814E33', '#FCF5D8', '#FFD700', '#FFA500']}
          />
        </div>
      )}

      <div className={`h-[calc(100%-3rem)] w-full max-w-7xl mx-auto backdrop-blur-xl ${currentTheme.container} ${currentTheme.text} rounded-2xl shadow-2xl p-2 sm:p-4 border ${currentTheme.border} flex flex-col relative mb-12`}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 flex-shrink-0">
          <img src={logoPath} alt="Rune Realm Logo" className="h-16 sm:h-28 w-auto mx-4" />
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`py-2 px-4 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 
              ${currentTheme.buttonBg} ${currentTheme.buttonHover} ${currentTheme.text} 
              backdrop-blur-md shadow-lg hover:shadow-xl border ${currentTheme.border}`}
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col gap-6 p-6 overflow-y-auto">
            {/* Responsive grid that switches to column layout on mobile */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-[minmax(300px,450px)_1fr] gap-4 lg:gap-6 flex-grow min-h-0 overflow-hidden">
              {/* Left column - Clothing selectors */}
              <div className={`p-3 sm:p-4 rounded-xl ${currentTheme.container} border ${currentTheme.border} overflow-y-auto`}>
                <h2 className={`text-lg font-semibold ${currentTheme.text} mb-2`}>Clothing</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                  {Object.entries(layers).map(([layerName, layer]) => (
                    <div 
                      key={layerName} 
                      className={`p-2 sm:p-3 rounded-xl backdrop-blur-md transition-all duration-300 hover:shadow-lg w-full
                        ${currentTheme.container} border ${currentTheme.border}`}
                    >
                      <div className="space-y-2 w-full">
                        <LayerSelector
                          layerType={layerName}
                          currentStyle={layer.style}
                          availableStyles={availableStyles.find(category => category.name === layerName)?.options || []}
                          onStyleChange={(style) => handleStyleChange(layerName, style)}
                          darkMode={darkMode}
                        />
                        <ColorSlider
                          layerName={layerName}
                          color={layer.color}
                          onColorChange={(color) => handleColorChange(layerName, color)}
                          darkMode={darkMode}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right column - Previews */}
              <div className="space-y-4 overflow-y-auto">
                <div className={`p-3 sm:p-4 rounded-xl ${currentTheme.container} border ${currentTheme.border}`}>
                  <div className="flex justify-center">
                    <PreviewCanvas
                      layers={layers}
                    />
                  </div>
                </div>
                <div className={`p-3 sm:p-4 rounded-xl ${currentTheme.container} border ${currentTheme.border}`}>
                  <div className="flex justify-center">
                    <WalkingPreview layers={layers} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-4 flex-shrink-0">
          <button
            onClick={handleSkipClick}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 
              ${currentTheme.buttonBg} ${currentTheme.buttonHover} ${currentTheme.text} 
              backdrop-blur-md shadow-lg hover:shadow-xl border ${currentTheme.border}`}
          >
            No Thanks, Just Log Me In
          </button>
          <button
            onClick={handleReset}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 
              ${currentTheme.buttonBg} ${currentTheme.buttonHover} ${currentTheme.text} 
              backdrop-blur-md shadow-lg hover:shadow-xl border ${currentTheme.border}`}
          >
            Reset All Layers
          </button>
          <button
            onClick={handleRandomize}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 
              ${currentTheme.buttonBg} ${currentTheme.buttonHover} ${currentTheme.text} 
              backdrop-blur-md shadow-lg hover:shadow-xl border ${currentTheme.border}`}
          >
            Random Layers
          </button>
          <ExportAndUploadButton
            id="export-upload-button"
            layers={layers} 
            darkMode={darkMode} 
            mode="arweave"
            signer={signer}
            isUnlocked={isUnlocked}
            onUploadStatusChange={setUploadStatus}
            onError={setError}
            onConnect={connectWallet}
            onNeedUnlock={() => setIsPurchaseModalOpen(true)}
            onUploadComplete={handleExportComplete}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 
              ${currentTheme.buttonBg} ${currentTheme.buttonHover} ${currentTheme.text} 
              backdrop-blur-md shadow-lg hover:shadow-xl border ${currentTheme.border}`}
          />
        </div>

        {/* Admin Bulk Unlock Section - Commented out in production */}
          {/* <div className="mt-4">
            <AdminBulkUnlock isAdmin={isAdmin} />
            <AdminRemoveUser isAdmin={isAdmin} />
          </div> */}
          {/* <div className="mt-4">
            <AdminBulkUnlock isAdmin={true} />
            <AdminRemoveUser isAdmin={true} />
          </div> */}

        {/* Status Messages */}
      </div>

      {/* Footer with powered by logos */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center gap-4 py-2 px-3 bg-black/30 backdrop-blur-sm rounded-b-2xl">
        <div className="flex items-center gap-3">
          <span className="text-base text-white/70">Powered by</span>
          <a 
            href="https://ar.io" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="transition-transform hover:scale-105"
          >
            <img src={new URL('./assets/ARIO.png', import.meta.url).href} alt="ARIO.pn" className="h-12" />
          </a>
          <span className="text-base text-white/70">+</span>
          <a 
            href="https://ardrive.io/turbo" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="transition-transform hover:scale-105"
          >
            <img src={new URL('./assets/turbo.png', import.meta.url).href} alt="Turbo" className="h-12" />
          </a>
          <span className="text-base text-white/70">on</span>
          <a 
            href="https://game.ar.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="transition-transform hover:scale-105"
          >
            <img src={new URL('./assets/arcao.ico', import.meta.url).href} alt="arcao" className="h-12" />
          </a>
        </div>
      </div>

      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onPurchase={handlePurchase}
        contractIcon={contractIcon}
        contractName={contractName}
      />

      <WarpTransition show={onEnter ? showWarp : false} onComplete={handleWarpComplete} />
    </div>
  );
};

export default SpriteCustomizer;
