import React, { useEffect, useRef, useState } from 'react';
import { Sword } from 'lucide-react';

type ParticlePoint = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type Point = {
  x: number;
  y: number;
};

type PlanetType = [
  baseColor: string,
  highlightColor: string,
  name: string,
  atmosphereColor: string,
  glowColor: string,
  accentColor: string,
  shadowColor: string,
  hasRings: boolean
];

type GameObject = {
  id: number;
  position: Point;
  velocity: Point;
  radius: number;
  color: string;
  sliced: boolean;
  rotation: number;
  type: 'fruit' | 'bomb';
  direction: 'left' | 'right' | 'up' | 'down' | null;
  gradient?: CanvasGradient;
  particles?: ParticlePoint[];
  atmosphereColor?: string;
  highlightColor: string;
  hasRings?: boolean;
  glowColor?: string;
  shadowColor?: string;
};

type Slice = {
  points: Point[];
  timeLeft: number;
};

type BackgroundObject = {
  x: number;
  y: number;
  speed: number;
  type: 'spaceship' | 'dragon' | 'star';
  scale: number;
  rotation: number;
  color?: string;
};

type Firework = {
  x: number;
  y: number;
  particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    alpha: number;
  }>;
  timeLeft: number;
};

type AmbientEffect = {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  color: string;
  type: 'sparkle' | 'floatingOrb' | 'trail';
};

// More vibrant and interesting colors
const COLORS = [
  ['#FF6B6B', '#FF8787'], // Red
  ['#4ECDC4', '#7EE6DF'], // Turquoise
  ['#45B7D1', '#72D5EC'], // Blue
  ['#96CEB4', '#B5E0D1'], // Green
  ['#FFEEAD', '#FFF3CC'], // Yellow
  ['#D4A4EB', '#E5C6F5']  // Purple
];

const SLICE_LIFETIME = 10;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PARTICLE_COUNT = 15;
const POINTS_PER_LEVEL = 100;
const BASE_SPEED = 4;
const SPEED_INCREASE_PER_LEVEL = 1.15;

// Add level-based color schemes
const LEVEL_THEMES = [
  {
    background: ['#1a1c2c', '#2a2f4c', '#3b4171'], // Default space theme
    nebula: ['rgba(123, 97, 255, 0.1)', 'rgba(71, 148, 255, 0.05)'],
    clouds: [
      'rgba(255, 123, 234, 0.03)',
      'rgba(123, 234, 255, 0.03)',
      'rgba(234, 255, 123, 0.03)'
    ]
  },
  {
    background: ['#2D0A31', '#5C1138', '#8B1E3F'], // Deep red nebula
    nebula: ['rgba(255, 97, 97, 0.1)', 'rgba(255, 148, 148, 0.05)'],
    clouds: [
      'rgba(255, 123, 123, 0.03)',
      'rgba(255, 234, 123, 0.03)',
      'rgba(255, 123, 234, 0.03)'
    ]
  },
  {
    background: ['#0A312D', '#115C56', '#1E8B84'], // Cyan abyss
    nebula: ['rgba(97, 255, 247, 0.1)', 'rgba(148, 255, 251, 0.05)'],
    clouds: [
      'rgba(123, 255, 234, 0.03)',
      'rgba(123, 234, 255, 0.03)',
      'rgba(234, 255, 123, 0.03)'
    ]
  },
  {
    background: ['#31240A', '#5C4811', '#8B6B1E'], // Golden cosmos
    nebula: ['rgba(255, 215, 97, 0.1)', 'rgba(255, 233, 148, 0.05)'],
    clouds: [
      'rgba(255, 234, 123, 0.03)',
      'rgba(255, 123, 123, 0.03)',
      'rgba(234, 123, 255, 0.03)'
    ]
  },
  {
    background: ['#240A31', '#48115C', '#6B1E8B'], // Purple vortex
    nebula: ['rgba(215, 97, 255, 0.1)', 'rgba(233, 148, 255, 0.05)'],
    clouds: [
      'rgba(234, 123, 255, 0.03)',
      'rgba(123, 234, 255, 0.03)',
      'rgba(255, 123, 234, 0.03)'
    ]
  }
];

// Planet colors and details
const PLANETS: PlanetType[] = [
  // Fiery Mars with volcanic surface
  ['#FF3D00', '#FF6B6B', 'Mars', '#FFE5E5', '#FF9E9E', '#FF4444', '#8B0000', true],
  // Icy Neptune with crystalline surface
  ['#00FFFF', '#00BFFF', 'Neptune', '#E0FFFF', '#87CEEB', '#00CED1', '#104E8B', true],
  // Majestic Saturn with detailed rings
  ['#FFD700', '#FFA500', 'Saturn', '#FFF8DC', '#DAA520', '#FFB700', '#8B6508', true],
  // Storm Jupiter with swirling clouds
  ['#9400D3', '#8A2BE2', 'Jupiter', '#E6E6FA', '#9370DB', '#9932CC', '#551A8B', true],
  // Living Earth with oceans and continents
  ['#32CD32', '#00FF00', 'Earth', '#98FB98', '#90EE90', '#3CB371', '#006400', true],
  // Mysterious Venus with dense atmosphere
  ['#FF1493', '#FF69B4', 'Venus', '#FFC0CB', '#FFB6C1', '#FF82AB', '#8B0A50', true],
  // Mercury with crater-filled surface
  ['#FF4500', '#FF6347', 'Mercury', '#FFE4E1', '#FA8072', '#FF7F50', '#8B3626', true],
  // Uranus with ethereal glow
  ['#4169E1', '#0000FF', 'Uranus', '#E6E6FA', '#87CEEB', '#1E90FF', '#27408B', true]
];

