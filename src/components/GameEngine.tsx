import React, { useEffect, useRef } from 'react';
import styles from '../styles/Game.module.css';

const GameEngine: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Game variables
    const map = [
      [1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,1],
      [1,0,1,0,0,1,0,1],
      [1,0,0,0,0,0,0,1],
      [1,0,1,0,0,1,0,1],
      [1,0,1,0,0,1,0,1],
      [1,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1],
    ];
    
    let playerX = 1.5;
    let playerY = 1.5;
    let playerAngle = 0;

    function isValidPosition(x: number, y: number): boolean {
      const cellX = Math.floor(x);
      const cellY = Math.floor(y);
      return cellX >= 0 && cellX < map[0].length && cellY >= 0 && cellY < map.length && map[cellY][cellX] === 0;
    }

    function drawMinimap() {
      const tileSize = 20;
      map.forEach((row, y) => {
        row.forEach((cell, x) => {
          ctx!.fillStyle = cell ? '#888' : '#fff';
          ctx!.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        });
      });
      
      // Draw player on minimap
      const playerScreenX = playerX * tileSize;
      const playerScreenY = playerY * tileSize;
      
      ctx!.fillStyle = 'red';
      ctx!.beginPath();
      ctx!.arc(playerScreenX, playerScreenY, 5, 0, Math.PI * 2);
      ctx!.fill();

      // Draw direction indicator
      const directionLength = 15;
      const directionEndX = playerScreenX + Math.cos(playerAngle) * directionLength;
      const directionEndY = playerScreenY + Math.sin(playerAngle) * directionLength;

      ctx!.strokeStyle = 'red';
      ctx!.lineWidth = 2;
      ctx?.beginPath();
      ctx?.moveTo(playerScreenX, playerScreenY);
      ctx?.lineTo(directionEndX, directionEndY);
      ctx?.stroke();
    }

    function castRays() {
      const FOV = Math.PI / 3;
      const rayCount = canvas!.width;
      const rayAngleStep = FOV / rayCount;

      for (let i = 0; i < rayCount; i++) {
        const rayAngle = playerAngle - FOV / 2 + rayAngleStep * i;
        
        // Simple ray casting (can be improved for performance)
        let rayX = playerX;
        let rayY = playerY;
        let distance = 0;
        let hitWall = false;

        while (!hitWall && distance < 20) {
          distance += 0.1;
          rayX = playerX + Math.cos(rayAngle) * distance;
          rayY = playerY + Math.sin(rayAngle) * distance;

          if (!isValidPosition(rayX, rayY)) {
            hitWall = true;
          }
        }

        // Draw 3D projection
        const wallHeight = canvas!.height / distance;
        const wallTop = (canvas!.height - wallHeight) / 2;
        ctx!.fillStyle = `rgb(0, ${255 - distance * 20}, 0)`;
        ctx!.fillRect(i, wallTop, 1, wallHeight);
      }
    }

    function gameLoop() {
      ctx?.clearRect(0, 0, canvas!.width, canvas!.height);
      castRays();
      drawMinimap();
      requestAnimationFrame(gameLoop);
    }

    gameLoop();

    // Handle keyboard input
    const handleKeyDown = (e: KeyboardEvent) => {
      const moveSpeed = 0.1;
      const rotateSpeed = 0.1;

      let newX = playerX;
      let newY = playerY;

      switch(e.key) {
        case 'ArrowUp':
          newX = playerX + Math.cos(playerAngle) * moveSpeed;
          newY = playerY + Math.sin(playerAngle) * moveSpeed;
          break;
        case 'ArrowDown':
          newX = playerX - Math.cos(playerAngle) * moveSpeed;
          newY = playerY - Math.sin(playerAngle) * moveSpeed;
          break;
        case 'ArrowLeft':
          playerAngle -= rotateSpeed;
          return; // No need to check collision for rotation
        case 'ArrowRight':
          playerAngle += rotateSpeed;
          return; // No need to check collision for rotation
      }

      // Check collision and update position if valid
      if (isValidPosition(newX, playerY)) {
        playerX = newX;
      }
      if (isValidPosition(playerX, newY)) {
        playerY = newY;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.gameCanvas} />;
};

export default GameEngine;