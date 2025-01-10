import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { SpriteColorizer } from '../utils/spriteColorizer';

interface PreviewCanvasProps {
  layers: {
    [key: string]: {
      style: string;
      color: string;
    };
  };
  darkMode?: boolean;
}

type Direction = 'forward' | 'left' | 'right' | 'back';

class SpritePreviewScene extends Phaser.Scene {
  private sprites: { [key: string]: { [direction in Direction]: Phaser.GameObjects.Sprite } } = {};
  private textures: { [key: string]: HTMLCanvasElement } = {};
  private layers: PreviewCanvasProps['layers'];
  private animationPrefix: { [key in Direction]: string } = {
    forward: 'walk-down',
    left: 'walk-left',
    right: 'walk-right',
    back: 'walk-up'
  };
  private darkMode: boolean;
  private currentStyles: { [key: string]: string } = {};
  setIsLoading: (isLoading: boolean) => void;

  constructor(layers: PreviewCanvasProps['layers'], darkMode: boolean) {
    super({ key: 'SpritePreviewScene' });
    this.layers = layers;
    this.darkMode = darkMode;
    this.currentStyles = Object.entries(layers).reduce((acc, [key, layer]) => {
      acc[key] = layer.style;
      return acc;
    }, {} as { [key: string]: string });
  }

  preload() {
    console.log('Starting to load assets...');
    
    const spritesheetConfig = {
      frameWidth: 48,
      frameHeight: 60
    };

    // Load base sprite synchronously like WalkingPreview
    this.load.spritesheet('BASE', new URL('../assets/BASE.png', import.meta.url).href, spritesheetConfig);

    // Load all layer variations synchronously
    Object.entries(this.layers).forEach(([layerName, layer]) => {
      if (layer.style !== 'None') {
        const assetPath = new URL(`../assets/${layerName}/${layer.style}.png`, import.meta.url).href;
        console.log(`Loading asset: ${assetPath}`);
        this.load.spritesheet(`${layerName}.${layer.style}`, assetPath, spritesheetConfig);
      }
    });

    // Add loading event listeners
    this.load.on('complete', () => {
      console.log('All assets loaded successfully');
      this.setIsLoading(false);
    });

    this.load.on('loaderror', (file: any) => {
      console.error('Error loading asset:', file.src);
    });
  }

  create() {
    const directions: Direction[] = ['forward', 'left', 'right', 'back'];
    const frameRates = { forward: 8, left: 8, right: 8, back: 8 };
    const positions = {
      forward: { x: 144, y: 120 },
      left: { x: 336, y: 120 },
      right: { x: 528, y: 120 },
      back: { x: 720, y: 120 }
    };
    
    // Define frame sequences for ping-pong style animation
    const frameSequences = {
      forward: [0, 1, 2, 1],
      left: [3, 4, 5, 4],
      right: [6, 7, 8, 7],
      back: [9, 10, 11, 10]
    };

    // Add single glassmorphism frame for all previews
    const frameStyle = {
      width: 720,
      height: 240,
      fillStyle: 0x814E33,
      fillAlpha: 0.2,
      strokeStyle: 0xF4860A,
      strokeAlpha: 0.3,
      radius: 20
    };

    // Larger blur background
    const blurBg = this.add.graphics();
    blurBg.fillStyle(frameStyle.fillStyle, frameStyle.fillAlpha * 0.4);
    blurBg.fillRoundedRect(
      432 - frameStyle.width/2 - 10, 
      120 - frameStyle.height/2 - 10,
      frameStyle.width + 20,
      frameStyle.height + 20,
      frameStyle.radius + 5
    );
    blurBg.lineStyle(2, frameStyle.strokeStyle, frameStyle.strokeAlpha * 0.4);
    blurBg.strokeRoundedRect(
      432 - frameStyle.width/2 - 10,
      120 - frameStyle.height/2 - 10,
      frameStyle.width + 20,
      frameStyle.height + 20,
      frameStyle.radius + 5
    );

    // Frame
    const frame = this.add.graphics();
    frame.fillStyle(frameStyle.fillStyle, frameStyle.fillAlpha);
    frame.fillRoundedRect(
      432 - frameStyle.width/2,
      120 - frameStyle.height/2,
      frameStyle.width,
      frameStyle.height,
      frameStyle.radius
    );
    frame.lineStyle(2, frameStyle.strokeStyle, frameStyle.strokeAlpha);
    frame.strokeRoundedRect(
      432 - frameStyle.width/2,
      120 - frameStyle.height/2,
      frameStyle.width,
      frameStyle.height,
      frameStyle.radius
    );

    // Add direction labels
    const labelStyle = {
      color: '#FCF5D8',
      fontSize: '16px',
      fontFamily: 'Arial'
    };

    this.add.text(144, 200, 'Forward', labelStyle).setOrigin(0.5);
    this.add.text(336, 200, 'Left', labelStyle).setOrigin(0.5);
    this.add.text(528, 200, 'Right', labelStyle).setOrigin(0.5);
    this.add.text(720, 200, 'Back', labelStyle).setOrigin(0.5);

    // Create base sprite for each direction
    const baseSprites: { [key in Direction]: Phaser.GameObjects.Sprite } = {};
    directions.forEach(direction => {
      const sprite = this.add.sprite(
        positions[direction].x,
        positions[direction].y,
        'BASE'
      );
      sprite.setScale(2.5);
      baseSprites[direction] = sprite;

      // Create animation for base sprite
      const animKey = `BASE-${this.animationPrefix[direction]}`;
      this.anims.create({
        key: animKey,
        frames: this.anims.generateFrameNumbers('BASE', {
          frames: frameSequences[direction]
        }),
        frameRate: frameRates[direction],
        repeat: -1
      });
      sprite.play(animKey);
    });
    this.sprites['BASE'] = baseSprites;

    // Create sprites for each layer
    Object.entries(this.layers).forEach(([layerName, layer]) => {
      if (layer.style !== 'None') {
        const spriteKey = `${layerName}.${layer.style}`;
        const layerSprites: { [key in Direction]: Phaser.GameObjects.Sprite } = {};

        // Create colorized texture first
        const colorizedKey = this.colorizeTexture(this.textures.get(spriteKey), layerName, layer.color);

        directions.forEach(direction => {
          const sprite = this.add.sprite(
            positions[direction].x,
            positions[direction].y,
            colorizedKey
          );
          sprite.setScale(2.5);
          layerSprites[direction] = sprite;

          // Create animation for layer sprite using colorized texture
          const animKey = `${colorizedKey}-${this.animationPrefix[direction]}`;
          this.anims.create({
            key: animKey,
            frames: this.anims.generateFrameNumbers(colorizedKey, {
              frames: frameSequences[direction]
            }),
            frameRate: frameRates[direction],
            repeat: -1
          });
          sprite.play(animKey);
        });

        this.sprites[layerName] = layerSprites;
      }
    });
  }