// Helper function to calculate game parameters based on level
const getGameParameters = (level: number) => {
  // Very gradual speed increase for first two levels
  const speedMultiplier = level <= 2
    ? 1 + (level - 1) * 0.1  // Only 10% increase for first two levels
    : level <= 5
    ? 1.2 + (level - 2) * 0.15  // 15% increase for levels 3-5
    : 1.8 + (level - 5) * 0.2;  // 20% increase for higher levels

  // Slower spawn rate for early levels
  const spawnInterval = Math.max(
    level <= 2
      ? 1500 - (level - 1) * 100  // Very slow for first two levels
      : level <= 5
      ? 1300 - (level - 2) * 150  // Gradual decrease for levels 3-5
      : 800 - (level - 5) * 50,   // Faster for higher levels
    400  // Minimum spawn interval
  );

  // Consistent bomb chance across all levels with slight increase
  const bombChance = Math.min(0.15 + (level - 1) * 0.02, 0.35); // Start at 15%, max 35%

  return {
    speed: BASE_SPEED * speedMultiplier,
    spawnInterval,
    bombChance
  };
};

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameObjectsRef = useRef<GameObject[]>([]);
  const slicesRef = useRef<Slice[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [missedFruits, setMissedFruits] = useState(0);
  const requestRef = useRef<number>();
  const backgroundRef = useRef<CanvasGradient | null>(null);
  const congratsSoundRef = useRef<HTMLAudioElement | null>(null);
  const [showTitle, setShowTitle] = useState(true);
  const backgroundObjectsRef = useRef<BackgroundObject[]>([]);
  const introSoundRef = useRef<HTMLAudioElement | null>(null);
  const [fireworks, setFireworks] = useState<Firework[]>([]);
  const sadSoundRef = useRef<HTMLAudioElement | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const bombSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        congratsSoundRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
        introSoundRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
        sadSoundRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/132/132-preview.mp3');
        bombSoundRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/146/146-preview.mp3');
        
        // Create and configure background music
        const bgMusic = new Audio('./1.mp3');
        bgMusic.volume = 0.3;
        bgMusic.loop = true;
        bgMusicRef.current = bgMusic;

        // Set volume levels for other sounds
        if (congratsSoundRef.current) congratsSoundRef.current.volume = 0.6;
        if (introSoundRef.current) introSoundRef.current.volume = 0.6;
        if (sadSoundRef.current) sadSoundRef.current.volume = 0.6;
        if (bombSoundRef.current) bombSoundRef.current.volume = 0.5;
        
        // Add event listeners for debugging
        bgMusic.addEventListener('play', () => {
          console.log('Background music started playing');
        });
        
        bgMusic.addEventListener('error', (e) => {
          console.error('Background music error:', e);
        });

        // Try to play the background music
        try {
          await bgMusic.play();
        } catch (error) {
          console.error('Failed to play background music:', error);
          // Try playing on user interaction
          const playOnInteraction = async () => {
            try {
              await bgMusic.play();
              document.removeEventListener('click', playOnInteraction);
            } catch (e) {
              console.error('Failed to play music on click:', e);
            }
          };
          document.addEventListener('click', playOnInteraction);
        }
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };

    initializeAudio();

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.currentTime = 0;
      }
    };
  }, []);

  // Handle background music when game starts
  useEffect(() => {
    if (gameStarted && bgMusicRef.current) {
      bgMusicRef.current.pause();
      bgMusicRef.current.currentTime = 0;
    }
  }, [gameStarted]);

  // Show title sequence
  useEffect(() => {
    if (showTitle) {
      if (introSoundRef.current) {
        introSoundRef.current.currentTime = 0;
        introSoundRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
      setTimeout(() => setShowTitle(false), 3000);
    }
  }, [showTitle]);

  // Initialize background objects
  useEffect(() => {
    const createBackgroundObject = (type: 'spaceship' | 'dragon' | 'star'): BackgroundObject => ({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * CANVAS_HEIGHT * 0.7,
      speed: 0.5 + Math.random() * 1,
      type,
      scale: type === 'star' ? 0.5 : 1 + Math.random() * 0.5,
      rotation: Math.random() * Math.PI * 2,
      color: type === 'dragon' ? `hsl(${Math.random() * 60 + 300}, 70%, 60%)` : undefined
    });

    backgroundObjectsRef.current = [
      ...Array(4).fill(null).map(() => createBackgroundObject('spaceship')),
      ...Array(3).fill(null).map(() => createBackgroundObject('dragon')),
      ...Array(30).fill(null).map(() => createBackgroundObject('star'))
    ];
  }, []);

  // Draw background elements with level-based themes
  const drawBackgroundObjects = (ctx: CanvasRenderingContext2D) => {
    const themeIndex = (level - 1) % LEVEL_THEMES.length;
    const currentTheme = LEVEL_THEMES[themeIndex];
    
    // Add nebula effect with current theme
    const nebulaGradient = ctx.createRadialGradient(
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 0,
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH / 1.5
    );
    nebulaGradient.addColorStop(0, currentTheme.nebula[0]);
    nebulaGradient.addColorStop(0.5, currentTheme.nebula[1]);
    nebulaGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = nebulaGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Add multiple nebula clouds with theme colors
    const time = Date.now() * 0.001;
    currentTheme.clouds.forEach((color, index) => {
      const offset = (Math.PI * 2 * index) / currentTheme.clouds.length;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + time + offset;
        const x = CANVAS_WIDTH / 2 + Math.cos(angle) * (300 + Math.sin(time + index) * 50);
        const y = CANVAS_HEIGHT / 2 + Math.sin(angle) * (200 + Math.cos(time + index) * 30);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.quadraticCurveTo(x, y, x + 100, y + 100);
      }
      ctx.fillStyle = color;
      ctx.fill();
    });

    // Add level-specific particle effects
    const particleCount = 20 + (level % 5) * 10; // More particles at higher levels
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.sin(time * 0.5 + i) * 0.5 + 0.5) * CANVAS_WIDTH;
      const y = (Math.cos(time * 0.3 + i) * 0.5 + 0.5) * CANVAS_HEIGHT;
      const size = 1 + Math.sin(time + i) * 0.5;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(time + i) * 0.2})`;
      ctx.fill();
    }

    // Add dynamic energy waves based on level
    const waveCount = 3 + (level % 3);
    for (let i = 0; i < waveCount; i++) {
      const radius = (200 + Math.sin(time + i) * 50) * (1 + i * 0.5);
      ctx.beginPath();
      ctx.arc(
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2,
        radius,
        0,
        Math.PI * 2
      );
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 - i * 0.02})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw background objects with updated animations
    backgroundObjectsRef.current = backgroundObjectsRef.current.map(obj => {
      ctx.save();
      ctx.translate(obj.x, obj.y);
      ctx.rotate(obj.rotation);
      ctx.scale(obj.scale, obj.scale);

      switch (obj.type) {
        case 'dragon':
          // Enhanced dragon with level-based colors
          const dragonHue = (level * 60) % 360;
          ctx.shadowColor = `hsl(${dragonHue}, 70%, 60%)`;
          ctx.shadowBlur = 15 + Math.sin(time * 2) * 5;
          ctx.fillStyle = `hsl(${dragonHue}, 70%, 60%)`;
          
          // Dragon body with more details
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(15, -8, 30, 0);
          ctx.quadraticCurveTo(15, 8, 0, 0);
          
          // Dragon wings with animation
          const wingOffset = Math.sin(Date.now() * 0.005) * 5;
          ctx.moveTo(12, 0);
          ctx.quadraticCurveTo(18, -15 - wingOffset, 24, -12);
          ctx.quadraticCurveTo(18, -9, 12, 0);
          ctx.moveTo(12, 0);
          ctx.quadraticCurveTo(18, 15 + wingOffset, 24, 12);
          ctx.quadraticCurveTo(18, 9, 12, 0);
          ctx.fill();

          // Animated dragon fire
          const fireLength = 20 + Math.sin(Date.now() * 0.01) * 10;
          const fireGradient = ctx.createLinearGradient(30, 0, 30 + fireLength, 0);
          fireGradient.addColorStop(0, '#ff4444');
          fireGradient.addColorStop(0.5, '#ffaa00');
          fireGradient.addColorStop(1, 'rgba(255, 170, 0, 0)');
          ctx.fillStyle = fireGradient;
          
          // Animated flame shape
          ctx.beginPath();
          for (let i = 0; i < 10; i++) {
            const flameX = 30 + i * (fireLength / 10);
            const flameY = Math.sin(Date.now() * 0.01 + i) * 3;
            if (i === 0) ctx.moveTo(flameX, flameY);
            else ctx.lineTo(flameX, flameY);
          }
          for (let i = 9; i >= 0; i--) {
            const flameX = 30 + i * (fireLength / 10);
            const flameY = -Math.sin(Date.now() * 0.01 + i) * 3;
            ctx.lineTo(flameX, flameY);
          }
          ctx.fill();
          break;

        case 'spaceship':
          // Enhanced spaceship with level-based effects
          const shipHue = ((level * 90) + 180) % 360;
          ctx.shadowColor = `hsl(${shipHue}, 70%, 60%)`;
          ctx.shadowBlur = 15 + Math.cos(time * 3) * 5;
          
          // Energy shield effect
          const shieldSize = 25 + Math.sin(Date.now() * 0.003) * 5;
          const shieldGradient = ctx.createRadialGradient(0, 0, shieldSize - 10, 0, 0, shieldSize);
          shieldGradient.addColorStop(0, 'rgba(139, 92, 246, 0)');
          shieldGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.1)');
          shieldGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
          ctx.fillStyle = shieldGradient;
          ctx.beginPath();
          ctx.arc(0, 0, shieldSize, 0, Math.PI * 2);
          ctx.fill();

          // Main ship body
          ctx.fillStyle = `hsl(${shipHue}, 70%, 60%)`;
          ctx.beginPath();
          ctx.moveTo(-15, 10);
          ctx.lineTo(15, 10);
          ctx.lineTo(0, -15);
          ctx.closePath();
          ctx.fill();

          // Animated engine glow
          const engineGlow = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
          const engineGradient = ctx.createRadialGradient(0, 8, 0, 0, 8, 8);
          engineGradient.addColorStop(0, `rgba(255, 255, 255, ${engineGlow})`);
          engineGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
          ctx.fillStyle = engineGradient;
          ctx.beginPath();
          ctx.arc(0, 8, 8, 0, Math.PI * 2);
          ctx.fill();

          // Energy trails
          const trailLength = 20 + Math.sin(Date.now() * 0.005) * 10;
          const trailGradient = ctx.createLinearGradient(0, 10, 0, 10 + trailLength);
          trailGradient.addColorStop(0, 'rgba(139, 92, 246, 0.5)');
          trailGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
          ctx.fillStyle = trailGradient;
          
          [-10, 0, 10].forEach(x => {
            ctx.beginPath();
            ctx.moveTo(x, 10);
            ctx.lineTo(x - 2, 10 + trailLength);
            ctx.lineTo(x + 2, 10 + trailLength);
            ctx.closePath();
            ctx.fill();
          });
          break;

        case 'star':
          // Enhanced star with level-based pulsing
          const starPulse = Math.sin(time * (2 + level * 0.5) + obj.x * 0.1) * 0.3 + 0.7;
          const starSize = 1 + Math.random() * 1.5;
          
          // Outer glow
          const starGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, starSize * 4);
          starGlow.addColorStop(0, `rgba(255, 255, 255, ${0.3 * starPulse})`);
          starGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = starGlow;
          ctx.beginPath();
          ctx.arc(0, 0, starSize * 4, 0, Math.PI * 2);
          ctx.fill();
          
          // Core
          ctx.fillStyle = `rgba(255, 255, 255, ${0.7 * starPulse})`;
          ctx.beginPath();
          ctx.arc(0, 0, starSize, 0, Math.PI * 2);
          ctx.fill();
          
          // Random twinkle effect
          if (Math.random() < 0.01) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(0, 0, starSize * 2, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
      }

      ctx.restore();

      // Update position with level-based speed modifications
      const speedMultiplier = 1 + (level - 1) * 0.1;
      obj.x += obj.speed * speedMultiplier;
      if (obj.x > CANVAS_WIDTH + 50) obj.x = -50;
      obj.rotation += 0.01 * speedMultiplier;

      return obj;
    });
  };

  // Check for level up
  useEffect(() => {
    if (score > 0 && score % POINTS_PER_LEVEL === 0) {
      setLevel(prev => prev + 1);
      setShowLevelUp(true);
      // Play sound
      if (congratsSoundRef.current) {
        congratsSoundRef.current.currentTime = 0;
        congratsSoundRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
      setTimeout(() => setShowLevelUp(false), 2000);
    }
  }, [score]);

  // Reset game state
  useEffect(() => {
    if (gameStarted && !gameOver) {
      gameObjectsRef.current = [];
      slicesRef.current = [];
      setScore(0);
      setLevel(1);
      setMissedFruits(0);
      setShowLevelUp(false);
    }
  }, [gameStarted, gameOver]);

  // Initialize game and create background gradient
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      const themeIndex = (level - 1) % LEVEL_THEMES.length;
      const currentTheme = LEVEL_THEMES[themeIndex];
      
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, currentTheme.background[0]);
      gradient.addColorStop(0.5, currentTheme.background[1]);
      gradient.addColorStop(1, currentTheme.background[2]);
      backgroundRef.current = gradient;
    }

    if (gameStarted && !gameOver) {
      gameObjectsRef.current = [];
      slicesRef.current = [];
      setScore(0);
      setMissedFruits(0);
    }
  }, [gameStarted, gameOver, level]);

  // Create planet gradient with rings and details
  const createPlanetGradient = (ctx: CanvasRenderingContext2D, obj: GameObject, colors: string[]) => {
    const gradient = ctx.createRadialGradient(
      -obj.radius * 0.3, -obj.radius * 0.3, 0,
      0, 0, obj.radius
    );
    gradient.addColorStop(0, colors[1]);
    gradient.addColorStop(1, colors[0]);
    return gradient;
  };

  // Draw planet with enhanced details
  const drawPlanet = (ctx: CanvasRenderingContext2D, obj: GameObject) => {
    const time = Date.now() * 0.001;
    
    // Enhanced outer glow effect with pulsing
    const glowIntensity = 0.15 + Math.sin(time * 2) * 0.05;
    const outerGlow = ctx.createRadialGradient(0, 0, obj.radius * 0.8, 0, 0, obj.radius * 2.5);
    outerGlow.addColorStop(0, 'rgba(255, 255, 255, 0)');
    outerGlow.addColorStop(0.5, `rgba(${obj.glowColor || '255, 255, 255'}, ${glowIntensity})`);
    outerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(0, 0, obj.radius * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Dynamic atmosphere effect
    const atmosphereSize = obj.radius * (1.2 + Math.sin(time * 1.5) * 0.05);
    const atmosphere = ctx.createRadialGradient(0, 0, obj.radius * 0.9, 0, 0, atmosphereSize);
    atmosphere.addColorStop(0, 'rgba(255, 255, 255, 0)');
    atmosphere.addColorStop(0.5, obj.atmosphereColor || 'rgba(255, 255, 255, 0.15)');
    atmosphere.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = atmosphere;
    ctx.beginPath();
    ctx.arc(0, 0, atmosphereSize, 0, Math.PI * 2);
    ctx.fill();

    // Enhanced planet base with dynamic lighting
    ctx.beginPath();
    ctx.arc(0, 0, obj.radius, 0, Math.PI * 2);
    const planetGradient = ctx.createRadialGradient(
      -obj.radius * 0.3, -obj.radius * 0.3, 0,
      0, 0, obj.radius * 1.2
    );
    
    // Dynamic color transitions
    const timeOffset = Math.sin(time) * 0.1;
    planetGradient.addColorStop(0, obj.highlightColor);
    planetGradient.addColorStop(0.3 + timeOffset, obj.color);
    planetGradient.addColorStop(0.6 + timeOffset, obj.shadowColor || obj.color);
    planetGradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = planetGradient;
    ctx.fill();

    // Add surface details and patterns
    ctx.save();
    ctx.rotate(obj.rotation * 0.5);
    
    // Dynamic surface patterns
    for (let i = 0; i < 5; i++) {
      const patternRotation = time * 0.2 + i * Math.PI / 2.5;
      ctx.rotate(patternRotation);
      
      // Surface bands
      ctx.beginPath();
      ctx.arc(0, 0, obj.radius * (0.4 + i * 0.15), 0, Math.PI * 1.8);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 - i * 0.015})`;
      ctx.lineWidth = obj.radius * 0.08;
      ctx.stroke();

      // Swirling clouds or surface features
      ctx.beginPath();
      for (let j = 0; j < 8; j++) {
        const angle = (j / 8) * Math.PI * 2 + time * (0.1 + i * 0.05);
        const x = Math.cos(angle) * obj.radius * (0.3 + i * 0.15);
        const y = Math.sin(angle) * obj.radius * (0.3 + i * 0.15);
        if (j === 0) ctx.moveTo(x, y);
        else ctx.quadraticCurveTo(x, y, x + 10, y + 10);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 - i * 0.02})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Add detailed surface features
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + time * 0.1;
      const distance = obj.radius * (0.2 + Math.random() * 0.5);
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const size = obj.radius * (0.1 + Math.random() * 0.15);

      // Feature shadow
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 0, ${0.2 + Math.random() * 0.1})`;
      ctx.fill();

      // Feature highlight with dynamic glow
      const featureGlow = ctx.createRadialGradient(
        x - size * 0.2, y - size * 0.2, 0,
        x, y, size
      );
      featureGlow.addColorStop(0, `rgba(255, 255, 255, ${0.3 + Math.random() * 0.2})`);
      featureGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = featureGlow;
      ctx.fill();
    }

    // Add polar caps or special features
    const polarCapSize = obj.radius * 0.4;
    const polarGlow = ctx.createRadialGradient(0, -obj.radius * 0.7, 0, 0, -obj.radius * 0.7, polarCapSize);
    polarGlow.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    polarGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = polarGlow;
    ctx.beginPath();
    ctx.arc(0, -obj.radius * 0.7, polarCapSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Special ring system for Saturn-like planets
    if (obj.hasRings) {
      ctx.save();
      ctx.rotate(Math.PI / 6);
      ctx.scale(1, 0.2);
      
      // Multiple ring layers with dynamic effects
      for (let i = 0; i < 5; i++) {
        const ringRadius = obj.radius * (1.8 + i * 0.2);
        const ringWidth = obj.radius * (0.4 - i * 0.06);
        
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
        
        // Dynamic ring gradient
        const ringGradient = ctx.createLinearGradient(-ringRadius, 0, ringRadius, 0);
        const ringOpacity = 0.4 - i * 0.06 + Math.sin(time * 2 + i) * 0.05;
        
        ringGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        ringGradient.addColorStop(0.2, `rgba(255, 215, 0, ${ringOpacity})`);
        ringGradient.addColorStop(0.5, `rgba(255, 215, 0, ${ringOpacity * 1.2})`);
        ringGradient.addColorStop(0.8, `rgba(255, 215, 0, ${ringOpacity})`);
        ringGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.strokeStyle = ringGradient;
        ctx.lineWidth = ringWidth;
        ctx.stroke();

        // Add ring particles
        for (let j = 0; j < 8; j++) {
          const particleAngle = (j / 8) * Math.PI * 2 + time * (0.5 + i * 0.2);
          const px = Math.cos(particleAngle) * ringRadius;
          const py = Math.sin(particleAngle) * ringRadius * 0.2;
          
          ctx.beginPath();
          ctx.arc(px, py, ringWidth * 0.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 215, 0, ${0.3 + Math.random() * 0.2})`;
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // Add dynamic energy field
    const energyField = ctx.createRadialGradient(0, 0, obj.radius * 0.9, 0, 0, obj.radius * 1.3);
    const energyOpacity = 0.1 + Math.sin(time * 3) * 0.05;
    energyField.addColorStop(0, 'rgba(255, 255, 255, 0)');
    energyField.addColorStop(0.5, `rgba(${obj.glowColor || '255, 255, 255'}, ${energyOpacity})`);
    energyField.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = energyField;
    ctx.beginPath();
    ctx.arc(0, 0, obj.radius * 1.3, 0, Math.PI * 2);
    ctx.fill();
  };

  // Draw slice effect with space theme
  const drawSliceEffect = (ctx: CanvasRenderingContext2D, obj: GameObject) => {
    // Outer energy burst
    const burstGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, obj.radius * 3);
    burstGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    burstGradient.addColorStop(0.3, obj.atmosphereColor || 'rgba(255, 255, 255, 0.3)');
    burstGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.beginPath();
    ctx.arc(0, 0, obj.radius * 3, 0, Math.PI * 2);
    ctx.fillStyle = burstGradient;
    ctx.fill();

    // Energy waves
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, obj.radius * (2 - i * 0.3), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 - i * 0.15})`;
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Particle burst
    for (let i = 0; i < 32; i++) {
      const angle = (i / 32) * Math.PI * 2;
      const length = obj.radius * (1.5 + Math.random());
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 - length / (obj.radius * 3)})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Slice line with glow
    ctx.beginPath();
    ctx.moveTo(-obj.radius * 2.5, 0);
    ctx.lineTo(obj.radius * 2.5, 0);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.shadowColor = obj.atmosphereColor || '#fff';
    ctx.shadowBlur = 20;
    ctx.stroke();
  };

  // Spawn game objects with speed based on level
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const { speed, spawnInterval, bombChance } = getGameParameters(level);

    const spawnTimer = setInterval(() => {
      const isBomb = Math.random() < bombChance;
      const directions: ('left' | 'right' | 'up' | 'down')[] = ['left', 'right', 'up', 'down'];
      const direction = directions[Math.floor(Math.random() * directions.length)];
      
      let position: Point;
      switch (direction) {
        case 'left':
          position = { x: -50, y: Math.random() * CANVAS_HEIGHT };
          break;
        case 'right':
          position = { x: CANVAS_WIDTH + 50, y: Math.random() * CANVAS_HEIGHT };
          break;
        case 'up':
          position = { x: Math.random() * CANVAS_WIDTH, y: -50 };
          break;
        case 'down':
          position = { x: Math.random() * CANVAS_WIDTH, y: CANVAS_HEIGHT + 50 };
          break;
        default:
          position = { x: 0, y: 0 };
      }

      if (!isBomb) {
        // Select random planet type
        const planetIndex = Math.floor(Math.random() * PLANETS.length);
        const [baseColor, highlightColor, planetName, atmosphereColor] = PLANETS[planetIndex];
        
        const newObject: GameObject = {
        id: Date.now(),
          position,
          velocity: {
            x: direction === 'left' ? speed : direction === 'right' ? -speed : 0,
            y: direction === 'up' ? speed : direction === 'down' ? -speed : 0
          },
          radius: 25 + Math.random() * 15,
          color: baseColor,
          highlightColor: highlightColor,
          atmosphereColor: atmosphereColor,
          hasRings: planetName === 'Saturn', // Only Saturn has rings
          sliced: false,
          rotation: Math.random() * Math.PI * 2,
          type: 'fruit',
          direction,
          particles: []
        };
        
        gameObjectsRef.current = [...gameObjectsRef.current, newObject];
      } else {
        // Create bomb object
        const newObject: GameObject = {
          id: Date.now(),
          position,
        velocity: {
            x: direction === 'left' ? speed : direction === 'right' ? -speed : 0,
            y: direction === 'up' ? speed : direction === 'down' ? -speed : 0
        },
          radius: 25 + Math.random() * 15,
          color: '#333',
          highlightColor: '#666',
        sliced: false,
          rotation: Math.random() * Math.PI * 2,
          type: 'bomb',
          direction,
          particles: []
        };
        
        gameObjectsRef.current = [...gameObjectsRef.current, newObject];
      }
    }, spawnInterval);

    return () => clearInterval(spawnTimer);
  }, [gameStarted, gameOver, level]);

  // Create firework explosion
  const createFirework = (x: number, y: number): Firework => {
    const particles = [];
    const particleCount = 150;
    const colors = ['#ff0000', '#ff7700', '#ffff00', '#ff4444', '#ff8800', '#ffaa00'];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 8 + Math.random() * 8;
      particles.push({
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1
      });
    }
    
    return {
      x,
      y,
      particles,
      timeLeft: 90
    };
  };

  // Handle game over with explosions
  const handleGameOver = () => {
    setGameOver(true);
    
    // Play bomb sound if game over was caused by bomb
    if (bombSoundRef.current) {
      bombSoundRef.current.currentTime = 0;
      bombSoundRef.current.play().catch(e => console.log('Bomb sound play failed:', e));
    }
    
    // Play sad sound after a short delay
    setTimeout(() => {
      if (sadSoundRef.current) {
        sadSoundRef.current.currentTime = 0;
        sadSoundRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
    }, 500);
    
    // Create more fireworks spread across the screen
    const newFireworks = [];
    for (let i = 0; i < 12; i++) {
      newFireworks.push(createFirework(
        (CANVAS_WIDTH / 11) * i,
        Math.random() * CANVAS_HEIGHT * 0.8 + CANVAS_HEIGHT * 0.1
      ));
    }
    setFireworks(newFireworks);

    // Add second wave of fireworks after a delay
    setTimeout(() => {
      const secondWave: Firework[] = [];
      for (let i = 0; i < 8; i++) {
        secondWave.push(createFirework(
          Math.random() * CANVAS_WIDTH,
          Math.random() * CANVAS_HEIGHT * 0.8 + CANVAS_HEIGHT * 0.1
        ));
      }
      setFireworks(prev => [...prev, ...secondWave]);
    }, 500);
  };

  // Game loop
  const updateGameState = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Draw background
    ctx.fillStyle = backgroundRef.current || '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background objects
    drawBackgroundObjects(ctx);

    // Add stars to background
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 1.5;
      const opacity = Math.random() * 0.5 + 0.5;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fill();
    }

    // Update game objects
    gameObjectsRef.current = gameObjectsRef.current
      .map(obj => {
        if (obj.sliced) {
          return {
            ...obj,
            position: {
              x: obj.position.x + obj.velocity.x,
              y: obj.position.y + obj.velocity.y
            },
            velocity: {
              x: obj.velocity.x * 0.98,
              y: obj.velocity.y + 0.5
            },
            rotation: obj.rotation + 0.1
          };
        }
        return {
          ...obj,
          position: {
            x: obj.position.x + obj.velocity.x,
            y: obj.position.y + obj.velocity.y
          },
          rotation: obj.rotation + 0.02
        };
      })
      .filter(obj => {
        const isOutOfBounds = 
          obj.position.x < -100 || 
          obj.position.x > canvas.width + 100 || 
          obj.position.y < -100 || 
          obj.position.y > canvas.height + 100;

        if (isOutOfBounds && !obj.sliced && obj.type === 'fruit') {
          setMissedFruits(prev => {
            const newMissed = prev + 1;
            if (newMissed >= 5) {
              setGameOver(true);
            }
            return newMissed;
          });
        }
        return !isOutOfBounds;
      });

    // Draw game objects
    gameObjectsRef.current.forEach(obj => {
      ctx.save();
      ctx.translate(obj.position.x, obj.position.y);
      ctx.rotate(obj.rotation);
      
      if (obj.type === 'bomb') {
        drawBomb(ctx, obj);
      } else {
        drawPlanet(ctx, obj);
      }

      // Draw slicing effect
      if (obj.sliced) {
        drawSliceEffect(ctx, obj);
      }

      // Draw direction letter
      if (!obj.sliced && obj.direction) {
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${obj.radius * 0.8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        
        let letter = '';
        switch (obj.direction) {
          case 'left': letter = 'A'; break;
          case 'right': letter = 'D'; break;
          case 'up': letter = 'W'; break;
          case 'down': letter = 'S'; break;
        }
        
        ctx.fillText(letter, 0, 0);
      }
      
      ctx.restore();
    });

    // Draw and update fireworks
    if (gameOver && fireworks.length > 0) {
      setFireworks(prevFireworks => 
        prevFireworks
          .map(fw => ({
            ...fw,
            timeLeft: fw.timeLeft - 1,
            particles: fw.particles.map(p => ({
              ...p,
              x: p.x + p.vx,
              y: p.y + p.vy,
              vy: p.vy + 0.1, // Add gravity
              alpha: p.alpha * 0.96 // Fade out
            }))
          }))
          .filter(fw => fw.timeLeft > 0)
      );

      fireworks.forEach(fw => {
        fw.particles.forEach(p => {
          if (p.alpha <= 0.1) return;
          ctx.save();
          ctx.translate(fw.x + p.x, fw.y + p.y);
      ctx.beginPath();
          ctx.arc(0, 0, 2, 0, Math.PI * 2);
          ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0');
          ctx.fill();
          ctx.restore();
        });
      });
    }

    requestRef.current = requestAnimationFrame(updateGameState);
  };

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    requestRef.current = requestAnimationFrame(updateGameState);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameStarted, gameOver]);

  // Modify keyboard controls to trigger explosions
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      let direction: 'left' | 'right' | 'up' | 'down' | null = null;

      switch (e.key.toLowerCase()) {
        case 'a': direction = 'left'; break;
        case 'd': direction = 'right'; break;
        case 'w': direction = 'up'; break;
        case 's': direction = 'down'; break;
      }

      if (direction) {
        gameObjectsRef.current = gameObjectsRef.current.map(obj => {
          if (!obj.sliced && obj.direction === direction) {
            if (obj.type === 'bomb') {
              handleGameOver();
              return obj;
            }
            setScore(prev => prev + 10);
            return {
              ...obj,
              sliced: true,
              velocity: {
                x: obj.velocity.x * 1.5,
                y: obj.velocity.y * 1.5
              },
              rotation: obj.rotation + Math.PI * 4 // Add spinning effect
            };
          }
          return obj;
      });
    }
  };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver]);

  // Draw hazard objects (bombs and suns)
  const drawHazard = (ctx: CanvasRenderingContext2D, obj: GameObject) => {
    if (obj.type === 'bomb') {
      // Draw bomb
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(0, 0, obj.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw fuse
      ctx.beginPath();
      ctx.moveTo(0, -obj.radius);
      ctx.quadraticCurveTo(5, -obj.radius - 10, 0, -obj.radius - 15);
      ctx.strokeStyle = '#ffa500';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw spark
      const sparkGradient = ctx.createRadialGradient(0, -obj.radius - 15, 0, 0, -obj.radius - 15, 4);
      sparkGradient.addColorStop(0, '#fff');
      sparkGradient.addColorStop(1, '#ff0');
      ctx.fillStyle = sparkGradient;
      ctx.beginPath();
      ctx.arc(0, -obj.radius - 15, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Draw sun
      const sunGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, obj.radius);
      sunGradient.addColorStop(0, '#fff');
      sunGradient.addColorStop(0.3, '#ffff00');
      sunGradient.addColorStop(0.7, '#ff8c00');
      sunGradient.addColorStop(1, '#ff4500');
      
      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(0, 0, obj.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw corona
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(
          Math.cos(angle) * obj.radius,
          Math.sin(angle) * obj.radius
        );
        ctx.lineTo(
          Math.cos(angle) * (obj.radius * 1.5),
          Math.sin(angle) * (obj.radius * 1.5)
        );
        ctx.strokeStyle = '#ff4500';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  };

  // Updated bomb drawing function with enhanced animations
  const drawBomb = (ctx: CanvasRenderingContext2D, obj: GameObject) => {
    const time = Date.now() * 0.005;
    
    // Pulsing effect for the bomb
    const pulseScale = 1 + Math.sin(time * 0.5) * 0.05;
    
    // Draw bomb body with metallic effect
    const bombGradient = ctx.createRadialGradient(
      -obj.radius * 0.2, -obj.radius * 0.2, 0,
      0, 0, obj.radius * pulseScale
    );
    bombGradient.addColorStop(0, '#888');
    bombGradient.addColorStop(0.5, '#444');
    bombGradient.addColorStop(0.8, '#222');
    bombGradient.addColorStop(1, '#000');
    
    ctx.beginPath();
    ctx.arc(0, 0, obj.radius * pulseScale, 0, Math.PI * 2);
    ctx.fillStyle = bombGradient;
    ctx.fill();

    // Add metallic shine effect
    const shineAngle = time * 0.2;
    const shineGradient = ctx.createLinearGradient(
      -obj.radius * Math.cos(shineAngle),
      -obj.radius * Math.sin(shineAngle),
      obj.radius * Math.cos(shineAngle),
      obj.radius * Math.sin(shineAngle)
    );
    shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    shineGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
    shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.beginPath();
    ctx.arc(0, 0, obj.radius * pulseScale, 0, Math.PI * 2);
    ctx.fillStyle = shineGradient;
    ctx.fill();

    // Draw fuse with dynamic wave effect
    ctx.beginPath();
    ctx.moveTo(0, -obj.radius);
    for (let i = 0; i < 12; i++) {
      const x = i * 2;
      const y = Math.sin(time * 2 + i * 0.5) * 3;
      ctx.lineTo(x, -obj.radius - 10 - y);
    }
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Enhanced animated flame
    const flameHeight = 15 + Math.sin(time * 2) * 5;
    const flameWidth = 10 + Math.cos(time * 3) * 3;

    // Multiple flame layers for depth
    const flameLayers = 3;
    for (let i = 0; i < flameLayers; i++) {
      const layerOffset = i * 0.5;
      const flameGradient = ctx.createRadialGradient(
        15, -obj.radius - 15 - layerOffset * 5,
        0,
        15, -obj.radius - 15 - layerOffset * 5,
        flameHeight * (1 - i * 0.2)
      );
      
      const alpha = 1 - i * 0.2;
      flameGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      flameGradient.addColorStop(0.2, `rgba(255, 255, 0, ${alpha})`);
      flameGradient.addColorStop(0.4, `rgba(255, 140, 0, ${alpha})`);
      flameGradient.addColorStop(0.6, `rgba(255, 69, 0, ${alpha})`);
      flameGradient.addColorStop(1, 'rgba(255, 69, 0, 0)');

      ctx.beginPath();
      ctx.moveTo(15 - flameWidth, -obj.radius - 15 - layerOffset * 5);
      ctx.quadraticCurveTo(
        15, -obj.radius - 15 - flameHeight * 2 - layerOffset * 10,
        15 + flameWidth, -obj.radius - 15 - layerOffset * 5
      );
      ctx.fillStyle = flameGradient;
      ctx.fill();
    }

    // Add glowing effect
    ctx.shadowColor = '#FF4500';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(15, -obj.radius - 15, flameWidth * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 69, 0, 0.3)';
    ctx.fill();

    // Animated spark particles
    const sparkCount = 8;
    for (let i = 0; i < sparkCount; i++) {
      const sparkTime = time + i * (Math.PI * 2 / sparkCount);
      const sparkRadius = 2 + Math.sin(sparkTime * 3) * 1;
      const sparkX = 15 + Math.cos(sparkTime * 2) * flameWidth * 0.8;
      const sparkY = -obj.radius - 15 - Math.sin(sparkTime * 3) * flameHeight * 0.4;
      
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, sparkRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, ${150 + Math.random() * 105}, 0, ${0.6 + Math.random() * 0.4})`;
      ctx.fill();
    }

    // Add warning glow effect
    const warningGlow = ctx.createRadialGradient(0, 0, obj.radius * 0.8, 0, 0, obj.radius * 2);
    warningGlow.addColorStop(0, 'rgba(255, 0, 0, 0)');
    warningGlow.addColorStop(0.8, `rgba(255, 0, 0, ${0.1 + Math.sin(time) * 0.05})`);
    warningGlow.addColorStop(1, 'rgba(255, 0, 0, 0)');
    
    ctx.beginPath();
    ctx.arc(0, 0, obj.radius * 2, 0, Math.PI * 2);
    ctx.fillStyle = warningGlow;
    ctx.fill();
    
    ctx.shadowBlur = 0;
  };

  return (
    <div className="fixed inset-0 bg-[#1a1c2c] flex items-center justify-center">
      <div className="relative w-screen h-screen">
        {/* Remove the Planet Slicer title block */}

        {!gameStarted ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white z-10 backdrop-blur-sm">
            {/* Enhanced animated background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 via-blue-500/20 to-cyan-500/20 animate-pulse" />
              {/* Floating orbs */}
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${5 + Math.random() * 5}s`
                  }}
                >
                  <div 
                    className="relative"
                    style={{
                      transform: `scale(${0.5 + Math.random()})`,
                      opacity: 0.3 + Math.random() * 0.4
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur-xl animate-pulse" 
                         style={{ animationDelay: `${Math.random() * 2}s` }} />
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>
              ))}
              
              {/* Shooting stars */}
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="absolute h-px w-32 bg-gradient-to-r from-transparent via-white to-transparent animate-shooting-star"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${2 + Math.random() * 3}s`
                  }}
                />
              ))}
            </div>

            {/* Main title with enhanced animations */}
            <div className="relative z-10 flex flex-col items-center animate-titleFloat">
              <h1 className="text-7xl font-bold mb-8 text-center relative">
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 animate-shimmer">
                  Planet Slicer
                </span>
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 opacity-30 blur-xl animate-pulse" />
                <span className="block text-3xl mt-4 text-blue-300/80 animate-fadeIn">
                  Master the Art of Cosmic Slicing
                </span>
            </h1>

              {/* Game Description with enhanced styling */}
              <div className="mb-8 text-center bg-black/40 p-8 rounded-xl backdrop-blur-md border border-white/10 transform hover:scale-105 transition-all duration-300">
                <div className="space-y-4 text-lg relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 blur-xl animate-pulse" />
                  <h3 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
                    How to Play
                  </h3>
                  <p className="text-blue-100 transform hover:scale-105 transition-all">
                    🌍 Use <span className="text-cyan-400 font-bold animate-pulse">W A S D</span> keys to slice planets
                  </p>
                  <p className="text-blue-100 transform hover:scale-105 transition-all">
                    🎮 Match the key with the letter on the planet
                  </p>
                  <p className="text-blue-100 transform hover:scale-105 transition-all">
                    🕳️ Avoid black holes or game over!
                  </p>
                  <p className="text-blue-100 transform hover:scale-105 transition-all">
                    ⚡ Speed increases with each level
                  </p>
                  <div className="mt-8 pt-4 border-t border-white/10">
                    <p className="text-yellow-300 font-semibold animate-pulse">
                      Ready to explore the cosmos?
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced start button */}
            <button
                onClick={() => {
                  setGameStarted(true);
                  setShowTitle(true);
                  if (introSoundRef.current) {
                    introSoundRef.current.currentTime = 0;
                    introSoundRef.current.play().catch(e => console.log('Audio play failed:', e));
                  }
                  setTimeout(() => setShowTitle(false), 3000);
                }}
                className="group relative px-10 py-5 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-xl transition-all transform hover:scale-110 hover:rotate-1"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
                <div className="relative flex items-center space-x-4">
                  <span className="text-2xl font-bold text-white group-hover:text-white/90">
                    Begin Your Journey
                  </span>
                  <span className="text-2xl transform group-hover:translate-x-1 transition-transform">
                    🚀
                  </span>
                </div>
            </button>
            </div>
          </div>
        ) : gameOver ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white z-10 backdrop-blur-sm">
            <h2 className="text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-fire">
              YOU LOST!
            </h2>
            <p className="text-3xl mb-6">Score: {score}</p>
            
            {/* Game controls and description */}
            <div className="mb-8 text-center bg-black/30 p-6 rounded-lg backdrop-blur-sm max-w-md">
              <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Game Controls & Tips
              </h3>
              <div className="space-y-2 text-lg">
                <p>🎮 Use WASD keys to slice planets</p>
                <p>⚠️ Avoid hitting the black holes!</p>
                <p>❤️ You have 3 lives - don't miss planets!</p>
                <p>⚡ Each level increases speed</p>
                <p className="text-yellow-300 font-semibold mt-4 pt-4 border-t border-yellow-300/30">
                  ⚠️ Play carefully! Check for black holes before pressing keys!
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setGameOver(false);
                setGameStarted(true);
                setFireworks([]);
              }}
              className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg hover:from-red-600 hover:to-orange-600 transition-all transform hover:scale-105 font-bold text-lg shadow-lg"
            >
              Try Again
            </button>
          </div>
        ) : null}
        
        <div className="absolute top-4 right-4 text-white text-3xl font-bold z-10 flex flex-col items-end gap-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
          Score: {score}
          </span>
          <span className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Level: {level}
          </span>
        </div>

        <div className="absolute top-4 left-4 flex gap-2 z-10">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-8 h-8 flex items-center justify-center transition-all transform ${
                i < 5 - missedFruits 
                  ? 'text-red-500 scale-110 animate-heartbeat relative group' 
                  : 'text-gray-600 scale-90 opacity-40'
              }`}
            >
              <div className={`absolute inset-0 bg-red-500/20 rounded-full ${
                i < 5 - missedFruits ? 'animate-ping' : ''
              }`} />
              <div className={`relative transform ${
                i < 5 - missedFruits ? 'hover:scale-125 transition-transform duration-300' : ''
              }`}>
                ❤️
                {i < 5 - missedFruits && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-500/30 to-pink-500/30 rounded-full blur-sm animate-pulse" />
                )}
              </div>
            </div>
          ))}
        </div>

        {showLevelUp && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="relative">
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-cyan-500/20 blur-xl rounded-full scale-150" />
              
              {/* Main popup content */}
              <div className="relative bg-black/40 backdrop-blur-md rounded-xl p-8 border border-white/10 shadow-2xl transform transition-all animate-levelup">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-cyan-500/10 rounded-xl" />
                
                {/* Sparkles */}
                <div className="absolute -inset-1">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-cyan-500 blur opacity-30 animate-pulse" />
                </div>
                
                {/* Content */}
                <div className="relative">
                  <h2 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-cyan-300 text-center animate-slideDown">
                    NEW LEVEL!
                  </h2>
                  <div className="flex flex-col items-center gap-2 animate-slideUp">
                    <div className="text-4xl">🎉</div>
                    <div className="text-3xl font-bold text-white">Level {level}</div>
                    <div className="text-lg text-cyan-300 mt-2">Speed Increased!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update when ALL THE BEST appears */}
        {gameStarted && !gameOver && showTitle && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <div className="relative">
              {/* Animated cosmic background */}
              <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full animate-twinkle"
                    style={{
                      left: `${Math.random() * 200 - 50}%`,
                      top: `${Math.random() * 200 - 50}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      transform: `scale(${0.5 + Math.random()})`,
                      opacity: 0.6 + Math.random() * 0.4
                    }}
            />
          ))}
        </div>

              {/* Main text container with enhanced animation */}
              <div className="text-8xl font-bold text-center transform animate-float">
                <div className="relative">
                  {/* Animated rainbow border */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 rounded-lg opacity-75 blur-lg animate-border-flow" />
                  
                  {/* Glowing background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-50 blur-xl animate-pulse" />
                  
                  {/* Main text */}
                  <div className="relative bg-black/30 backdrop-blur-sm rounded-lg p-8 border border-white/10">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 animate-allTheBest">
                      ALL THE BEST!
                    </span>
                    
                    {/* Floating particles */}
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-white rounded-full animate-float"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${2 + Math.random() * 2}s`
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* Sparkle effects */}
                    <div className="absolute -inset-10">
                      {[...Array(15)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute animate-sparkle-spin"
                          style={{
                            left: `${Math.random() * 120}%`,
                            top: `${Math.random() * 120}%`,
                            animationDelay: `${Math.random() * 2}s`
                          }}
                        >
                          <div className="w-1 h-1 bg-white rounded-full" />
                          <div className="w-px h-4 bg-gradient-to-b from-white to-transparent transform -translate-y-2" />
        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}