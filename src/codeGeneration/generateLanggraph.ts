import { type CustomNodeType } from '@/components/nodes'
import { type CustomEdgeType } from '@/components/edges'

export function generateLanggraphCode(
  nodes: CustomNodeType[],
  edges: CustomEdgeType[],
  buttonTexts: { [key: string]: string },
): string {
  // Helper function to get node label
  const getNodeLabel = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId)
    const buttonText = buttonTexts[nodeId]
    return (buttonText || (node?.data?.label as string) || nodeId).replace(/\s+/g, '_')
  }

  // Generate imports
  const imports = [
    'from langgraph.graph import StateGraph',
    'from langgraph.graph import END',
    'from typing_extensions import TypedDict',
    '\n',
  ]

  // Generate function definitions
  const functions = nodes
    .filter((node) => node.type !== 'source' && node.type !== 'end')
    .map((node) => `def ${(node.data.label as string).replace(/\s+/g, '_')}(self, args) -> dict:\n    return args\n`)

  // Generate conditional functions
  const conditionalFunctions = new Map()
  edges
    .filter((edge) => edge.animated)
    .forEach((edge) => {
      const sourceLabel = getNodeLabel(edge.source)
      const targetLabel = getNodeLabel(edge.target)
      if (!conditionalFunctions.has(sourceLabel)) {
        conditionalFunctions.set(sourceLabel, new Set())
      }
      conditionalFunctions.get(sourceLabel).add(targetLabel)
    })

  const conditionalFunctionStrings = Array.from(conditionalFunctions.entries()).map(([sourceLabel, targets]) => {
    const targetStrings = Array.from(targets)
      .map((target) => `    # return "${target}"`)
      .join('\n')
    return `def conditional_${sourceLabel}(self, args) -> str:\n${targetStrings}\n    return END\n`
  })

  // Generate State class
  const stateClass = ['class State(TypedDict):', '    # add state', '    sample_state_variable: str', '\n']

  // Generate create_workflow function
  const workflowFunction = [
    'def create_workflow(self) -> StateGraph:',
    '    """Create and configure the workflow graph."""',
    '    workflow = StateGraph(State) # add state',
    '',
    '    # Add nodes to the graph',
  ]

  nodes
    .filter((node) => node.type !== 'source' && node.type !== 'end')
    .forEach((node) => {
      workflowFunction.push(
        `    workflow.add_node("${(node.data.label as string).replace(/\s+/g, '_')}", ${(
          node.data.label as string
        ).replace(/\s+/g, '_')})`,
      )
    })

  workflowFunction.push('', '    # Define edges')

  const processedConditionalEdges = new Set()

  edges.forEach((edge) => {
    const sourceLabel = getNodeLabel(edge.source)
    const targetLabel = getNodeLabel(edge.target)
    if (edge.animated) {
      if (!processedConditionalEdges.has(sourceLabel)) {
        workflowFunction.push(`    workflow.add_conditional_edges("${sourceLabel}", conditional_${sourceLabel})`)
        processedConditionalEdges.add(sourceLabel)
      }
    } else {
      if (targetLabel === 'end') {
        workflowFunction.push(`    workflow.add_edge("${sourceLabel}", END)`)
      } else {
        if (sourceLabel != 'source') workflowFunction.push(`    workflow.add_edge("${sourceLabel}", "${targetLabel}")`)
      }
    }
  })

  const startNode = nodes.find((node) => {
    const sourceNode = nodes.find((n) => n.type === 'source')
    return edges.some((edge) => edge.source === sourceNode?.id && edge.target === node.id)
  })
  if (startNode) {
    workflowFunction.push(`    workflow.set_entry_point("${getNodeLabel(startNode.id)}")`)
  }
  workflowFunction.push('\n    return workflow')

  // Generate additional utility functions
  const utilityFunctions = [
    'def returnGraph(self):',
    '    """Return the graph."""',
    '    return self.create_workflow().compile()',
    '',
    'def run_sql_agent(self, args) -> dict:',
    '    """Run the SQL agent workflow."""',
    '    app = self.create_workflow().compile()',
    '    result = app.invoke(args)',
    '    return result',
  ]

  // Combine all parts
  const codeParts = [
    ...imports,
    ...functions,
    ...conditionalFunctionStrings,
    ...stateClass,
    ...workflowFunction,
    ...utilityFunctions,
  ]

  return codeParts.join('\n')
}
