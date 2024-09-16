import React from 'react'
import { BaseEdge, EdgeProps, EdgeLabelRenderer, getBezierPath, EdgeText } from '@xyflow/react'
import { useEdgeLabel } from '@/contexts/EdgeLabelContext'

interface SelfConnectingEdgeProps extends EdgeProps {
  data?: {
    onLabelClick: (id: string) => void
  }
}

export default function SelfConnectingEdge(props: SelfConnectingEdgeProps) {
  const { sourceX, sourceY, targetX, targetY, id, markerEnd, label, animated, data } = props
  const { edgeLabels } = useEdgeLabel()

  if (props.source !== props.target) {
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
    })

    return (
      <>
        <BaseEdge {...props} id={id} path={edgePath} markerEnd={markerEnd} />
        {label && animated && (
          <EdgeText
            x={labelX}
            y={labelY}
            label={edgeLabels[id] || (label as string)}
            onClick={(e) => {
              e.stopPropagation()
              props.data?.onLabelClick(id)
            }}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: 8,
              margin: 0,
              zIndex: 1000,
              cursor: 'pointer',
            }}
          />
        )}
      </>
    )
  }

  const edgePath = `M ${sourceX} ${sourceY} A 60 60 0 1 0 ${targetX} ${targetY}`

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} />
      {label && (
        // <EdgeLabelRenderer>
        //   <div
        //     style={{
        //       position: 'absolute',
        //       transform: `translate(-50%, -50%) translate(${sourceX + 100}px,${(sourceY + targetY - 100) / 2}px)`,
        //       background: '#ffcc00',
        //       padding: 8,
        //       borderRadius: 5,
        //       fontSize: 8,
        //       fontWeight: 700,
        //     }}
        //     className='nodrag nopan'
        //   >
        //     {label}
        //   </div>
        // </EdgeLabelRenderer>
        <EdgeText
          x={sourceX + 100}
          y={sourceY - 70}
          label={edgeLabels[id] || (label as string)}
          onClick={(e) => {
            e.stopPropagation()
            props.data?.onLabelClick(id)
          }}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            padding: 8,
            margin: 0,
            zIndex: 1000,
            cursor: 'pointer',
          }}
        />
      )}
    </>
  )
}