  private colorizeTexture(texture: Phaser.Textures.Texture, layerName: string, color: string) {
    const key = `${layerName}_${color}`;
    
    // Check if we already have this colorized texture
    if (this.textures.exists(key)) {
      return key;
    }

    // Create a temporary canvas to get image data
    const tempCanvas = document.createElement('canvas');
    const sourceImage = texture.getSourceImage();
    tempCanvas.width = sourceImage.width;
    tempCanvas.height = sourceImage.height;
    
    const ctx = tempCanvas.getContext('2d')!;
    ctx.drawImage(sourceImage, 0, 0);
    const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

    // Use the shared colorizer
    const colorizedData = SpriteColorizer.colorizeTexture(imageData, color, {
      preserveAlpha: true,
      cacheKey: `preview_${layerName}_${color}`
    });

    // Create a new canvas for the colorized texture
    const colorizedCanvas = document.createElement('canvas');
    colorizedCanvas.width = tempCanvas.width;
    colorizedCanvas.height = tempCanvas.height;
    const colorizedCtx = colorizedCanvas.getContext('2d')!;
    colorizedCtx.putImageData(colorizedData, 0, 0);

    // Add the colorized texture to Phaser's texture manager with spritesheet config
    this.textures.addSpriteSheet(key, colorizedCanvas, {
      frameWidth: 48,
      frameHeight: 60
    });

    return key;
  }

  updateSprites(newLayers: PreviewCanvasProps['layers']) {
    this.setIsLoading(true);
    
    // Check if we need to load any new assets
    const newAssetsToLoad: { key: string; path: string }[] = [];
    
    Object.entries(newLayers).forEach(([layerName, layer]) => {
      if (layer.style !== 'None' && layer.style !== this.currentStyles[layerName]) {
        const key = `${layerName}.${layer.style}`;
        if (!this.textures.exists(key)) {
          const assetPath = new URL(`../assets/${layerName}/${layer.style}.png`, import.meta.url).href;
          newAssetsToLoad.push({ key, path: assetPath });
        }
      }
    });

    // If we have new assets to load, load them before updating
    if (newAssetsToLoad.length > 0) {
      newAssetsToLoad.forEach(({ key, path }) => {
        this.load.spritesheet(key, path, {
          frameWidth: 48,
          frameHeight: 60
        });
      });

      this.load.once('complete', () => {
        this.layers = newLayers;
        this.currentStyles = Object.entries(newLayers).reduce((acc, [key, layer]) => {
          acc[key] = layer.style;
          return acc;
        }, {} as { [key: string]: string });
        this.scene.restart();
      });

      this.load.start();
    } else {
      // If no new assets needed, just update the layers and restart
      this.layers = newLayers;
      this.currentStyles = Object.entries(newLayers).reduce((acc, [key, layer]) => {
        acc[key] = layer.style;
        return acc;
      }, {} as { [key: string]: string });
      this.scene.restart();
    }
  }

  destroy() {
    Object.values(this.textures).forEach(canvas => {
      canvas.remove();
    });
    super.destroy();
  }
}

const PreviewCanvas: React.FC<PreviewCanvasProps> = ({ layers, darkMode = false }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<SpritePreviewScene | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 864,
        height: 240,
        parent: 'phaser-container',
        scene: class extends SpritePreviewScene {
          constructor() {
            super(layers, darkMode);
            this.setIsLoading = setIsLoading;
          }
        },
        transparent: true,
        pixelArt: true,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        },
        backgroundColor: 'rgba(0, 0, 0, 0)'
      };

      gameRef.current = new Phaser.Game(config);
      sceneRef.current = gameRef.current.scene.getScene('SpritePreviewScene') as SpritePreviewScene;
    } else if (sceneRef.current) {
      sceneRef.current.updateSprites(layers);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [layers, darkMode]);

  return (
    <div className="relative w-full flex-1 min-h-[240px] max-h-[240px] flex items-center justify-center overflow-hidden">
      <div id="phaser-container" className="w-full max-w-[864px] h-[240px] scale-[0.95]" />
      {isLoading && (
        <div className={`absolute inset-0 flex items-center justify-center bg-gray-800/75`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500" />
        </div>
      )}
    </div>
  );
};

export default PreviewCanvas;
