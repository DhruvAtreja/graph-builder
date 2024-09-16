import { Handle, Position } from '@xyflow/react'
import type { Node, NodeProps } from '@xyflow/react'
import { useMemo } from 'react'

export type SourceNodeData = {
  label: string
}

export type SourceNode = Node<SourceNodeData>

export default function SourceNode({ data }: NodeProps<SourceNode>) {
  const randomBorderColor = useMemo(() => {
    const hue = Math.floor(Math.random() * 360)
    const saturation = 70 + Math.random() * 30
    const lightness = 60 + Math.random() * 20
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }, [])

  return (
    <div
      className=' rounded-3xl p-[0.5px]  '
      style={{ border: `1px solid ${randomBorderColor}`, backgroundColor: randomBorderColor }}
    >
      <div className='p-3 px-8 rounded-3xl' style={{ color: randomBorderColor, backgroundColor: `rgba(26,26,36,0.8)` }}>
        __start__
      </div>
      <Handle type='source' style={{ width: '10px', height: '10px' }} position={Position.Bottom} />
    </div>
  )
}
