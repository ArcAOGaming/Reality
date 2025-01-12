import { useState, useEffect } from 'react'
import PreviewCanvas from './components/PreviewCanvas'
import ExportButton from './components/ExportButton'
import LayerSelector from './components/LayerSelector'
import ExportAndUploadButton from './services/testupload'
import WalkingPreview from './components/WalkingPreview'
import FourDirectionView from './components/FourDirectionView'
import WarpTransition from './components/WarpTransition'
import PurchaseModal from './components/PurchaseModal'
import { currentTheme } from './constants/theme'
import { SPRITE_CATEGORIES } from './constants/spriteAssets'
import { ArconnectSigner } from '@ardrive/turbo-sdk/web'
import logoPath from './assets/rune-realm-transparent.png'
import { checkWalletStatus, TokenOption, purchaseAccess } from './utils/aoHelpers'
import Confetti from 'react-confetti'
import { TurboFactory } from '@ardrive/turbo-sdk/web'
import { AdminSkinChanger } from './constants/spriteAssets'
import { AdminBulkImport } from './components/AdminBulkImport'
import { AdminBulkUnlock } from './components/AdminBulkUnlock'
import AdminRemoveUser from './components/AdminRemoveUser'
import TestButton from './components/TestButton'
import CacheDebugger from './components/CacheDebugger'
import { Link, useNavigate } from 'react-router-dom'
// Uncomment when deploying in Reality, comment out SimpleHeader import
// import Header from './components/Header'
// Comment out when deploying in Reality
import SimpleHeader from './components/SimpleHeader'

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
    'SIGNATURE',
    'DISPATCH'
  ];

  const theme = currentTheme(darkMode);

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
        if (window.arweaveWallet) {
          const address = await window.arweaveWallet.getActiveAddress();
          if (address) {
            setSigner(new ArconnectSigner(address));
            setIsConnected(true);
          }
        }
      } catch (error) {
        console.error("Connection error:", error);
      }
    };

    init();
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
<<<<<<< HEAD
          const addr = await wallet.getActiveAddress();
          if (addr) {
            setIsConnected(true);
            const browserSigner = new ArconnectSigner(wallet);
            setSigner(browserSigner);
            const status = await checkWalletStatus();
=======
          // Create ArConnect signer instance without requesting connection
          const browserSigner = new ArconnectSigner(window.arweaveWallet);
          console.log('Created browser signer for wallet');
          
          setSigner(browserSigner);
          setIsConnected(true);
          
          // Check unlock status with the provided wallet
          const status = await checkWalletStatus({ address: wallet });
          console.log('Initial wallet status:', status);
          if (!status.error) {
>>>>>>> main
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

<<<<<<< HEAD
=======
  const handleUpload = async () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = 576; // 12 frames * 48 pixels
      canvas.height = 60; // Single row height

      // Draw base image
      console.log('Drawing base image...');
      const baseImg = new Image();
      baseImg.crossOrigin = "anonymous";  
      const basePath = new URL('./assets/BASE.png', import.meta.url).href;
      console.log('Loading base image from:', basePath);
      baseImg.src = basePath;
      
      await new Promise((resolve, reject) => {
        baseImg.onload = resolve;
        baseImg.onerror = (e) => {
          console.error('Error loading base image:', e);
          reject(new Error('Failed to load base image'));
        };
      });
      
      ctx.drawImage(baseImg, 0, 0, baseImg.width, 60, 0, 0, 576, 60);

      // Process each layer
      for (const [layerName, layerData] of Object.entries(layers)) {
        if (layerData.style === 'None') continue;  
        
        console.log(`Processing layer ${layerName}...`);
        const img = new Image();
        img.crossOrigin = "anonymous";  
        const layerPath = new URL(`./assets/${layerName}/${layerData.style}.png`, import.meta.url).href;
        console.log('Loading layer image from:', layerPath);
        img.src = layerPath;
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = (e) => {
            console.error(`Error loading ${layerName} image:`, e);
            reject(new Error(`Failed to load ${layerName} image`));
          };
        });

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 576;  
        tempCanvas.height = 60;  
        const tempCtx = tempCanvas.getContext('2d')!;

        try {
          // Draw only the first row, scaling to target size
          tempCtx.drawImage(img, 
            0, 0,           // Source x, y
            img.width, 60,  // Source width, height (only first row)
            0, 0,           // Destination x, y
            576, 60         // Destination width, height (fixed size)
          );
          
          const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          
          // Colorize the layer
          const r = parseInt(layerData.color.slice(1, 3), 16);
          const g = parseInt(layerData.color.slice(3, 5), 16);
          const b = parseInt(layerData.color.slice(5, 7), 16);

          for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i + 3] > 0) {
              const luminance = (imageData.data[i] * 0.299 +
                imageData.data[i + 1] * 0.587 +
                imageData.data[i + 2] * 0.114) / 255;

              imageData.data[i] = r * luminance;
              imageData.data[i + 1] = g * luminance;
              imageData.data[i + 2] = b * luminance;
            }
          }

          tempCtx.putImageData(imageData, 0, 0);
          ctx.drawImage(tempCanvas, 0, 0);
        } catch (e) {
          console.error(`Error processing ${layerName}:`, e);
          throw new Error(`Failed to process ${layerName} layer`);
        }
      }
      
      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png');
      });

      console.log('Created sprite blob, size:', blob.size);

      // Upload to Arweave
      console.log('Initializing TurboClient...');
      const turboClient = TurboFactory.authenticated({ signer });
      
      console.log('Starting file upload...');
      const { id } = await turboClient.uploadFile({
        fileStreamFactory: () => blob.stream(),
        fileSizeFactory: () => blob.size,
        dataItemOpts: {
          tags: [
            {
              name: "Content-Type",
              value: "image/png",
            },
          ],
        },
      });
      console.log('Upload successful! TxId:', id);

      // Send message to update sprite handler
      console.log('Sending sprite update message...');
      await message({
        process: AdminSkinChanger,
        tags: [
          { name: "Action", value: "UpdateSprite" },
          { name: "TxId", value: id }
        ],
        signer: createDataItemSigner(window.arweaveWallet),
        data: ""
      });
      console.log('Sprite update message sent successfully');

      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
      
      return id;
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

