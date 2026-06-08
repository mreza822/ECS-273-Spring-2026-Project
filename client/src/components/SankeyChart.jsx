import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

export default function SankeyChart({ data }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!data?.nodes?.length || !data?.links?.length) return;

    const width = 980;
    const height = 590;
    const margin = {
      top: 45,
      right: 35,
      bottom: 55,
      left: 35
    };

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const graph = {
      nodes: data.nodes.map(d => ({ ...d })),
      links: data.links.map(d => ({ ...d }))
    };

    const layout = sankey()
      .nodeWidth(24)
      .nodePadding(18)
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom]
      ]);

    layout(graph);

    const color = d3.scaleOrdinal()
      .domain([0, 1, 2, 3])
      .range(['#60a5fa', '#34d399', '#fbbf24', '#f87171']);

    svg.append('g')
      .attr('fill', 'none')
      .selectAll('path')
      .data(graph.links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', d => color(d.source.stage))
      .attr('stroke-opacity', 0.28)
      .attr('stroke-width', d => Math.max(1, d.width))
      .append('title')
      .text(d => `${d.source.name} → ${d.target.name}\n${d.value.toLocaleString()} respondents`);

    const node = svg.append('g')
      .selectAll('g')
      .data(graph.nodes)
      .join('g');

    node.append('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('height', d => Math.max(1, d.y1 - d.y0))
      .attr('width', d => d.x1 - d.x0)
      .attr('rx', 5)
      .attr('fill', d => color(d.stage))
      .attr('opacity', 0.9);

    node.append('text')
      .attr('x', d => d.x0 < width / 2 ? d.x1 + 8 : d.x0 - 8)
      .attr('y', d => (d.y0 + d.y1) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
      .attr('font-size', 12)
      .text(d => d.name);

    const layerLabels = [
      { label: 'Family History', stage: 0 },
      { label: 'Growing Stress', stage: 1 },
      { label: 'Coping Struggles', stage: 2 },
      { label: 'Treatment', stage: 3 }
    ];

    const stageX = d3.rollups(
      graph.nodes,
      values => d3.mean(values, d => (d.x0 + d.x1) / 2),
      d => d.stage
    );

    const stageMap = new Map(stageX);

    svg.append('g')
      .selectAll('text')
      .data(layerLabels)
      .join('text')
      .attr('x', d => stageMap.get(d.stage) ?? width / 2)
      .attr('y', height - 16)
      .attr('text-anchor', 'middle')
      .attr('font-size', 13)
      .attr('font-weight', 700)
      .attr('fill', '#475569')
      .text(d => d.label);
  }, [data]);

  return <svg className="sankey" ref={ref} />;
}