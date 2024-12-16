// Common chart theme
const darkTheme = {
    theme: {
        mode: 'dark',
        palette: 'palette1'
    },
    grid: {
        borderColor: '#404040'
    },
    xaxis: {
        labels: {
            style: {
                colors: '#d1d5db'
            }
        }
    },
    yaxis: {
        labels: {
            style: {
                colors: '#d1d5db'
            }
        }
    }
};

// Calculate statistics helper function
const calculateStats = (values) => {
    const avg = values.reduce((a, b) => a + b) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0 
        ? (sorted[sorted.length/2 - 1] + sorted[sorted.length/2]) / 2 
        : sorted[Math.floor(sorted.length/2)];
    
    const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance).toFixed(2);
    
    return { 
        avg: avg.toFixed(2), 
        max, 
        min, 
        median: median.toFixed(2),
        stdDev
    };
};

// Initialize all charts and statistics
document.addEventListener('DOMContentLoaded', () => {
    // Line Chart
    const lineChart = new ApexCharts(document.querySelector("#lineChart"), {
        ...darkTheme,
        series: [{
            name: 'Nilai Akhir',
            data: data.nilai_akhir
        }],
        chart: {
            type: 'line',
            height: 350,
            background: 'transparent'
        },
        xaxis: {
            categories: data.nim
        },
        title: {
            text: 'Tren Nilai Akhir',
            align: 'center',
            style: {
                color: '#d1d5db'
            }
        }
    });
    lineChart.render();

    // Add line chart analysis
    const lineChartAnalysis = document.getElementById('lineChartAnalysis');
    const avgNilaiAkhir = calculateStats(data.nilai_akhir).avg;
    const maxNilaiAkhir = Math.max(...data.nilai_akhir);
    const minNilaiAkhir = Math.min(...data.nilai_akhir);
    const passCount = data.nilai_akhir.filter(n => n >= 55).length;
    const passPercentage = ((passCount / data.nilai_akhir.length) * 100).toFixed(1);

    lineChartAnalysis.innerHTML = `
        <p>• Rata-rata nilai akhir kelas adalah ${avgNilaiAkhir}, dengan nilai tertinggi ${maxNilaiAkhir} dan terendah ${minNilaiAkhir}.</p>
        <p>• ${passCount} dari ${data.nilai_akhir.length} mahasiswa (${passPercentage}%) mencapai nilai kelulusan minimal (≥55).</p>
        <p>• Terdapat kesenjangan nilai yang signifikan antara mahasiswa dengan performa tertinggi dan terendah.</p>
    `;

    // Bar Chart
    const barChart = new ApexCharts(document.querySelector("#barChart"), {
        ...darkTheme,
        series: [{
            name: 'Kuis',
            data: data.kuis
        }, {
            name: 'Tugas',
            data: data.tugas
        }, {
            name: 'UTS',
            data: data.uts
        }, {
            name: 'UAS',
            data: data.uas
        }],
        chart: {
            type: 'bar',
            height: 350,
            stacked: true,
            background: 'transparent'
        },
        xaxis: {
            categories: data.nim
        },
        title: {
            text: 'Distribusi Komponen Nilai',
            align: 'center',
            style: {
                color: '#d1d5db'
            }
        }
    });
    barChart.render();

    // Add bar chart analysis
    const barChartAnalysis = document.getElementById('barChartAnalysis');
    const avgKuis = calculateStats(data.kuis).avg;
    const avgTugas = calculateStats(data.tugas).avg;
    const avgUTS = calculateStats(data.uts).avg;
    const avgUAS = calculateStats(data.uas).avg;

    barChartAnalysis.innerHTML = `
        <p>• Rata-rata nilai komponen: Kuis (${avgKuis}), Tugas (${avgTugas}), UTS (${avgUTS}), UAS (${avgUAS}).</p>
        <p>• Komponen ${getHighestComponent()} menunjukkan performa terbaik secara keseluruhan.</p>
        <p>• Komponen ${getLowestComponent()} memerlukan perhatian khusus untuk peningkatan.</p>
    `;

    // Initialize student select
    const studentSelect = document.getElementById('studentSelect');
    data.nim.forEach((nim, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = nim;
        studentSelect.appendChild(option);
    });

    // Radar Chart (will be initialized on student selection)
    let radarChart;
    studentSelect.addEventListener('change', (e) => {
        const index = e.target.value;
        if (index === "") return;
        
        if (radarChart) radarChart.destroy();
        
        radarChart = new ApexCharts(document.querySelector("#radarChart"), {
            ...darkTheme,
            series: [{
                name: data.nim[index],
                data: [
                    data.kuis[index],
                    data.tugas[index],
                    data.uts[index],
                    data.uas[index],
                    data.nilai_akhir[index]
                ]
            }],
            chart: {
                height: 350,
                type: 'radar',
                background: 'transparent'
            },
            xaxis: {
                categories: ['Kuis', 'Tugas', 'UTS', 'UAS', 'Nilai Akhir']
            }
        });
        radarChart.render();

        // Update radar chart analysis
        const radarChartAnalysis = document.getElementById('radarChartAnalysis');
        const studentNIM = data.nim[index];
        const studentKuis = data.kuis[index];
        const studentTugas = data.tugas[index];
        const studentUTS = data.uts[index];
        const studentUAS = data.uas[index];
        const studentNilaiAkhir = data.nilai_akhir[index];

        const compareToAvg = (value, avg) => value >= avg ? 'di atas' : 'di bawah';
        
        radarChartAnalysis.innerHTML = `
            <p>• Mahasiswa (${studentNIM}) memperoleh nilai akhir ${studentNilaiAkhir}.</p>
            <p>• Nilai Kuis (${studentKuis}) ${compareToAvg(studentKuis, avgKuis)} rata-rata kelas (${avgKuis}).</p>
            <p>• Nilai Tugas (${studentTugas}) ${compareToAvg(studentTugas, avgTugas)} rata-rata kelas (${avgTugas}).</p>
            <p>• Nilai UTS (${studentUTS}) ${compareToAvg(studentUTS, avgUTS)} rata-rata kelas (${avgUTS}).</p>
            <p>• Nilai UAS (${studentUAS}) ${compareToAvg(studentUAS, avgUAS)} rata-rata kelas (${avgUAS}).</p>
        `;
    });

    // Update statistics
    const components = {
        'Kuis': data.kuis,
        'Tugas': data.tugas,
        'UTS': data.uts,
        'UAS': data.uas,
        'Nilai Akhir': data.nilai_akhir
    };

    // Update statistics display
    const statsContainer = document.getElementById('statsContainer');
    const totalStudents = document.getElementById('totalStudents');
    const classAverage = document.getElementById('classAverage');
    
    // Update total students and class average
    const numStudents = data.nim.length;
    const avgFinal = calculateStats(data.nilai_akhir).avg;
    totalStudents.textContent = numStudents;
    classAverage.textContent = avgFinal;

    // Generate simplified summary statistics
    for (const [component, values] of Object.entries(components)) {
        const stats = calculateStats(values);
        const statDiv = document.createElement('div');
        statDiv.className = 'bg-dark-bg p-4 rounded-lg';
        statDiv.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <h4 class="font-semibold text-gray-200">${component}</h4>
                <span class="text-sm text-gray-400">Rata-rata: ${stats.avg}</span>
            </div>
            <div class="grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                    <div class="text-gray-400">Min</div>
                    <div class="font-semibold text-gray-200">${stats.min}</div>
                </div>
                <div>
                    <div class="text-gray-400">Max</div>
                    <div class="font-semibold text-gray-200">${stats.max}</div>
                </div>
                <div>
                    <div class="text-gray-400">Lulus</div>
                    <div class="font-semibold text-gray-200">${Math.round((values.filter(v => v >= 55).length / values.length) * 100)}%</div>
                </div>
            </div>
        `;
        statsContainer.appendChild(statDiv);
    }

    // Populate student table
    const studentTableBody = document.getElementById('studentTableBody');
    data.nim.forEach((nim, index) => {
        const row = document.createElement('tr');
        const nilai_akhir = data.nilai_akhir[index];
        let grade = 'E';
        if (nilai_akhir >= 85) grade = 'A';
        else if (nilai_akhir >= 70) grade = 'B';
        else if (nilai_akhir >= 55) grade = 'C';
        else if (nilai_akhir >= 40) grade = 'D';

        row.className = 'hover:bg-dark-bg transition-colors';
        row.innerHTML = `
            <td class="p-3">${nim}</td>
            <td class="p-3">${data.kuis[index]}</td>
            <td class="p-3">${data.tugas[index]}</td>
            <td class="p-3">${data.uts[index]}</td>
            <td class="p-3">${data.uas[index]}</td>
            <td class="p-3 font-semibold">${nilai_akhir}</td>
            <td class="p-3">
                <span class="px-2 py-1 rounded text-xs font-semibold ${
                    grade === 'A' ? 'bg-green-500/20 text-green-400' :
                    grade === 'B' ? 'bg-blue-500/20 text-blue-400' :
                    grade === 'C' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                }">${grade}</span>
            </td>
        `;
        studentTableBody.appendChild(row);
    });

    // Helper function to get component with highest average
    function getHighestComponent() {
        const components = {
            'Kuis': calculateStats(data.kuis).avg,
            'Tugas': calculateStats(data.tugas).avg,
            'UTS': calculateStats(data.uts).avg,
            'UAS': calculateStats(data.uas).avg
        };
        return Object.entries(components).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }

    // Helper function to get component with lowest average
    function getLowestComponent() {
        const components = {
            'Kuis': calculateStats(data.kuis).avg,
            'Tugas': calculateStats(data.tugas).avg,
            'UTS': calculateStats(data.uts).avg,
            'UAS': calculateStats(data.uas).avg
        };
        return Object.entries(components).reduce((a, b) => a[1] < b[1] ? a : b)[0];
    }
});
