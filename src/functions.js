// functions.js
export function createPieChart(data, containerId, chartTitle) {
    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3.pie().value(d => d.percentage);
    const path = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    const arc = svg.selectAll('.arc')
        .data(pie(data))
        .enter()
        .append('g')
        .attr('class', 'arc');

    arc.append('path')
        .attr('d', path)
        .attr('fill', (d, i) => color(i));

    arc.append('text')
        .attr('transform', d => `translate(${path.centroid(d)})`)
        .attr('dy', '.35em')
        .style('text-anchor', 'middle')
        .text(d => `${d.data.label}: ${d.data.percentage.toFixed(2)}%`);

    // Add chart title
    svg.append('text')
        .attr('x', 0)
        .attr('y', -height / 2 - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text(chartTitle);
};

export function createBarChartsForArtistsCensoredSongs(data){
    // Assuming your data is loaded into the 'data' variable

// Extract relevant data
const artists = [...new Set(data.map(d => d.Artist))];
const artistData = artists.map(artist => {
    const songs = data.filter(d => d.Artist === artist);
    const explicitSongs = songs.filter(d => d.Explicit === 'True');
    const unexplicitSongs = songs.filter(d => d.Explicit === 'False');
    const explicitSongsLength = explicitSongs.length > 0 ? explicitSongs.length : 0;
    const unexplicitSongsLength = unexplicitSongs.legnth > 0 ? unexplicitSongs.length : 0;
    const totalSongsLength = explicitSongsLength + unexplicitSongsLength;
    //const explicitMeanPopularity = explicitSongs.length > 0 ? d3.mean(explicitSongs, d => +d.Popularity) : 0;
    //const unexplicitMeanPopularity = unexplicitSongs d3.mean(unexplicitSongs, d => +d.Popularity) : 0;
    //const totalMeanPopularity = explicitMeanPopularity + unexplicitMeanPopularity;
    //const explicitMeanPopularityPercentage = (explicitMeanPopularity / totalMeanPopularity) * 100;
    //const unexplicitMeanPopularityPercentage = (unexplicitMeanPopularity / totalMeanPopularity) * 100;
    return {
        artist,
        explicitSongsLength,
        unexplicitSongsLength,
        totalSongsLength
    };
});

// Sort data by mean popularity
artistData.sort((a, b) => b.explicitSongsLength - a.explicitSongsLength);


// Set up the dimensions of the chart
const margin = { top: 20, right: 30, bottom: 70, left: 60 };
const width = 1600 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Create SVG container
const svg = d3.select("#bar-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Set up scales
const x = d3.scaleBand()
    .domain(artistData.map(d => d.artist))
    .range([0, width])
    .padding(0.1);

const y = d3.scaleLinear()
    .domain([0, d3.max(artistData, d => Math.max(0, d.totalSongsLength))])
    .range([height, 0]);

// Draw bars for explicit
svg.selectAll(".bar-explicit")
    .data(artistData)
    .enter().append("rect")
    .attr("class", "bar-explicit")
    .attr("x", d => x(d.artist))
    .attr("width", x.bandwidth())
    .attr("y", d => y(d.explicitSongsLength))
    .attr("height", d => height - y(d.explicitSongsLength))
    .attr("fill", "red");


// Draw x-axis
svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-45)");

// Draw y-axis
svg.append("g")
    .call(d3.axisLeft(y));

// Add labels
svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .style("text-anchor", "middle")
    .text("Artist");

svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - height / 2)
    .attr("y", 0 - margin.left)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Total Number of Explicit Songs");

}
  