'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Types
export interface NodePort {
  id: string
  type: 'input' | 'output'
  label: string
  dataType: 'any' | 'video' | 'audio' | 'image' | 'text' | 'tensor' | 'prompt'
  connected?: boolean
}

export interface WorkflowNode {
  id: string
  type: string
  title: string
  subtitle?: string
  icon: string
  x: number
  y: number
  width?: number
  height?: number
  inputs: NodePort[]
  outputs: NodePort[]
  data?: Record<string, any>
  color?: string
  category?: string
}

export interface NodeConnection {
  id: string
  fromNode: string
  fromPort: string
  toNode: string
  toPort: string
  animated?: boolean
}

interface NodeWorkflowCanvasProps {
  nodes: WorkflowNode[]
  connections: NodeConnection[]
  onNodesChange: (nodes: WorkflowNode[]) => void
  onConnectionsChange: (connections: NodeConnection[]) => void
  onNodeSelect?: (node: WorkflowNode | null) => void
  onNodeDoubleClick?: (node: WorkflowNode) => void
  selectedNodeId?: string | null
  accentColor?: string
  gridSize?: number
}

// Color palette
const colors = {
  bg: '#141010',
  surface: '#1E1818',
  surfaceLight: '#2A2222',
  border: '#3A3030',
  borderHover: '#504545',
  text: '#FFFFFF',
  textMuted: '#B0A8A8',
  textDim: '#706868',
  accent: '#FF6B00',
  accentGlow: 'rgba(255, 107, 0, 0.3)',
  connection: '#4A9EFF',
  connectionGlow: 'rgba(74, 158, 255, 0.4)',
}

// Port colors by data type
const portColors: Record<string, string> = {
  any: '#888888',
  video: '#FF6B6B',
  audio: '#6BCB77',
  image: '#9B59B6',
  text: '#F1C40F',
  tensor: '#E74C3C',
  prompt: '#3498DB',
}

