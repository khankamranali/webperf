$(document).ready(
		
		function() {
			
			$('#form').submit(function(event) {
				event.preventDefault();
				var query = $(this).serialize();
				$.ajax({
					url: "/apdex/q?"+query,
					type: "GET",
					dataType: "json",
					success: plotChart
				});

			});
			
			function createSeries(data) {
				var series = 	[
									{label:"Apdex", sname: "apdx", data:[]}, {label:"Satisfied", sname: "asc", data:[], yaxis: 2},
									{label:"Tolerating", sname: "atc", data:[], yaxis: 2},
									{label:"Frustrated", sname: "afc", data:[], yaxis: 2}
								];
								
				for ( var i = 0; i < data.length; i += 1) {
					row = data[i];
					series.forEach(function(entry) {
						var t = moment.utc([row.ts.year, row.ts.month, row.ts.day, row.ts.hour, row.ts.minute]).valueOf();
						entry.data.push([t, row[entry.sname]]);
					});
				}
				
				return series;
			}
			
			function plotChart(data) {
				var options = {
							xaxis : { mode : "time", timezone: "browser" },
							yaxes: [ 
								{ min: 0, max: 1, position: "left", axisLabel: "Apdex"},
								{ min: 0, max: 100, position: "right", axisLabel: "Percentage"} 
							],
							series: { lines: { show: true }, points: { show: true } },
							grid: { hoverable: true, clickable: true },
							tooltip: true,
							tooltipOpts: { content: "X=%x | Y=%y"},
							legend: { hideable: true }
					};
				
				var series = createSeries(data);
				
				$.plot("#chartDiv", series, options);
			}
	}
);