import Flow from './Flow'
import { ReactFlowProvider } from '@xyflow/react'
import { ButtonTextProvider } from '@/contexts/ButtonTextContext'

export default function Page() {
  return (
    <ReactFlowProvider>
      <ButtonTextProvider>
        <Flow />
      </ButtonTextProvider>
    </ReactFlowProvider>
  )
}
