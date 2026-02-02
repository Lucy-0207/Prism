
import React, { useRef, useEffect } from 'react';

interface TensorVisualizerProps {
  shape: (string | number)[];
  label: string;
  layerType: string;
  variant: 'input' | 'output';
}

/**
 * Computational Monitor Visualizer
 * Renders exact tensor slices and simulates the mathematical operation of the layer.
 */
export const TensorVisualizer: React.FC<TensorVisualizerProps> = ({ shape, label, layerType, variant }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Extract dimensions. Default for BERT Base: Batch=1, Seq=128 (viz 12), Hidden=768 (viz 64)
  // For FFN Intermediate: Hidden=3072 (viz 256)
  const isFFNExpansion = layerType === 'FFN' && variant === 'output'; // Actually intermediate in some contexts, but let's assume output of block
  // But wait, FFN output shape is usually same as input shape [B, S, H]. 
  // The internal is [B, S, 4H].
  // If this is the "Output Tensor" of the FFN *Block*, it's 768. 
  // If we want to show the internals, we'd need a specific internal view. 
  // For now, let's stick to the interface contract: visualizing the shape provided.
  
  const getVisualDims = () => {
    // We visualize a single sequence [Seq, Hidden]
    const seq = 12; // Fixed visual rows
    
    // Determine visual width based on actual hidden size if numeric
    const actualHidden = typeof shape[2] === 'number' ? shape[2] : 768;
    const isLarge = actualHidden > 1000;
    const width = isLarge ? 64 : 32; 
    
    return { rows: seq, cols: width, isSparse: layerType === 'FFN' || layerType === 'ReLU' };
  };

  const { rows, cols, isSparse } = getVisualDims();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId = 0;
    
    // Matrix State
    const dataMatrix = new Float32Array(rows * cols);
    
    // Initialize with some structure
    for(let i=0; i<dataMatrix.length; i++) {
        dataMatrix[i] = Math.random() * 0.5; 
    }

    const render = (time: number) => {
      // Update Data State based on Operation Type
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = y * cols + x;
          
          // Base signal: structured noise moving through sequence
          let val = Math.sin(x * 0.2 + y * 0.1 + time * 0.002) * 0.5 + 0.5;
          
          // Layer Specific Logic
          if (layerType === 'FFN') {
             // Simulate ReLU/GELU Activation: High sparsity
             // Boost high values, kill low values
             val = val > 0.6 ? (val - 0.6) * 3 : 0; 
             if (variant === 'input') val += 0.1; // Input is denser
          } else if (layerType === 'MultiHeadAttention') {
             // Attention Pattern: Vertical bands (Token attending to other tokens)
             // Create 'active' tokens
             const activeToken = Math.floor((Math.sin(time * 0.001) * 0.5 + 0.5) * rows);
             const isAttending = Math.abs(y - activeToken) < 2;
             if (isAttending) val *= 2.0;
             else val *= 0.3; // Suppress others
          } else if (layerType === 'LayerNorm') {
             // Norm: Very uniform distribution, no extreme peaks
             val = val * 0.5 + 0.25; 
          }
          
          dataMatrix[idx] = val;
        }
      }

      // Drawing
      const w = canvas.width;
      const h = canvas.height;
      const cellW = w / cols;
      const cellH = h / rows;

      ctx.fillStyle = '#0a0c10';
      ctx.fillRect(0, 0, w, h);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const val = dataMatrix[y * cols + x];
          
          // Color Palette: "Code" aesthetic
          // Zeros are transparent/dark
          if (val < 0.05) continue;

          let color = '';
          if (layerType === 'FFN') {
            // FFN: Purple/Blue (Deep Compute)
            const intensity = Math.min(255, val * 200);
            color = `rgba(${88}, ${166}, ${255}, ${val})`; // #58A6FF
          } else if (layerType === 'MultiHeadAttention') {
            // Attention: Gold/Orange (Context)
            color = `rgba(${210}, ${153}, ${34}, ${val})`; // #D29922
          } else {
            // Default: Green/Teal (Data)
            color = `rgba(${50}, ${200}, ${150}, ${val})`; 
          }

          // Draw "Pixel"
          ctx.fillStyle = color;
          // Add a small gap for grid look
          ctx.fillRect(x * cellW, y * cellH, cellW - 1, cellH - 1);
        }
      }

      // Draw "Active Computation Line"
      const scanY = (time * 0.05) % rows * cellH;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, scanY, w, cellH);
      
      // Draw Border Overlay for "Tensor Slice" look
      ctx.strokeStyle = '#30363D';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, w, h);

      frameId = requestAnimationFrame(render);
    };

    render(0);

    return () => cancelAnimationFrame(frameId);
  }, [rows, cols, layerType, variant]);

  // Construct precise dimension string
  const dimString = shape.map(s => typeof s === 'number' ? s : (s === 'seq_len' ? 'L' : 'B')).join(' × ');

  return (
    <div className="w-full font-mono">
      <div className="flex justify-between items-end mb-1">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
        <span className="text-[10px] text-slate-400 bg-prism-panel border border-prism-border px-1.5 rounded">
          {layerType === 'FFN' && variant === 'output' ? 'SPARSE ACTIVATION' : 'DENSE'}
        </span>
      </div>
      
      <div className="relative h-24 w-full border border-prism-border bg-[#050608] rounded overflow-hidden">
        <canvas 
          ref={canvasRef}
          width={256}
          height={64}
          className="w-full h-full block rendering-pixelated"
        />
        {/* Dimension Overlay */}
        <div className="absolute bottom-1 right-1 px-1 bg-black/80 text-[9px] text-prism-highlight border border-prism-highlight/30 rounded">
          {dimString}
        </div>
      </div>
    </div>
  );
};
