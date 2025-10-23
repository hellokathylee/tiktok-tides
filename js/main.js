// Global variables
let allData = {};
let currentYear = '2019';
const width = 1200;
const height = 800;
let animationRunning = true;
let startTime = Date.now();

// Load all CSV files
Promise.all([
    d3.csv('data/TikTok_songs_2019.csv'),
    d3.csv('data/TikTok_songs_2020.csv'),
    d3.csv('data/TikTok_songs_2021.csv'),
    d3.csv('data/TikTok_songs_2022.csv')
]).then(([data2019, data2020, data2021, data2022]) => {
    allData = {
        '2019': processData(data2019),
        '2020': processData(data2020),
        '2021': processData(data2021),
        '2022': processData(data2022)
    };
    
    // Initialize visualization
    createSolarSystem();
    updateVisualization();
    
    // Set up year selector event listeners
    d3.selectAll('.year-btn').on('click', function() {
        currentYear = d3.select(this).attr('data-year');
        
        // Update button styles
        d3.selectAll('.year-btn')
            .classed('btn-primary', false)
            .classed('btn-outline-primary', true);
        d3.select(this)
            .classed('btn-primary', true)
            .classed('btn-outline-primary', false);
        
        // Reset animation timing for smooth transition
        startTime = Date.now();
        
        // Update visualization
        updateVisualization();
    });
}).catch(error => {
    console.error('Error loading data:', error);
});

// Process data: aggregate by artist
function processData(data) {
    const artistMap = new Map();
    
    data.forEach(song => {
        const artist = song.artist_name;
        const danceability = parseFloat(song.danceability);
        const energy = parseFloat(song.energy);
        
        if (!artistMap.has(artist)) {
            artistMap.set(artist, {
                name: artist,
                songs: [],
                danceabilities: [],
                energies: []
            });
        }
        
        const artistData = artistMap.get(artist);
        artistData.songs.push(song.track_name);
        artistData.danceabilities.push(danceability);
        artistData.energies.push(energy);
    });
    
    // Calculate averages and return as array
    return Array.from(artistMap.values()).map(artist => ({
        name: artist.name,
        songCount: artist.songs.length,
        avgDanceability: d3.mean(artist.danceabilities),
        avgEnergy: d3.mean(artist.energies),
        songs: artist.songs
    }));
}

// Map danceability (0-1) to rainbow color
function danceabilityToColor(danceability) {
    // Rainbow gradient: Red (0.0) -> Orange (0.15) -> Yellow (0.3) -> Green (0.45) -> Cyan (0.6) -> Blue (0.75) -> Purple (0.9+)
    const colors = [
        { value: 0.0, color: '#FF0000' },  // Red
        { value: 0.15, color: '#FF7F00' }, // Orange
        { value: 0.3, color: '#FFFF00' },  // Yellow
        { value: 0.45, color: '#00FF00' }, // Green
        { value: 0.6, color: '#00FFFF' },  // Cyan
        { value: 0.75, color: '#0000FF' }, // Blue
        { value: 0.9, color: '#8B00FF' },  // Purple
        { value: 1.0, color: '#FF00FF' }   // Magenta
    ];
    
    // Find the two colors to interpolate between
    for (let i = 0; i < colors.length - 1; i++) {
        if (danceability >= colors[i].value && danceability <= colors[i + 1].value) {
            const t = (danceability - colors[i].value) / (colors[i + 1].value - colors[i].value);
            return d3.interpolateRgb(colors[i].color, colors[i + 1].color)(t);
        }
    }
    
    return colors[colors.length - 1].color;
}

// Create the SVG container
function createSolarSystem() {
    const svg = d3.select('#solar-system')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');
    
    // Create groups for orbits and planets
    svg.append('g').attr('id', 'orbits');
    svg.append('g').attr('id', 'planets');
    
    // Draw the sun in the center
    svg.append('circle')
        .attr('class', 'sun')
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .attr('r', 40)
        .attr('fill', 'url(#sunGradient)');
    
    // Create sun gradient
    const defs = svg.append('defs');
    const sunGradient = defs.append('radialGradient')
        .attr('id', 'sunGradient');
    sunGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#FFD700');
    sunGradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', '#FFA500');
    sunGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#FF8C00');
    
    // Create tooltip
    d3.select('body').append('div')
        .attr('class', 'tooltip-planet')
        .style('opacity', 0)
        .style('display', 'none');
}

