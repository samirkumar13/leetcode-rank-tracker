document.addEventListener('DOMContentLoaded', async () => {
    const loadingEl = document.getElementById('loading');
    const contentEl = document.getElementById('content');
    const errorEl = document.getElementById('error');

    try {
        const response = await fetch('data.json');

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const history = await response.json();

        // Handle case where history is empty
        if (!history || history.length === 0) {
            throw new Error('No data available');
        }

        // Get value from the latest entry
        // Support both single object (legacy) and array
        const latestData = Array.isArray(history) ? history[history.length - 1] : history;

        // Update DOM with latest data
        document.getElementById('username').textContent = latestData.username;
        document.getElementById('realname').textContent = latestData.realName || '';
        document.getElementById('avatar').src = latestData.avatar || 'https://assets.leetcode.com/users/default_avatar.jpg';
        document.getElementById('ranking').textContent = parseInt(latestData.ranking).toLocaleString('en-IN');

        const date = new Date(latestData.timestamp || latestData.lastUpdated);
        document.getElementById('last-updated').textContent = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

        // Render stats
        const statsGrid = document.getElementById('stats-grid');
        statsGrid.innerHTML = '';

        latestData.stats.forEach(stat => {
            const difficulty = stat.difficulty;
            const count = stat.count;

            if (['Easy', 'Medium', 'Hard'].includes(difficulty)) {
                const statEl = document.createElement('div');
                statEl.className = 'stat-item';
                statEl.innerHTML = `
                    <span class="stat-count ${difficulty.toLowerCase()}">${count}</span>
                    <span class="stat-label">${difficulty}</span>
                `;
                statsGrid.appendChild(statEl);
            }
        });

        // Initialize Chart if history is available and has length
        if (Array.isArray(history) && history.length > 0) {
            initChart(history);
        }

        // Show content
        loadingEl.classList.add('hidden');
        contentEl.classList.remove('hidden');

    } catch (err) {
        console.error(err);
        loadingEl.classList.add('hidden');
        errorEl.classList.remove('hidden');
    }
});

function initChart(history) {
    const ctx = document.getElementById('rankChart').getContext('2d');

    // Prepare data
    // Sort just in case, though append should keep it sorted
    const sortedHistory = history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Limit to last 30 entries if too many
    const recentHistory = sortedHistory.slice(-30);

    const labels = recentHistory.map(entry => {
        const date = new Date(entry.timestamp);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    });

    const dataPoints = recentHistory.map(entry => parseInt(entry.ranking));

    // Brand Colors
    const brandColor = '#09090B'; // Text primary
    const accentColor = '#71717A'; // Text secondary
    const gridColor = '#E4E4E7';  // Border color

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Global Ranking',
                data: dataPoints,
                borderColor: brandColor,
                backgroundColor: 'rgba(9, 9, 11, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#FFFFFF',
                pointBorderColor: brandColor,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: brandColor,
                    titleColor: '#FFFFFF',
                    bodyColor: '#FFFFFF',
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            return 'Rank: ' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: accentColor,
                        font: {
                            family: 'Roboto'
                        }
                    }
                },
                y: {
                    reverse: true, // Rank 1 is better than Rank 100
                    grid: {
                        color: gridColor,
                        borderDash: [5, 5]
                    },
                    ticks: {
                        color: accentColor,
                        font: {
                            family: 'Roboto'
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index',
            },
        }
    });
}
