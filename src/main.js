import { createPieChart, createBarChartsForArtistsCensoredSongs,
    createGroupedBarChartsForTopArtists, createLineChartForSongsOverYears,
    createLineChartForExplicitPercentageOverYears, createGroupedBarChartsForFeaturesComparison,
    createLineChartForFeatureThroughYears } from './functions';

d3.csv('./data/albanian_songs.csv').then(data => {
    // Extract relevant data
    const totalSongs = data.length;
    
    const explicitSongs = data.filter(d => d['Explicit'] === 'True');
    const unexplicitSongs = data.filter(d => d['Explicit'] === 'False');
    const explicitMeanPopularity = d3.mean(explicitSongs, d => +d['Popularity']);
    const unexplicitMeanPopularity = d3.mean(unexplicitSongs, d => +d['Popularity']);

    const totalMeanPopularity = explicitMeanPopularity + unexplicitMeanPopularity;

    const explicitData = [
        { label: 'Explicit', percentage: (explicitSongs.length / totalSongs) * 100 },
        { label: 'Not Explicit', percentage: (unexplicitSongs.length / totalSongs) * 100 },
    ];

    const meanPopularityData = [
        { label: 'Explicit', percentage: (explicitMeanPopularity/ totalMeanPopularity) * 100 },
        { label: 'Not Explicit', percentage: (unexplicitMeanPopularity / totalMeanPopularity) * 100 },
    ];

    // Call functions to create charts
    createPieChart(explicitData, 'explicit-chart', 'Explicit vs Not Explicit');
    createPieChart(meanPopularityData, 'popularity-chart', 'Song Popularity');
    
    createBarChartsForArtistsCensoredSongs(data);
    createGroupedBarChartsForTopArtists(data);

    createLineChartForSongsOverYears(data);
    createLineChartForExplicitPercentageOverYears(data);

    createGroupedBarChartsForFeaturesComparison(data, 'Danceability');
    createGroupedBarChartsForFeaturesComparison(data, 'Loudness');
    createGroupedBarChartsForFeaturesComparison(data, 'Energy');
    createGroupedBarChartsForFeaturesComparison(data, 'Valence');

    createLineChartForFeatureThroughYears(data, 'Danceability');
    createLineChartForFeatureThroughYears(data, 'Loudness');
    createLineChartForFeatureThroughYears(data, 'Energy');
    createLineChartForFeatureThroughYears(data, 'Valence');
}).catch(error => {
    console.error('Error loading CSV:', error);
});


