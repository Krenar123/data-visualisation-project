// functions.js
export function createPieChart(data, containerId, chartTitle) {
    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    // Remove color scale
    // const color = d3.scaleOrdinal(d3.schemeCategory10);

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
        // Use the specified colors
        .attr('fill', (d, i) => i === 0 ? '#FF4E50' : '#83AF9B');

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

export function createBarChartsForArtistsCensoredSongs(data) {
    // Assuming your data is loaded into the 'data' variable

    
    const artists = [...new Set(data.map(d => d.Artist))];
    const artistData = artists.map(artist => {
        const songs = data.filter(d => d.Artist === artist);
        const explicitSongs = songs.filter(d => d.Explicit === 'True');
        const unexplicitSongs = songs.filter(d => d.Explicit === 'False');
        const explicitSongsLength = explicitSongs.length > 0 ? explicitSongs.length : 0;
        const unexplicitSongsLength = unexplicitSongs.length > 0 ? unexplicitSongs.length : 0;
        const totalSongsLength = explicitSongsLength + unexplicitSongsLength;
        return {
            artist,
            explicitSongsLength,
            unexplicitSongsLength,
            totalSongsLength
        };
    });

    // Sort data by mean popularity
    artistData.sort((a, b) => b.explicitSongsLength - a.explicitSongsLength);

    
    const margin = { top: 20, right: 30, bottom: 70, left: 115 };
    const width = 1000 - margin.left - margin.right;
    const height = 850 - margin.top - margin.bottom;

    
    const svg = d3.select("#bar-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    
    const y = d3.scaleBand()
        .domain(artistData.map(d => d.artist))
        .range([0, height])
        .padding(0.1);

    const x = d3.scaleLinear()
        .domain([0, d3.max(artistData, d => Math.max(d.explicitSongsLength, d.unexplicitSongsLength))])
        .range([0, width]);

    
    svg.selectAll(".bar-explicit")
        .data(artistData)
        .enter().append("rect")
        .attr("class", "bar-explicit")
        .attr("y", d => y(d.artist))
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", d => x(d.explicitSongsLength))
        .attr("fill", "#FF4E50");

    
    svg.append("g")
        .call(d3.axisLeft(y));

    
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .text("Total Number of Explicit Songs");
}


export function createGroupedBarChartsForTopArtists(data) {
    
    const artists = [...new Set(data.map(d => d.Artist))];
    
    // Calculate total songs length for each artist
    const artistData = artists.map(artist => {
        const songs = data.filter(d => d.Artist === artist);
        const explicitSongs = songs.filter(d => d.Explicit === 'True');
        const unexplicitSongs = songs.filter(d => d.Explicit === 'False');
        const totalExplicitLength = explicitSongs.length > 0 ? explicitSongs.length : 0;
        const totalUnexplicitLength = unexplicitSongs.length > 0 ? unexplicitSongs.length : 0;

        return {
            artist,
            totalExplicitLength,
            totalUnexplicitLength,
        };
    });

    //console.log(artistData);

    // Sort artists by 'Artist Popularity'
    artistData.sort((a, b) => b.artistPopularity - a.artistPopularity);

    // Take the top 5 artists
    const topArtists = artistData.slice(0, 10);

    //console.log(topArtists);

    
    const margin = { top: 15, right: 30, bottom: 70, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    
    const svg = d3.select("#grouped-bar-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    
    const x = d3.scaleBand()
        .domain(topArtists.map(d => d.artist))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(topArtists, d => Math.max(d.totalExplicitLength, d.totalUnexplicitLength))])
        .range([height, 0]);

    
    svg.selectAll(".bar-explicit")
        .data(topArtists)
        .enter().append("rect")
        .attr("class", "bar-explicit")
        .attr("x", d => x(d.artist))
        .attr("width", x.bandwidth() / 2)
        .attr("y", d => y(d.totalExplicitLength))
        .attr("height", d => height - y(d.totalExplicitLength))
        .attr("fill", "#FF4E50");

    
    svg.selectAll(".bar-unexplicit")
        .data(topArtists)
        .enter().append("rect")
        .attr("class", "bar-unexplicit")
        .attr("x", d => x(d.artist) + x.bandwidth() / 2)
        .attr("width", x.bandwidth() / 2)
        .attr("y", d => y(d.totalUnexplicitLength))
        .attr("height", d => height - y(d.totalUnexplicitLength))
        .attr("fill", "#83AF9B");

    
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

    
    svg.append("g")
        .call(d3.axisLeft(y));


    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - height / 2)
        .attr("y", 0 - margin.left)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Total Songs Length");
}

export function createLineChartForSongsOverYears(data) {
    
    const margin = { top: 20, right: 30, bottom: 70, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    
    const svg = d3.select("#line-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    
    let years = [...new Set(data.map(d => d.Year))];
    years = years.sort(); // Sort the years

    // Calculate counts for explicit and non-explicit songs for each year
    const explicitCounts = years.map(year => {
        const explicitSongs = data.filter(d => d.Explicit === 'True' && d.Year === year);
        return { year, count: explicitSongs.length };
    });

    const unexplicitCounts = years.map(year => {
        const unexplicitSongs = data.filter(d => d.Explicit === 'False' && d.Year === year);
        return { year, count: unexplicitSongs.length };
    });

    
    const x = d3.scaleBand()
        .domain(years)
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max([...explicitCounts, ...unexplicitCounts], d => d.count)])
        .range([height, 0]);

    
    const explicitLine = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.count));

    svg.append("path")
        .data([explicitCounts])
        .attr("class", "line")
        .attr("d", explicitLine)
        .attr("fill", "none")
        .attr("stroke", "#FF4E50");

    
    const unexplicitLine = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.count));

    svg.append("path")
        .data([unexplicitCounts])
        .attr("class", "line")
        .attr("d", unexplicitLine)
        .attr("fill", "none")
        .attr("stroke", "#83AF9B");

    
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

    
    svg.append("g")
        .call(d3.axisLeft(y));

    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .text("Year");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - height / 2)
        .attr("y", 0 - margin.left)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of Songs");

    
    svg.append("text")
        .attr("x", width - 20)
        .attr("y", 20)
        .attr("dy", "0.32em")
        .attr("text-anchor", "end")
        .style("fill", "#FF4E50")
        .text("Explicit Songs");

    svg.append("text")
        .attr("x", width - 20)
        .attr("y", 40)
        .attr("dy", "0.32em")
        .attr("text-anchor", "end")
        .style("fill", "#83AF9B")
        .text("Non-Explicit Songs");
}

