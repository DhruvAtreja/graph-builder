import { type CustomNodeType } from '@/components/nodes'
import { type CustomEdgeType } from '@/components/edges'

export interface CodeGenerationResult {
  code: string
  nodes: CustomNodeType[]
  edges: CustomEdgeType[]
}