>>>>>>> main
  const getRandomColor = () => {
    // Generate a random hex color
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
  };

  const getRandomLayers = (availableStyles: any) => {
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
<<<<<<< HEAD
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Main container with gradient background */}
      <div className={`h-screen flex flex-col ${theme.bg}`}>
        {/* Uncomment when deploying in Reality, comment out SimpleHeader */}
        {/* <Header
          theme={theme}
          darkMode={darkMode}
          showBackButton={!onEnter}
          onDarkModeToggle={handleDarkModeToggle}
        /> */}
        {/* Comment out when deploying in Reality */}
        <SimpleHeader 
          theme={theme}
          darkMode={darkMode}
          onDarkModeToggle={handleDarkModeToggle}
        />
        {/* Main content area */}
        <div className={`flex-1 w-full ${theme.container} ${theme.text} shadow-2xl ${theme.border} flex flex-col overflow-hidden`}>
          {/* Content area */}
          <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 h-full overflow-hidden">
            {/* Left column - Controls */}
            <div className="w-full lg:w-1/3 p-2 overflow-y-auto">
              {/* Layer Selection */}
              <div className={`p-2 rounded-xl ${theme.container} border ${theme.border}`}>
                <h2 className="text-lg font-bold mb-2">Layer Selection</h2>
                <LayerSelector
                  layers={layers}
                  availableStyles={availableStyles}
                  onStyleChange={handleStyleChange}
                  onColorChange={handleColorChange}
                />
