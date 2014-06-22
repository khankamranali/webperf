$(document).ready(
		
		function() {
			
			$('#form').submit(function(event) {
				event.preventDefault();
				var query = $(this).serialize();
				$.ajax({
					url: "/page-response-chart/q?"+query,
					type: "GET",
					dataType: "json",
					success: plotChart
				});

			});
			
			function createSeries(data) {
				var series = 	[
									{label:"Total", sname: "tt", data:[]}, {label:"Redirect", sname: "rd", data:[]},
									{label:"DNS", sname: "dns", data:[]}, {label:"Connection", sname: "con", data:[]},
									{label:"FirstByte", sname: "rq", data:[]}, {label:"Server", sname: "st", data:[]},
									{label:"Download", sname: "rs", data:[]}, {label:"DOM", sname: "dom", data:[]},
									{label:"Load", sname: "ld", data:[]}, {label:"Requests", sname: "cnt", data:[], yaxis: 2}
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
								{ transform:  function(v) {return v == 0 ? v : Math.log(v);}, 
								inverseTransform: function (v) { return Math.exp(v);},
								position: "left", axisLabel: "Time (ms)"},
								{ position: "right", axisLabel: "Request Count"} 
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