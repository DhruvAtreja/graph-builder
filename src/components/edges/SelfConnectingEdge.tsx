import React from 'react'
import { BaseEdge, BezierEdge, EdgeProps, BaseEdgeProps } from '@xyflow/react'

export default function SelfConnectingEdge(props: EdgeProps) {
  if (props.source !== props.target) {
    return <BezierEdge {...props} />
  }

  const { sourceX, sourceY, targetX, targetY, id, markerEnd } = props
  const edgePath = `M ${sourceX} ${sourceY} A 60 60 0 1 0 ${targetX} ${targetY}`

  return <BaseEdge path={edgePath} markerEnd={markerEnd} />
}
