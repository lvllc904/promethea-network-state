
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Ecosystem, NodeData, LinkData, Category } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface MindMapProps {
  data: Ecosystem;
  onNodeClick: (node: NodeData) => void;
  selectedNodeId?: string;
}

const MindMap: React.FC<MindMapProps> = ({ data, onNodeClick, selectedNodeId }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<SVGGElement>(null);
  const simulationRef = useRef<d3.Simulation<NodeData, LinkData> | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Initial Setup
    if (!containerRef.current) {
      const g = svg.append('g').attr('class', 'main-container');
      containerRef.current = g.node();

      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        });
      svg.call(zoom);

      simulationRef.current = d3.forceSimulation<NodeData>()
        .force('link', d3.forceLink<NodeData, LinkData>().id((d: any) => d.id).distance((d: any) => d.isGap ? 180 : 120))
        .force('charge', d3.forceManyBody().strength(-1200))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(80));
    }

    const g = d3.select(containerRef.current);
    const simulation = simulationRef.current!;

    // Create deep copies and validate links to prevent crashes
    const nodes: NodeData[] = data.nodes.map(n => ({ ...n }));
    const nodeIds = new Set(nodes.map(n => n.id));
    
    // Defensive filtering: ensure links only connect to existing nodes
    const links: any[] = data.links
      .filter(l => {
        const sourceId = typeof l.source === 'string' ? l.source : (l.source as any).id;
        const targetId = typeof l.target === 'string' ? l.target : (l.target as any).id;
        return nodeIds.has(sourceId) && nodeIds.has(targetId);
      })
      .map(l => ({ ...l }));

    simulation.nodes(nodes as any);
    (simulation.force('link') as d3.ForceLink<any, any>).links(links);
    simulation.alpha(0.5).restart();

    // LINKS
    const link = g.selectAll<SVGLineElement, any>('.link-line')
      .data(links, (d: any) => {
        const s = typeof d.source === 'object' ? d.source.id : d.source;
        const t = typeof d.target === 'object' ? d.target.id : d.target;
        return `${s}-${t}`;
      });

    link.exit().transition().duration(300).attr('opacity', 0).remove();

    const linkEnter = link.enter().append('line')
      .attr('class', (d: any) => `link-line ${d.isGap ? 'gap-link' : ''}`)
      .attr('stroke', (d: any) => d.isGap ? '#ef4444' : (d.isInternal ? '#a855f7' : '#374151'))
      .attr('stroke-width', (d: any) => d.isInternal ? 1 : 2)
      .attr('opacity', 0);

    linkEnter.transition().duration(500).attr('opacity', 0.5);

    const mergedLinks = linkEnter.merge(link);

    // NODES
    const node = g.selectAll<SVGGElement, any>('.node')
      .data(nodes, (d: any) => d.id);

    node.exit().transition().duration(300).attr('opacity', 0).remove();

    const nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .attr('opacity', 0)
      .on('click', (event, d) => onNodeClick(d as any))
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    nodeEnter.transition().duration(500).attr('opacity', 1);

    nodeEnter.append('circle')
      .attr('r', (d: any) => d.id === 'promethea' ? 32 : (d.isInternal ? 16 : 12))
      .attr('fill', (d: any) => d.isGap ? '#ef4444' : (CATEGORY_COLORS[d.category as Category] || '#9ca3af'))
      .attr('stroke', (d: any) => d.id === 'promethea' ? '#fde047' : 'rgba(255,255,255,0.1)')
      .attr('stroke-width', 3)
      .attr('filter', (d: any) => d.id === 'promethea' ? 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.4))' : 'none');

    nodeEnter.append('text')
      .attr('class', 'node-label')
      .attr('dy', (d: any) => d.id === 'promethea' ? 50 : 30)
      .attr('text-anchor', 'middle')
      .attr('fill', '#f3f4f6')
      .style('font-size', (d: any) => d.id === 'promethea' ? '14px' : '10px')
      .style('font-weight', '700')
      .style('text-shadow', '0 2px 4px rgba(0,0,0,0.8)')
      .text((d: any) => d.name);

    const mergedNodes = nodeEnter.merge(node);

    // Update highlights
    mergedNodes.selectAll('circle')
      .attr('stroke', (d: any) => d.id === selectedNodeId ? '#fff' : (d.id === 'promethea' ? '#fde047' : 'rgba(255,255,255,0.1)'))
      .attr('stroke-width', (d: any) => d.id === selectedNodeId ? 4 : 3);

    simulation.on('tick', () => {
      mergedLinks
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      mergedNodes
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      // No manual stop needed as simulation is persistent in ref for transitions
    };
  }, [data, onNodeClick, selectedNodeId]);

  return (
    <div className="w-full h-full bg-gray-950 overflow-hidden relative">
      <svg ref={svgRef} className="w-full h-full block"></svg>
    </div>
  );
};

export default MindMap;