// Update visualization with current year's data
function updateVisualization() {
    const data = allData[currentYear];
    if (!data) return;
    
    const centerX = width / 2;
    const centerY = height / 2;
    const minRadius = 80;
    const maxRadius = 350;
    
    // Scale for planet size (based on song count)
    const sizeScale = d3.scaleSqrt()
        .domain([1, d3.max(data, d => d.songCount)])
        .range([8, 40]);
    
    // Scale for distance from sun (based on energy)
    const distanceScale = d3.scaleLinear()
        .domain([0, 1])
        .range([minRadius, maxRadius]);
    
    // Position planets in a circle around the sun
    const angleStep = (2 * Math.PI) / data.length;
    
    const planetsData = data.map((d, i) => {
        const baseAngle = i * angleStep;
        const distance = distanceScale(d.avgEnergy);
        
        // Orbital speed: planets further out move slower (like real orbits)
        // Speed inversely proportional to distance
        const orbitalSpeed = 0.00005 / (distance / 100);
        
        return {
            ...d,
            baseAngle: baseAngle,
            distance: distance,
            orbitalSpeed: orbitalSpeed,
            x: centerX + distance * Math.cos(baseAngle),
            y: centerY + distance * Math.sin(baseAngle)
        };
    });
    
    // Update orbits
    const orbits = d3.select('#orbits')
        .selectAll('.planet-orbit')
        .data(planetsData, d => d.name);
    
    orbits.enter()
        .append('circle')
        .attr('class', 'planet-orbit')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', 0)
        .merge(orbits)
        .transition()
        .duration(1000)
        .attr('r', d => d.distance);
    
    orbits.exit()
        .transition()
        .duration(500)
        .attr('r', 0)
        .remove();
    
    // Update planets
    const planets = d3.select('#planets')
        .selectAll('.planet')
        .data(planetsData, d => d.name);
    
    const tooltip = d3.select('.tooltip-planet');
    
    // Enter new planets
    const planetsEnter = planets.enter()
        .append('circle')
        .attr('class', 'planet')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', 0)
        .attr('fill', d => danceabilityToColor(d.avgDanceability))
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .on('mouseover', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('stroke-width', 4)
                .attr('r', sizeScale(d.songCount) * 1.2);
            
            tooltip
                .style('display', 'block')
                .transition()
                .duration(200)
                .style('opacity', 1);
        })
        .on('mousemove', function(event, d) {
            tooltip
                .html(`
                    <strong>${d.name}</strong>
                    <div>Songs: ${d.songCount}</div>
                    <div>Avg Danceability: ${d.avgDanceability.toFixed(2)}</div>
                    <div>Avg Energy: ${d.avgEnergy.toFixed(2)}</div>
                    <div style="margin-top: 5px; font-size: 0.8rem; color: #aaa;">
                        ${d.songs.slice(0, 3).join(', ')}${d.songs.length > 3 ? '...' : ''}
                    </div>
                `)
                .style('left', (event.pageX + 15) + 'px')
                .style('top', (event.pageY - 15) + 'px');
        })
        .on('mouseout', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('stroke-width', 2)
                .attr('r', sizeScale(d.songCount));
            
            tooltip
                .transition()
                .duration(200)
                .style('opacity', 0)
                .on('end', function() {
                    d3.select(this).style('display', 'none');
                });
        });
    
    // Update all planets (enter + update)
    planetsEnter.merge(planets)
        .transition()
        .duration(1000)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', d => sizeScale(d.songCount))
        .attr('fill', d => danceabilityToColor(d.avgDanceability));
    
    // Exit old planets
    planets.exit()
        .transition()
        .duration(500)
        .attr('r', 0)
        .attr('cx', centerX)
        .attr('cy', centerY)
        .remove();
    
    // Start animation after initial positioning
    if (animationRunning) {
        animatePlanets(planetsData, centerX, centerY, sizeScale);
    }
}

// Animate planets orbiting around the sun
function animatePlanets(planetsData, centerX, centerY, sizeScale) {
    function animate() {
        if (!animationRunning) return;
        
        const elapsed = Date.now() - startTime;
        
        // Update planet positions
        d3.select('#planets')
            .selectAll('.planet')
            .data(planetsData, d => d.name)
            .attr('cx', d => {
                const angle = d.baseAngle + (elapsed * d.orbitalSpeed);
                return centerX + d.distance * Math.cos(angle);
            })
            .attr('cy', d => {
                const angle = d.baseAngle + (elapsed * d.orbitalSpeed);
                return centerY + d.distance * Math.sin(angle);
            });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}
