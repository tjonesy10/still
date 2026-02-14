import { useMemo } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { useStore } from '@/stores'

export function GraphView() {
  const notes = useStore((state) => state.notes)
  const links = useStore((state) => state.links)
  const setSelectedNoteId = useStore((state) => state.setSelectedNoteId)

  const graphData = useMemo(() => {
    const nodes = Array.from(notes.values()).map((note) => {
      const backlinks = Array.from(links.values()).filter(
        (link) => link.targetNoteId === note.id
      )

      return {
        id: note.id,
        name: note.title || 'Untitled',
        val: backlinks.length + 1,
      }
    })

    const graphLinks = Array.from(links.values())
      .filter((link) => link.targetNoteId)
      .map((link) => ({
        source: link.sourceNoteId,
        target: link.targetNoteId!,
      }))

    return { nodes, links: graphLinks }
  }, [notes, links])

  if (graphData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-secondary">
        Create some notes with [[wiki-links]] to see the graph.
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="name"
        nodeAutoColorBy="val"
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={2}
        d3VelocityDecay={0.3}
        cooldownTime={3000}
        onNodeClick={(node: any) => {
          setSelectedNoteId(node.id as string)
        }}
        nodeCanvasObject={(node: any, ctx: any, globalScale: number) => {
          const label = node.name as string
          const fontSize = 12 / globalScale
          ctx.font = `${fontSize}px Sans-Serif`
          const textWidth = ctx.measureText(label).width
          const bckgDimensions = [textWidth, fontSize].map((n: number) => n + fontSize * 0.2)

          ctx.fillStyle = '#C7CDD6'
          ctx.beginPath()
          ctx.arc(node.x!, node.y!, (node.val as number) * 2, 0, 2 * Math.PI, false)
          ctx.fill()

          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
          ctx.fillRect(
            node.x! - bckgDimensions[0] / 2,
            node.y! + (node.val as number) * 2 + 2,
            bckgDimensions[0],
            bckgDimensions[1]
          )

          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = '#1C1C1C'
          ctx.fillText(
            label,
            node.x!,
            node.y! + (node.val as number) * 2 + 2 + fontSize / 2
          )
        }}
      />
    </div>
  )
}