export default function NodeWorkflowCanvas({
  nodes,
  connections,
  onNodesChange,
  onConnectionsChange,
  onNodeSelect,
  onNodeDoubleClick,
  selectedNodeId,
  accentColor = colors.accent,
  gridSize = 20,
}: NodeWorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [connectingFrom, setConnectingFrom] = useState<{ nodeId: string; portId: string; portType: 'input' | 'output' } | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Handle mouse move for panning and dragging
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = (e.clientX - rect.left - panOffset.x) / zoom
    const y = (e.clientY - rect.top - panOffset.y) / zoom
    setMousePos({ x, y })

    if (isPanning) {
      setPanOffset(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }))
    }

    if (isDragging && draggedNode) {
      const newX = Math.round((x - dragOffset.x) / gridSize) * gridSize
      const newY = Math.round((y - dragOffset.y) / gridSize) * gridSize

      onNodesChange(nodes.map(node =>
        node.id === draggedNode
          ? { ...node, x: newX, y: newY }
          : node
      ))
    }
  }, [isPanning, isDragging, draggedNode, dragOffset, gridSize, zoom, panOffset, nodes, onNodesChange])

  // Handle node drag start
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation()
    if (e.button === 0) { // Left click
      const node = nodes.find(n => n.id === nodeId)
      if (!node) return

      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = (e.clientX - rect.left - panOffset.x) / zoom
      const y = (e.clientY - rect.top - panOffset.y) / zoom

      setDragOffset({ x: x - node.x, y: y - node.y })
      setDraggedNode(nodeId)
      setIsDragging(true)
      onNodeSelect?.(node)
    }
  }

  // Handle canvas pan start
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) { // Middle click or Alt+Left click
      setIsPanning(true)
    } else if (e.button === 0) {
      onNodeSelect?.(null)
      setConnectingFrom(null)
    }
  }

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false)
    setDraggedNode(null)
    setIsPanning(false)
  }

  // Handle port click for connections
  const handlePortClick = (e: React.MouseEvent, nodeId: string, portId: string, portType: 'input' | 'output') => {
    e.stopPropagation()

    if (!connectingFrom) {
      setConnectingFrom({ nodeId, portId, portType })
    } else {
      // Complete connection
      if (connectingFrom.nodeId !== nodeId && connectingFrom.portType !== portType) {
        const newConnection: NodeConnection = {
          id: `conn_${Date.now()}`,
          fromNode: connectingFrom.portType === 'output' ? connectingFrom.nodeId : nodeId,
          fromPort: connectingFrom.portType === 'output' ? connectingFrom.portId : portId,
          toNode: connectingFrom.portType === 'input' ? connectingFrom.nodeId : nodeId,
          toPort: connectingFrom.portType === 'input' ? connectingFrom.portId : portId,
          animated: true,
        }
        onConnectionsChange([...connections, newConnection])
      }
      setConnectingFrom(null)
    }
  }

  // Handle zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.min(Math.max(prev * delta, 0.25), 2))
  }

  // Get port position
  const getPortPosition = (node: WorkflowNode, port: NodePort) => {
    const nodeWidth = node.width || 200
    const nodeHeight = node.height || 80
    const portIndex = port.type === 'input'
      ? node.inputs.findIndex(p => p.id === port.id)
      : node.outputs.findIndex(p => p.id === port.id)
    const totalPorts = port.type === 'input' ? node.inputs.length : node.outputs.length
    const spacing = nodeHeight / (totalPorts + 1)

    return {
      x: node.x + (port.type === 'input' ? 0 : nodeWidth),
      y: node.y + spacing * (portIndex + 1),
    }
  }

  // Render bezier connection path
  const renderConnectionPath = (conn: NodeConnection) => {
    const fromNode = nodes.find(n => n.id === conn.fromNode)
    const toNode = nodes.find(n => n.id === conn.toNode)
    if (!fromNode || !toNode) return null

    const fromPort = fromNode.outputs.find(p => p.id === conn.fromPort)
    const toPort = toNode.inputs.find(p => p.id === conn.toPort)
    if (!fromPort || !toPort) return null

    const start = getPortPosition(fromNode, fromPort)
    const end = getPortPosition(toNode, toPort)

    const dx = Math.abs(end.x - start.x)
    const controlOffset = Math.max(50, dx * 0.4)

    const path = `M ${start.x} ${start.y} C ${start.x + controlOffset} ${start.y}, ${end.x - controlOffset} ${end.y}, ${end.x} ${end.y}`

    return (
      <g key={conn.id}>
        {/* Glow effect */}
        <path
          d={path}
          fill="none"
          stroke={colors.connectionGlow}
          strokeWidth={8}
          style={{ filter: 'blur(4px)' }}
        />
        {/* Main line */}
        <path
          d={path}
          fill="none"
          stroke={colors.connection}
          strokeWidth={2}
          className={conn.animated ? 'animate-pulse' : ''}
        />
        {/* Animated dot */}
        {conn.animated && (
          <circle r={4} fill={colors.connection}>
            <animateMotion dur="2s" repeatCount="indefinite" path={path} />
          </circle>
        )}
      </g>
    )
  }

  // Render temporary connection while dragging
  const renderTempConnection = () => {
    if (!connectingFrom) return null

    const node = nodes.find(n => n.id === connectingFrom.nodeId)
    if (!node) return null

    const port = connectingFrom.portType === 'output'
      ? node.outputs.find(p => p.id === connectingFrom.portId)
      : node.inputs.find(p => p.id === connectingFrom.portId)
    if (!port) return null

    const start = getPortPosition(node, port)
    const end = mousePos

    const isFromOutput = connectingFrom.portType === 'output'
    const dx = Math.abs(end.x - start.x)
    const controlOffset = Math.max(50, dx * 0.4)

    const path = isFromOutput
      ? `M ${start.x} ${start.y} C ${start.x + controlOffset} ${start.y}, ${end.x - controlOffset} ${end.y}, ${end.x} ${end.y}`
      : `M ${end.x} ${end.y} C ${end.x + controlOffset} ${end.y}, ${start.x - controlOffset} ${start.y}, ${start.x} ${start.y}`

    return (
      <path
        d={path}
        fill="none"
        stroke={accentColor}
        strokeWidth={2}
        strokeDasharray="5,5"
        opacity={0.7}
      />
    )
  }

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
      style={{ background: colors.bg }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleCanvasMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Grid background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <defs>
          <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
            <path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              stroke={colors.border}
              strokeWidth={0.5}
              opacity={0.3}
            />
          </pattern>
        </defs>
        <rect width="10000" height="10000" x="-5000" y="-5000" fill="url(#grid)" />
      </svg>

      {/* Canvas transform group */}
      <div
        className="absolute"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Connections SVG */}
        <svg
          className="absolute pointer-events-none"
          style={{ width: '10000px', height: '10000px', left: '-5000px', top: '-5000px' }}
        >
          <g transform="translate(5000, 5000)">
            {connections.map(renderConnectionPath)}
            {renderTempConnection()}
          </g>
        </svg>

        {/* Nodes */}
        {nodes.map(node => (
          <motion.div
            key={node.id}
            className="absolute select-none"
            style={{
              left: node.x,
              top: node.y,
              width: node.width || 200,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
            onDoubleClick={() => onNodeDoubleClick?.(node)}
          >
            {/* Node container */}
            <div
              className="rounded-2xl border transition-all duration-200"
              style={{
                background: colors.surface,
                borderColor: selectedNodeId === node.id ? accentColor : colors.border,
                boxShadow: selectedNodeId === node.id
                  ? `0 0 20px ${colors.accentGlow}, 0 4px 20px rgba(0,0,0,0.4)`
                  : '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              {/* Node header */}
              <div className="flex items-center gap-3 p-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{
                    background: `${node.color || accentColor}22`,
                    border: `1px solid ${node.color || accentColor}44`,
                  }}
                >
                  {node.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate" style={{ color: colors.text }}>
                    {node.title}
                  </div>
                  {node.subtitle && (
                    <div className="text-xs truncate" style={{ color: colors.textMuted }}>
                      {node.subtitle}
                    </div>
                  )}
                </div>
              </div>

              {/* Input ports */}
              {node.inputs.map((port, idx) => {
                const portY = ((node.height || 80) / (node.inputs.length + 1)) * (idx + 1)
                return (
                  <div
                    key={port.id}
                    className="absolute flex items-center gap-2 cursor-pointer group"
                    style={{ left: -8, top: portY - 8 }}
                    onClick={(e) => handlePortClick(e, node.id, port.id, 'input')}
                  >
                    <div
                      className="w-4 h-4 rounded-full border-2 transition-all group-hover:scale-125"
                      style={{
                        background: colors.surface,
                        borderColor: portColors[port.dataType] || portColors.any,
                        boxShadow: connectingFrom?.portId === port.id
                          ? `0 0 10px ${portColors[port.dataType]}`
                          : 'none',
                      }}
                    />
                    <span
                      className="text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                      style={{ color: colors.textMuted }}
                    >
                      {port.label}
                    </span>
                  </div>
                )
              })}

              {/* Output ports */}
              {node.outputs.map((port, idx) => {
                const portY = ((node.height || 80) / (node.outputs.length + 1)) * (idx + 1)
                return (
                  <div
                    key={port.id}
                    className="absolute flex items-center gap-2 cursor-pointer group"
                    style={{ right: -8, top: portY - 8, flexDirection: 'row-reverse' }}
                    onClick={(e) => handlePortClick(e, node.id, port.id, 'output')}
                  >
                    <div
                      className="w-4 h-4 rounded-full border-2 transition-all group-hover:scale-125"
                      style={{
                        background: portColors[port.dataType] || portColors.any,
                        borderColor: portColors[port.dataType] || portColors.any,
                        boxShadow: connectingFrom?.portId === port.id
                          ? `0 0 10px ${portColors[port.dataType]}`
                          : 'none',
                      }}
                    />
                    <span
                      className="text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                      style={{ color: colors.textMuted }}
                    >
                      {port.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Zoom controls */}
      <div
        className="absolute bottom-4 right-4 flex items-center gap-2 p-2 rounded-xl"
        style={{ background: `${colors.surface}ee`, border: `1px solid ${colors.border}` }}
      >
        <button
          onClick={() => setZoom(prev => Math.min(prev * 1.2, 2))}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: colors.textMuted }}
          onMouseEnter={(e) => { e.currentTarget.style.background = colors.surfaceLight }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          +
        </button>
        <span className="text-xs w-12 text-center" style={{ color: colors.textMuted }}>
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(prev => Math.max(prev * 0.8, 0.25))}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: colors.textMuted }}
          onMouseEnter={(e) => { e.currentTarget.style.background = colors.surfaceLight }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          −
        </button>
      </div>

      {/* Instructions overlay */}
      <div
        className="absolute top-4 left-4 text-xs px-3 py-2 rounded-lg"
        style={{ background: `${colors.surface}cc`, color: colors.textDim }}
      >
        Drag nodes • Click ports to connect • Alt+Drag to pan • Scroll to zoom
      </div>
    </div>
  )
}
