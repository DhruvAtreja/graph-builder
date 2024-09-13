import { Handle, Position } from '@xyflow/react'
import type { Node as NodeType, NodeProps } from '@xyflow/react'
import { useCallback, useState, useMemo } from 'react'
import Modal from '../Modal'
import { useButtonText } from '@/contexts/ButtonTextContext'

export type CustomNodeData = {
  label: string
}

export type CustomNode = NodeType<CustomNodeData>

export default function CustomNode({ data, id }: NodeProps<CustomNode>) {
  const [showModal, setShowModal] = useState(false)
  const { buttonTexts, updateButtonText } = useButtonText()

  const randomBorderColor = useMemo(() => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`
  }, [])

  const onClick = useCallback((event: React.MouseEvent) => {
    console.log('onClick', event)
    setShowModal(true)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateButtonText(id, e.target.value)
  }

  return (
    <div
      className=' rounded-md '
      style={{ border: `2px solid ${randomBorderColor}`, backgroundColor: randomBorderColor }}
      onClick={onClick}
    >
      <input
        type='text'
        className='w-full outline-none rounded-md text-center p-2 text-white'
        value={buttonTexts[id] || data.label}
        onChange={handleInputChange}
        style={{
          backgroundColor: `rgba(26,26,36,0.8)`,
          color: randomBorderColor,
        }}
      />

      <Handle type='source' position={Position.Bottom} />
      <Handle type='target' position={Position.Top} />
    </div>
  )
}