export function createLineChartForExplicitPercentageOverYears(data) {
    
    const margin = { top: 20, right: 30, bottom: 70, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    
    const svg = d3.select("#line-chart-popularity")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    
    let years = [...new Set(data.map(d => d.Year))];
    years = years.sort(); // Sort the years

    // Calculate the total mean popularity for each year
    const totalMeanPopularity = years.map(year => {
        const songsInYear = data.filter(d => d.Year === year);
        const explicitSongs = songsInYear.filter(d => d.Explicit === 'True');
        const unexplicitSongs = songsInYear.filter(d => d.Explicit === 'False');
        const explicitMeanPopularity = explicitSongs.length > 0 ? d3.mean(explicitSongs, d => +d.Popularity) : 0;
        const unexplicitMeanPopularity = unexplicitSongs.length > 0 ? d3.mean(unexplicitSongs, d => +d.Popularity) : 0;
        const meanPopularity = explicitMeanPopularity + unexplicitMeanPopularity;
        return { year, meanPopularity, explicitMeanPopularity, unexplicitMeanPopularity };
    });

    // Calculate the mean popularity of explicit songs for each year
    const explicitMeanPopularity = years.map(year => {
        const explicitSongsInYear = data.filter(d => d.Explicit === 'True' && d.Year === year);
        const meanPopularity = explicitSongsInYear.length > 0 ? d3.mean(explicitSongsInYear, d => +d.Popularity) : 0;
        return { year, meanPopularity };
    });

    //console.log(totalMeanPopularity);
    //console.log(explicitMeanPopularity);

    // Calculate the percentage of explicit songs' popularity compared to the total mean popularity for each year
    const percentageData = years.map(year => {
        const totalMean = totalMeanPopularity.find(d => d.year === year).meanPopularity;
        const explicitMean = explicitMeanPopularity.find(d => d.year === year).meanPopularity;
        const percentage = (explicitMean / totalMean) * 100;
        return { year, percentage };
    });

    //console.log(percentageData);

    
    const x = d3.scaleBand()
        .domain(years)
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(percentageData, d => d.percentage)])
        .range([height, 0]);

    
    const percentageLine = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.percentage));

    svg.append("path")
        .data([percentageData])
        .attr("class", "line")
        .attr("d", percentageLine)
        .attr("fill", "none")
        .attr("stroke", "#FF4E50");

    
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

    
    svg.append("g")
        .call(d3.axisLeft(y));

    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .text("Year");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - height / 2)
        .attr("y", 0 - margin.left)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Percentage of Explicit Songs' Popularity");

    
    svg.append("text")
        .attr("x", width - 20)
        .attr("y", 20)
        .attr("dy", "0.32em")
        .attr("text-anchor", "end")
        .style("fill", "#FF4E50")
        .text("Explicit Songs");
}

