import React, { useEffect, useRef } from "react";
export const Loader = () => {
  const ref = useRef();
  const canvasWidth = 60;
  const canvasHeight = 60;
  const maxDistance = 30;

  useEffect(() => {
    if (!ref.current) return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const nodes = Array.from({ length: 10 }, (_, i) => ({
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      radius: 1,
      vx: Math.random() * 0.2 - 0.1,
      vy: Math.random() * 0.2 - 0.1,
    }));

    const animate = () => {
      requestAnimationFrame(animate);
      animationFrame += animationSpeed;

      const clamp = (number, min, max) => {
        return Math.min(Math.max(number, min), max);
      };

      nodes.forEach((node) => {
        node.vx += (Math.random() * 0.05 - 0.025) * 0.025;
        node.vy += (Math.random() * 0.05 - 0.025) * 0.025;
        node.vx = clamp(node.vx, -0.3, 0.3);
        node.vy = clamp(node.vy, -0.3, 0.3);

        if (node.x < node.radius) node.vx = Math.abs(node.vx);
        else if (node.x > canvasWidth - node.radius)
          node.vx = -Math.abs(node.vx);

        if (node.y < node.radius) node.vy = Math.abs(node.vy);
        else if (node.y > canvasHeight - node.radius)
          node.vy = -Math.abs(node.vy);

        node.x += node.vx;
        node.y += node.vy;

        node.radius = 2 + Math.sin(animationFrame * 0.05) * 2;
      });

      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        const toZero = Math.min(node.x, node.y);
        const toMax = Math.min(canvasWidth - node.x, canvasHeight - node.y);
        const minVal = Math.min(toZero, toMax);

        ctx.strokeStyle = `rgba(107, 170, 82, ${minVal / (canvasWidth / 2)})`;
        ctx.stroke();
      });

      nodes.forEach((node) => {
        const closest = closestNodes(node, 5);
        for (let i = 0; i < closest.length; i++) {
          const distanceFromMaxValue = Math.abs(
            closest[i].distance - maxDistance
          );
          const proximityToMaxValue = distanceFromMaxValue / maxDistance;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(closest[i].node.x, closest[i].node.y);
          ctx.strokeStyle = `rgba(107, 170, 82, ${proximityToMaxValue / 2})`;
          ctx.strokeWidth = 2;
          ctx.stroke();
        }
      });
    };

    const distance = (node1, node2) =>
      Math.sqrt(
        Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2)
      );

    const closestNodes = (node, num) => {
      const distances = [];
      for (let i = 0; i < nodes.length; i++) {
        if (i !== nodes.indexOf(node)) {
          const dist = distance(node, nodes[i]);
          if (dist < maxDistance) {
            distances.push({ node: nodes[i], distance: dist });
          }
        }
      }
      distances.sort((a, b) => a.distance - b.distance);
      return distances.slice(0, num);
    };

    let animationFrame = 0;
    let animationSpeed = 0.01;

    animate();
  }, [ref]);

  return <canvas ref={ref} />;
};
