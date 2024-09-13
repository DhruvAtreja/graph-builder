import Flow from './Flow'
import { ReactFlowProvider } from '@xyflow/react'
import { ReactFlowProvider as ReactFlowProviderFlow } from 'reactflow'

import { ButtonTextProvider } from '@/contexts/ButtonTextContext'

export default function Page() {
  return (
    <ReactFlowProvider>
      <ReactFlowProviderFlow>
        <ButtonTextProvider>
          <Flow />
        </ButtonTextProvider>
      </ReactFlowProviderFlow>
    </ReactFlowProvider>
  )
}
