import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function ClusterScatter({ data, onSelect }) {
  const ref = useRef(null);

  useEffect(() => {
    const points = data?.points ?? [];

    if (!points.length) return;

    const width = 760;
    const height = 520;
    const margin = {
      top: 35,
      right: 25,
      bottom: 55,
      left: 65
    };

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const xExtent = d3.extent(points, d => Number(d.x));
    const yExtent = d3.extent(points, d => Number(d.y));

    const x = d3.scaleLinear()
      .domain(xExtent)
      .nice()
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain(yExtent)
      .nice()
      .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal(d3.schemeTableau10);

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 12)
      .attr('text-anchor', 'middle')
      .attr('class', 'axis-label')
      .text('Projection Dimension 1');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 18)
      .attr('text-anchor', 'middle')
      .attr('class', 'axis-label')
      .text('Projection Dimension 2');

    svg.append('g')
      .selectAll('circle')
      .data(points)
      .join('circle')
      .attr('cx', d => x(Number(d.x)))
      .attr('cy', d => y(Number(d.y)))
      .attr('r', 3)
      .attr('fill', d => color(d.cluster))
      .attr('opacity', 0.65)
      .on('click', (_, d) => onSelect?.(d.cluster))
      .append('title')
      .text(d =>
        `Cluster ${d.cluster}\n${d.occupation}, ${d.gender}, ${d.country}\nStress: ${d.stress}\nTreatment: ${d.treatment}`
      );

    const clusters = [...new Set(points.map(d => d.cluster))]
      .sort((a, b) => Number(a) - Number(b));

    const legend = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    clusters.forEach((cluster, i) => {
      const g = legend.append('g')
        .attr('transform', `translate(${i * 90},0)`);

      g.append('circle')
        .attr('r', 5)
        .attr('fill', color(cluster));

      g.append('text')
        .attr('x', 10)
        .attr('y', 4)
        .attr('font-size', 11)
        .text(`Cluster ${cluster}`);
    });
  }, [data, onSelect]);

  return <svg className="scatter" ref={ref} />;
}