=======
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

      <div className={`h-[calc(100%-3rem)] w-full max-w-7xl mx-auto backdrop-blur-xl ${currentTheme.container} ${currentTheme.text} rounded-2xl shadow-2xl border ${currentTheme.border} flex flex-col relative mb-12`}>
        {/* Header */}
        <div className="relative h-48">
          {/* Theme toggle button - positioned absolute in top left */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`absolute top-4 left-4 p-3 text-2xl rounded-lg transition-colors ${currentTheme.buttonBg} ${currentTheme.buttonHover}`}
          >
            {darkMode ? '🌞' : '🌙'}
          </button>
          
          {/* Centered logo */}
          <div className="w-full h-full flex justify-center items-center">
            <img
              src={logoPath}
              alt="Rune Realm"
              style={{ height: '200px', maxWidth: 'none' }}
              className="w-auto object-contain"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center w-full mx-auto px-2 sm:px-4 flex-grow min-h-0">
          <h1 className={`text-3xl sm:text-4xl font-bold mb-2 flex-shrink-0 ${currentTheme.text}`}>Character Design</h1>
          
          {/* Responsive grid that switches to column layout on mobile */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-[minmax(300px,450px)_1fr] gap-4 lg:gap-6 flex-grow min-h-0 overflow-hidden">
            {/* Left column - Clothing selectors */}
            <div className={`p-3 sm:p-4 rounded-xl ${currentTheme.container} border ${currentTheme.border} overflow-y-auto`}>
              <h2 className={`text-lg font-semibold ${currentTheme.text} mb-2 sticky top-0 bg-inherit z-10`}>Clothing</h2>
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
>>>>>>> main
              </div>
            </div>

            {/* Right column - Preview */}
            <div className="w-full lg:w-2/3 p-2 flex flex-col gap-4 overflow-y-auto">
              {/* Four Direction Preview */}
              <div className={`flex-1 p-4 rounded-xl ${theme.container} border ${theme.border}`}>
                <h2 className="text-lg font-bold mb-2">Character Preview</h2>
                <div className="h-[45%] flex items-center justify-center">
                  <FourDirectionView
                    layers={layers}
                    darkMode={darkMode}
                  />
                </div>
                <div className="h-[45%] flex items-center justify-center">
                  <WalkingPreview
                    layers={layers}
                    darkMode={darkMode}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className={`flex gap-3 p-4 flex-shrink-0 ${theme.container} border-t ${theme.border}`}>
            <button
              onClick={handleSkipClick}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 
                ${theme.buttonBg} ${theme.buttonHover} ${theme.text} 
                backdrop-blur-md shadow-lg hover:shadow-xl border ${theme.border}`}
            >
              No Thanks, Just Log Me In
            </button>
            <button
              onClick={handleReset}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 
                ${theme.buttonBg} ${theme.buttonHover} ${theme.text} 
                backdrop-blur-md shadow-lg hover:shadow-xl border ${theme.border}`}
            >
              Reset All Layers
            </button>
            <button
              onClick={handleRandomize}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 
                ${theme.buttonBg} ${theme.buttonHover} ${theme.text} 
                backdrop-blur-md shadow-lg hover:shadow-xl border ${theme.border}`}
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
                ${theme.buttonBg} ${theme.buttonHover} ${theme.text} 
                backdrop-blur-md shadow-lg hover:shadow-xl border ${theme.border}`}
            />
          </div>

          {/* Footer */}
          <div className={`flex justify-center items-center gap-2 py-1.5 px-3 ${theme.container} backdrop-blur-sm rounded-b-2xl border-t ${theme.border} flex-shrink-0`}>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/70">Powered by</span>
              <a 
                href="https://ar.io" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="transition-transform hover:scale-105"
              >
                <img 
                  src={new URL(`./assets/ARIO-${darkMode ? 'Dark' : 'Light'}.png`, import.meta.url).href} 
                  alt="ARIO.pn" 
                  className="h-10" 
                />
              </a>
              <span className="text-sm text-white/70">+</span>
              <a 
                href="https://ardrive.io/turbo" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="transition-transform hover:scale-105"
              >
                <img 
                  src={new URL(`./assets/Turbo-${darkMode ? 'Dark' : 'Light'}.png`, import.meta.url).href} 
                  alt="Turbo" 
                  className="h-10" 
                />
              </a>
              <span className="text-sm text-white/70">on</span>
              <a 
                href="https://game.ar.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-transform hover:scale-105"
              >
                <img src={new URL('./assets/arcao.ico', import.meta.url).href} alt="arcao" className="h-10" />
              </a>
            </div>
          </div>
        </div>

<<<<<<< HEAD
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
=======
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
            layers={layers}
            darkMode={darkMode}
            signer={signer}
            wallet={wallet}
            isUnlocked={isUnlocked}
            onUploadClick={handleUpload}
            onNeedUnlock={() => setIsPurchaseModalOpen(true)}
            onConnect={connectWallet}
            onUploadComplete={() => {
              setUploadStatus('Upload complete!');
              if (onEnter) onEnter();
            }}
            onUploadStatusChange={setUploadStatus}
            onError={setError}
          />
        </div>
>>>>>>> main

        <PurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          onPurchase={handlePurchase}
          contractIcon={contractIcon}
          contractName={contractName}
        />

        <WarpTransition show={onEnter ? showWarp : false} onComplete={handleWarpComplete} />
      </div>
<<<<<<< HEAD
=======

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
          <span className="text-base text-white/70 font-semibold">ON</span>
          <a 
            href="https://game.ar.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="transition-transform hover:scale-105"
          >
            <div className="bg-white rounded-full p-1 flex items-center justify-center w-[44px] h-[44px]">
              <img src={new URL('./assets/arcao.ico', import.meta.url).href} alt="arcao" className="h-11 w-11" />
            </div>
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

      <WarpTransition show={showWarp} onComplete={handleWarpComplete} />
>>>>>>> main
    </div>
  );
};

export default SpriteCustomizer;
