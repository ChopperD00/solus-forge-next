'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Neural Logic Graph style - clean dark nodes with white curved connections
const colors = {
  bg: '#0A0A0A',
  nodeBg: '#1A1A1A',
  nodeBorder: '#2A2A2A',
  nodeHover: '#252525',
  text: '#FFFFFF',
  textMuted: '#888888',
  textDim: '#555555',
  connection: '#FFFFFF',
  connectionDim: 'rgba(255,255,255,0.15)',
  accent: '#FF6B00',
  dot: '#FFFFFF',
}

export interface NeuralNode {
  id: string
  type: string
  title: string
  subtitle?: string
  icon: string
  x: number
  y: number
  inputs: NeuralPort[]
  outputs: NeuralPort[]
  data?: Record<string, any>
  size?: 'small' | 'medium' | 'large' | 'hub'
}

export interface NeuralPort {
  id: string
  type: 'input' | 'output'
  label: string
  dataType?: string
}

export interface NeuralConnection {
  id: string
  fromNode: string
  fromPort: string
  toNode: string
  toPort: string
}

interface NeuralNodeCanvasProps {
  nodes: NeuralNode[]
  connections: NeuralConnection[]
  onNodesChange?: (nodes: NeuralNode[]) => void
  onConnectionsChange?: (connections: NeuralConnection[]) => void
  onNodeSelect?: (node: NeuralNode | null) => void
  onNodeDoubleClick?: (node: NeuralNode) => void
  selectedNodeId?: string | null
  accentColor?: string
}

// Animated dot along path
function AnimatedDot({ path, duration = 2, delay = 0 }: { path: string; duration?: number; delay?: number }) {
  const [offset, setOffset] = useState(0)
  const pathRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    let animationFrame: number
    let startTime: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = (timestamp - startTime) / 1000
      const progress = ((elapsed + delay) % duration) / duration
      setOffset(progress)
      animationFrame = requestAnimationFrame(animate)
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [duration, delay])

  if (!pathRef.current && typeof window !== 'undefined') {
    return (
      <>
        <path ref={pathRef} d={path} fill="none" stroke="transparent" />
        <circle r="3" fill={colors.dot}>
          <animateMotion dur={`${duration}s`} repeatCount="indefinite" begin={`${delay}s`}>
            <mpath href={`#path-${path.substring(0, 20)}`} />
          </animateMotion>
        </circle>
      </>
    )
  }

  return (
    <circle r="3" fill={colors.dot} opacity={0.9}>
      <animateMotion dur={`${duration}s`} repeatCount="indefinite" begin={`${delay}s`} path={path} />
    </circle>
  )
}

