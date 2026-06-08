import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function GroupedBarChart({
  data,
  title,
  categories,
  yLabel = '% of respondents'
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!data?.length) return;

    const width = 520;
    const height = 310;
    const margin = {
      top: 45,
      right: 20,
      bottom: 75,
      left: 60
    };

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const groups = [...new Set(data.map(d => d.group))];

    const x0 = d3.scaleBand()
      .domain(groups)
      .range([margin.left, width - margin.right])
      .padding(0.18);

    const x1 = d3.scaleBand()
      .domain(categories)
      .range([0, x0.bandwidth()])
      .padding(0.08);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => Number(d.percentage)) || 100])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal()
      .domain(categories)
      .range(['#60a5fa', '#fbbf24', '#f87171', '#34d399', '#a78bfa']);

    svg.append('text')
      .attr('class', 'chart-title')
      .attr('x', margin.left)
      .attr('y', 24)
      .text(title);

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x0))
      .selectAll('text')
      .attr('transform', 'rotate(-35)')
      .style('text-anchor', 'end');

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`));

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 16)
      .attr('text-anchor', 'middle')
      .attr('class', 'axis-label')
      .text(yLabel);

    svg.append('g')
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', d => x0(d.group) + x1(d.category))
      .attr('y', d => y(Number(d.percentage)))
      .attr('width', x1.bandwidth())
      .attr('height', d => y(0) - y(Number(d.percentage)))
      .attr('rx', 4)
      .attr('fill', d => color(d.category))
      .append('title')
      .text(d => `${d.group} / ${d.category}: ${d.percentage}% (${d.count})`);

    const legend = svg.append('g')
      .attr('transform', `translate(${margin.left},${height - 20})`);

    categories.forEach((category, i) => {
      const g = legend.append('g')
        .attr('transform', `translate(${i * 105},0)`);

      g.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', color(category));

      g.append('text')
        .attr('x', 15)
        .attr('y', 9)
        .attr('font-size', 11)
        .text(category);
    });
  }, [data, title, categories, yLabel]);

  return <svg className="chart" ref={ref} />;
}