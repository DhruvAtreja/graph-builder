import Flow from './Flow'
import { ReactFlowProvider } from '@xyflow/react'
import { ReactFlowProvider as ReactFlowProviderFlow } from 'reactflow'
import { EdgeLabelProvider } from '@/contexts/EdgeLabelContext'
import { ButtonTextProvider } from '@/contexts/ButtonTextContext'

export default function Page() {
  return (
    <ReactFlowProvider>
      <ReactFlowProviderFlow>
        <ButtonTextProvider>
          <EdgeLabelProvider>
            <Flow />
          </EdgeLabelProvider>
        </ButtonTextProvider>
      </ReactFlowProviderFlow>
    </ReactFlowProvider>
  )
}