// Generate smooth bezier curve between two points
function generateBezierPath(
  x1: number, y1: number,
  x2: number, y2: number
): string {
  const midX = (x1 + x2) / 2
  const dx = Math.abs(x2 - x1)
  const controlOffset = Math.min(dx * 0.5, 150)

  // Create smooth S-curve
  const cp1x = x1 + controlOffset
  const cp1y = y1
  const cp2x = x2 - controlOffset
  const cp2y = y2

  return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`
}

// Neural-style node component
function NeuralNodeComponent({
  node,
  isSelected,
  onSelect,
  onDoubleClick,
  onDragStart,
  onDrag,
  onDragEnd,
}: {
  node: NeuralNode
  isSelected: boolean
  onSelect: () => void
  onDoubleClick: () => void
  onDragStart: () => void
  onDrag: (dx: number, dy: number) => void
  onDragEnd: () => void
}) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })

  const getNodeSize = () => {
    switch (node.size) {
      case 'hub': return { width: 140, height: 100, iconSize: 32 }
      case 'large': return { width: 160, height: 70, iconSize: 20 }
      case 'small': return { width: 130, height: 55, iconSize: 16 }
      default: return { width: 150, height: 60, iconSize: 18 }
    }
  }

  const { width, height, iconSize } = getNodeSize()
  const isHub = node.size === 'hub'

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    e.stopPropagation()
    setIsDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
    onSelect()
    onDragStart()
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y
      dragStart.current = { x: e.clientX, y: e.clientY }
      onDrag(dx, dy)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      onDragEnd()
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, onDrag, onDragEnd])

  return (
    <motion.div
      ref={nodeRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute cursor-move select-none"
      style={{
        left: node.x - width / 2,
        top: node.y - height / 2,
        width,
        height,
        zIndex: isSelected ? 20 : 10,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={(e) => {
        e.stopPropagation()
        onDoubleClick()
      }}
    >
      {/* Node body */}
      <motion.div
        className={`w-full h-full rounded-xl flex ${isHub ? 'flex-col items-center justify-center' : 'items-center gap-3 px-4'}`}
        style={{
          background: colors.nodeBg,
          border: `1px solid ${isSelected ? colors.accent : colors.nodeBorder}`,
          boxShadow: isSelected ? `0 0 20px ${colors.accent}33` : 'none',
        }}
        whileHover={{
          background: colors.nodeHover,
          borderColor: isSelected ? colors.accent : '#3A3A3A',
        }}
        transition={{ duration: 0.15 }}
      >
        {/* Icon */}
        <div
          className={`flex items-center justify-center ${isHub ? 'mb-2' : ''}`}
          style={{
            width: isHub ? 40 : 28,
            height: isHub ? 40 : 28,
            fontSize: iconSize,
            background: isHub ? colors.nodeBorder : 'transparent',
            borderRadius: isHub ? 8 : 0,
          }}
        >
          {node.icon}
        </div>

        {/* Text */}
        <div className={isHub ? 'text-center' : ''}>
          <div
            className="font-medium leading-tight"
            style={{
              color: colors.text,
              fontSize: isHub ? 13 : 12,
            }}
          >
            {node.title}
          </div>
          {node.subtitle && (
            <div
              className="leading-tight"
              style={{
                color: colors.textDim,
                fontSize: 10,
              }}
            >
              {node.subtitle}
            </div>
          )}
        </div>
      </motion.div>

      {/* Output port (right side) */}
      {node.outputs.length > 0 && (
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 rounded-full"
          style={{ background: colors.connection }}
        />
      )}

      {/* Input port (left side) */}
      {node.inputs.length > 0 && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
          style={{ background: colors.connection }}
        />
      )}
    </motion.div>
  )
}

export default function NeuralNodeCanvas({
  nodes: initialNodes,
  connections: initialConnections,
  onNodesChange,
  onConnectionsChange,
  onNodeSelect,
  onNodeDoubleClick,
  selectedNodeId,
  accentColor = colors.accent,
}: NeuralNodeCanvasProps) {
  const [nodes, setNodes] = useState(initialNodes)
  const [connections, setConnections] = useState(initialConnections)
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef({ x: 0, y: 0 })

  // Sync with props
  useEffect(() => {
    setNodes(initialNodes)
  }, [initialNodes])

  useEffect(() => {
    setConnections(initialConnections)
  }, [initialConnections])

  const getNodeSize = (node: NeuralNode) => {
    switch (node.size) {
      case 'hub': return { width: 140, height: 100 }
      case 'large': return { width: 160, height: 70 }
      case 'small': return { width: 130, height: 55 }
      default: return { width: 150, height: 60 }
    }
  }

  const getPortPosition = useCallback((nodeId: string, portId: string, portType: 'input' | 'output') => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return { x: 0, y: 0 }

    const { width, height } = getNodeSize(node)
    const x = node.x + (portType === 'output' ? width / 2 : -width / 2)
    const y = node.y

    return { x, y }
  }, [nodes])

  const handleNodeDrag = useCallback((nodeId: string, dx: number, dy: number) => {
    setNodes(prev => {
      const updated = prev.map(n =>
        n.id === nodeId ? { ...n, x: n.x + dx / zoom, y: n.y + dy / zoom } : n
      )
      onNodesChange?.(updated)
      return updated
    })
  }, [zoom, onNodesChange])

  // Canvas panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true)
      panStart.current = { x: e.clientX, y: e.clientY }
    }
  }

  useEffect(() => {
    if (!isPanning) return

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - panStart.current.x
      const dy = e.clientY - panStart.current.y
      panStart.current = { x: e.clientX, y: e.clientY }
      setViewOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }))
    }

    const handleMouseUp = () => setIsPanning(false)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isPanning])

  // Zoom with wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setZoom(prev => Math.min(2, Math.max(0.5, prev * delta)))
    }
  }

  return (
    <div
      ref={canvasRef}
      className="w-full h-full relative overflow-hidden"
      style={{ background: colors.bg, cursor: isPanning ? 'grabbing' : 'default' }}
      onMouseDown={handleCanvasMouseDown}
      onWheel={handleWheel}
      onClick={() => onNodeSelect?.(null)}
    >
      {/* Grid pattern */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.3 }}>
        <defs>
          <pattern id="neural-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="0.5" fill={colors.textDim} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#neural-grid)" />
      </svg>

      {/* Transformed container */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Connections SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          <defs>
            {/* Glow filter */}
            <filter id="connection-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {connections.map((conn, index) => {
            const fromPos = getPortPosition(conn.fromNode, conn.fromPort, 'output')
            const toPos = getPortPosition(conn.toNode, conn.toPort, 'input')
            const path = generateBezierPath(fromPos.x, fromPos.y, toPos.x, toPos.y)

            return (
              <g key={conn.id}>
                {/* Shadow/glow path */}
                <path
                  d={path}
                  fill="none"
                  stroke={colors.connectionDim}
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Main path */}
                <path
                  d={path}
                  fill="none"
                  stroke={colors.connection}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  filter="url(#connection-glow)"
                />
                {/* Animated dot */}
                <AnimatedDot path={path} duration={2.5} delay={index * 0.3} />
              </g>
            )
          })}
        </svg>

        {/* Nodes */}
        {nodes.map(node => (
          <NeuralNodeComponent
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            onSelect={() => onNodeSelect?.(node)}
            onDoubleClick={() => onNodeDoubleClick?.(node)}
            onDragStart={() => {}}
            onDrag={(dx, dy) => handleNodeDrag(node.id, dx, dy)}
            onDragEnd={() => {}}
          />
        ))}
      </div>

      {/* Zoom controls */}
      <div
        className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: colors.nodeBg, border: `1px solid ${colors.nodeBorder}` }}
      >
        <button
          onClick={() => setZoom(prev => Math.min(2, prev * 1.2))}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10"
          style={{ color: colors.textMuted }}
        >
          +
        </button>
        <span className="text-xs min-w-[40px] text-center" style={{ color: colors.textMuted }}>
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(prev => Math.max(0.5, prev / 1.2))}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10"
          style={{ color: colors.textMuted }}
        >
          −
        </button>
      </div>
    </div>
  )
}
