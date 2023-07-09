document.addEventListener("DOMContentLoaded", () => {
    const url = "https://environment.data.gov.uk/flood-monitoring/id/stations/693435/readings.json?_sorted&latest";
  
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const readings = data.items;

            const levels = readings.map(item => item.value);
            const timestamps = readings.map(item => item.dateTime);

            const chartData = {
                labels: timestamps,
                datasets: [
                    {
                        label: "River Level",
                        data: levels,
                        borderColor: "blue",
                        fill: false
                    }
                ]
            };

            const ctx = document.getElementById("chart").getContext("2d");
            new Chart(ctx, {
                type: "line",
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            type: "time",
                            time: {
                                unit: "day",
                                displayFormats: {
                                    day: "MMM D"
                                }
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: "River Level (m)"
                            }
                        }
                    }
                }
            });
        })
        .catch(error => console.log(error));
});
