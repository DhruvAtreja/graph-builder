import { Handle, Position } from '@xyflow/react'
import type { Node as NodeType, NodeProps } from '@xyflow/react'
import { useCallback, useState, useMemo, useRef, useEffect } from 'react'
import { useButtonText } from '@/contexts/ButtonTextContext'

export type CustomNodeData = {
  label: string
}

export type CustomNode = NodeType<CustomNodeData>

export default function CustomNode({ data, id }: NodeProps<CustomNode>) {
  const { buttonTexts, updateButtonText } = useButtonText()
  const [nodeWidth, setNodeWidth] = useState(150) // Default width
  const inputRef = useRef<HTMLInputElement>(null)

  const randomBorderColor = useMemo(() => {
    const hue = Math.floor(Math.random() * 360)
    const saturation = 70 + Math.random() * 30
    const lightness = 60 + Math.random() * 20
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateButtonText(id, e.target.value)
    adjustNodeSize()
  }

  const adjustNodeSize = useCallback(() => {
    if (inputRef.current) {
      const textWidth = inputRef.current.scrollWidth
      const newWidth = Math.max(150, textWidth) // 20px for padding
      setNodeWidth(newWidth)
    }
  }, [])

  useEffect(() => {
    updateButtonText(id, data.label)
  }, [])

  useEffect(() => {
    adjustNodeSize()
  }, [buttonTexts[id], adjustNodeSize])

  return (
    <div className='rounded-md p-0 ' style={{ backgroundColor: randomBorderColor, border: 'none' }}>
      <div
        className='rounded-md p-2'
        style={{
          border: `2px solid ${randomBorderColor}`,
          backgroundColor: 'rgba(26,26,36,0.8)',
          width: `${nodeWidth}px`,
        }}
      >
        <input
          ref={inputRef}
          type='text'
          className='w-full outline-none rounded-md text-center p-0 text-white'
          value={buttonTexts[id]}
          onChange={handleInputChange}
          style={{
            backgroundColor: 'transparent',
            color: randomBorderColor,
            width: '100%',
          }}
        />

        <Handle type='source' style={{ width: '10px', height: '10px' }} position={Position.Bottom} />
        <Handle type='target' style={{ width: '10px', height: '10px' }} position={Position.Top} />
      </div>
    </div>
  )
}
