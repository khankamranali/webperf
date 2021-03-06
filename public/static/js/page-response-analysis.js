$(document).ready(
		
		function() {
			
			var series  = [];
			
			$('#form').submit(function(event) {
				event.preventDefault();
				var seriesEntry = {label:this.field.value+'_'+this.interval.value+'_'+this.fromTs.value+'_'+this.toTs.value+'_'+this.country.value, sname:this.field.value, data:[]};
				if(this.field.value=='cnt') {
					seriesEntry['yaxis']=2
				}
				series.push(seriesEntry);
				var query = $(this).serialize();
				$.ajax({
					url: "/page-response-analysis/q?"+query,
					type: "GET",
					dataType: "json",
					success: function(data) { 
						plotChart(data, seriesEntry);
					}
				});
				$('#chartInfoDiv').show();
				
			});
			
			
			function createSeries(data, seriesEntry) {
				for ( var i = 0; i < data.length; i += 1) {
					row = data[i];
					var t = moment.utc([row.ts.year, row.ts.month-1, row.ts.day, row.ts.hour, row.ts.minute]).valueOf();
					seriesEntry.data.push([t, row[seriesEntry.sname]]);
				}
				
				return series;
			}
			
			function plotChart(data, seriesEntry) {
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
				
				var series = createSeries(data, seriesEntry);
				$('#chartDiv').empty();
				$.plot("#chartDiv", series, options);
			}
	}
);