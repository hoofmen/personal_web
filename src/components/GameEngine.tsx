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
      [1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1],
      [1,0,0,0,0,1,0,1],
      [1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1],
    ];
    
    let playerX = 1.5;
    let playerY = 1.5;
    let playerAngle = 0;

    const moveSpeed = 0.1;
    const rotateSpeed = 0.1;

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
        ctx!.fillStyle = `rgb(20, 30, ${180 - distance * 15})`;
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

    function movePlayer(forward: boolean, strafe: boolean = false) {
      const angle = strafe ? playerAngle + Math.PI / 2 : playerAngle;
      const direction = forward ? 1 : -1;
      const newX = playerX + Math.cos(angle) * moveSpeed * direction;
      const newY = playerY + Math.sin(angle) * moveSpeed * direction;

      if (isValidPosition(newX, playerY)) {
        playerX = newX;
      }
      if (isValidPosition(playerX, newY)) {
        playerY = newY;
      }
    }

    function rotatePlayer(right: boolean) {
      playerAngle += right ? rotateSpeed : -rotateSpeed;
    }

    // Handle keyboard input
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'ArrowUp':
          movePlayer(true);
          break;
        case 'ArrowDown':
          movePlayer(false);
          break;
        case 'ArrowLeft':
          rotatePlayer(false);
          break;
        case 'ArrowRight':
          rotatePlayer(true);
          break;
      }
    };

    // Touch controls
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      const deltaX = touchX - touchStartX;
      const deltaY = touchY - touchStartY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal movement - rotate
        rotatePlayer(deltaX > 0);
      } else {
        // Vertical movement - move forward/backward
        movePlayer(deltaY < 0);
      }

      touchStartX = touchX;
      touchStartY = touchY;
    };

    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.gameCanvas} />;
};

export default GameEngine;