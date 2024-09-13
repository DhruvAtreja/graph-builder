import { Handle, Position } from '@xyflow/react'
import type { Node, NodeProps } from '@xyflow/react'
import { useMemo } from 'react'

export type EndNode = Node

export default function EndNode() {
  const randomBorderColor = useMemo(() => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`
  }, [])

  return (
    <div
      className=' rounded-3xl p-[0.5px]  '
      style={{ border: `1px solid ${randomBorderColor}`, backgroundColor: randomBorderColor }}
    >
      <div className='p-3 px-8 rounded-3xl' style={{ color: randomBorderColor, backgroundColor: `rgba(26,26,36,0.8)` }}>
        __end__
      </div>
      <Handle type='target' style={{ width: '10px', height: '10px' }} position={Position.Top} />
    </div>
  )
}