export function createGroupedBarChartsForFeaturesComparison(data, feature) {
    
    const explicitSongs = data.filter(d => d.Explicit === 'True');
    const unexplicitSongs = data.filter(d => d.Explicit === 'False');

    // Calculate mean values
    const explicitMean = explicitSongs.length > 0 ? d3.mean(explicitSongs, d => +d[feature]) : 0;
    const unexplicitMean = unexplicitSongs.length > 0 ? d3.mean(unexplicitSongs, d => +d[feature]) : 0;

    
    const margin = { top: 20, right: 30, bottom: 70, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    
    const svg = d3.select(`#${feature.toLowerCase()}-comparison-chart`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    
    const x = d3.scaleBand()
        .domain(["Explicit", "Non-Explicit"])
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max([explicitMean, unexplicitMean])])
        .range([height, 0]);

    
    svg.selectAll(".bar")
        .data([explicitMean, unexplicitMean])
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", (d, i) => x(i === 0 ? "Explicit" : "Non-Explicit"))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d))
        .attr("height", d => height - y(d))
        .attr("fill", (d, i) => (i === 0 ? "#FF4E50" : "#83AF9B"));

    
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    
    svg.append("g")
        .call(d3.axisLeft(y));

    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .text(feature);

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - height / 2)
        .attr("y", 0 - margin.left)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Mean Value");
}

export function createLineChartForFeatureThroughYears(data, feature) {
    
    const margin = { top: 20, right: 30, bottom: 70, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    
    const svg = d3.select(`#${feature.toLowerCase()}-line-chart-through-years`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    
    let years = [...new Set(data.map(d => d.Year))];
    years = years.sort(); // Sort the years

    // Calculate mean values for explicit and non-explicit songs for each year
    const explicitMeans = years.map(year => {
        const songsInYear = data.filter(d => d.Year === year && d.Explicit === 'True');
        const mean = songsInYear.length > 0 ? d3.mean(songsInYear, d => +d[feature]) : 0;
        return { year, mean };
    });

    

    const nonExplicitMeans = years.map(year => {
        const songsInYear = data.filter(d => d.Year === year && d.Explicit === 'False');
        const mean = songsInYear.length > 0 ? d3.mean(songsInYear, d => +d[feature]) : 0;
        return { year, mean };
    });

    console.log(feature);
    console.log(explicitMeans);
    console.log(nonExplicitMeans);

    
    const x = d3.scaleBand()
        .domain(years)
        .range([0, width])
        .padding(0.1);

    const y = feature == "Loudness" ? 
        d3.scaleLinear()
            .domain([d3.max([...explicitMeans, ...nonExplicitMeans], d => d.mean), d3.min([...explicitMeans, ...nonExplicitMeans], d => d.mean)])
            .range([height, -9]) : 
        d3.scaleLinear()
            .domain([0, d3.max([...explicitMeans, ...nonExplicitMeans], d => d.mean)])
            .range([height, 0]);


    
    const explicitLine = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.mean));

    svg.append("path")
        .data([explicitMeans])
        .attr("class", "line")
        .attr("d", explicitLine)
        .attr("fill", "none")
        .attr("stroke", "#FF4E50");

    
    const nonExplicitLine = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.mean));

    svg.append("path")
        .data([nonExplicitMeans])
        .attr("class", "line")
        .attr("d", nonExplicitLine)
        .attr("fill", "none")
        .attr("stroke", "#83AF9B");

    
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

    
    svg.append("g")
        .call(d3.axisLeft(y));

    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .text("Year");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - height / 2)
        .attr("y", 0 - margin.left)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(`${feature} Mean Value`);

    
    svg.append("text")
        .attr("x", width - 20)
        .attr("y", 20)
        .attr("dy", "0.32em")
        .attr("text-anchor", "end")
        .style("fill", "#FF4E50")
        .text("Explicit Songs");

    svg.append("text")
        .attr("x", width - 20)
        .attr("y", 40)
        .attr("dy", "0.32em")
        .attr("text-anchor", "end")
        .style("fill", "#83AF9B")
        .text("Non-Explicit Songs");
}
  