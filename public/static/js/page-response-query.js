$(document).ready(
		
		function() {
			var index = {
				Page : 0,
				Country : 1,
				Time : 2,
				Count : 3,
				Total : 4,
				Redirect : 5,
				DNS : 6,
				Connection : 7,
				Server : 8,
				Download : 9,
				DOM : 10,
				Load : 11,
				TableType : 12
			};
			
			var chartColumns = [ {
				index : index.Redirect,
				name : "Redirect",
				sname : "rd",
				data : []
			}, {
				index : index.DNS,
				name : "DNS",
				sname : "dns",
				data : []
			}, {
				index : index.Connection,
				name : "Connection",
				sname : "con",
				data : []
			}, {
				index : index.Server,
				name : "Server",
				sname : "rq",
				data : []
			}, {
				index : index.Download,
				name : "Download",
				sname : "rs",
				data : []
			}, {
				index : index.DOM,
				name : "DOM",
				sname : "dom",
				data : []
			}, {
				index : index.Load,
				name : "Load",
				sname : "ld",
				data : []
			}, ];
			
			var oTable = $('#dataTable').dataTable({
				"aoColumns": [
				              { "sType": "string", "mData": "pg" },
				              { "sType": "string", "mData": "ctr" },
				              { "sType": "date", "mData": "ts" },
				              { "sType": "numeric", "mData": "cnt" },
				              { "sType": "numeric", "mData": "tt" },
				              { "sType": "numeric", "mData": "rd" },
				              { "sType": "numeric", "mData": "dns" },
				              { "sType": "numeric", "mData": "con" },
				              { "sType": "numeric", "mData": "rq" },
				              { "sType": "numeric", "mData": "rs" },
				              { "sType": "numeric", "mData": "dom" },
				              { "sType": "numeric", "mData": "ld" },
				              { "sType": "string", "mData": "tableType", "bVisible": false }
				            ],
				"fnDrawCallback" : function(oSettings) {
					if (this.fnGetData().length == 0) {
						return;
					}
					var tableType = this.fnGetData()[0].tableType;
					if (tableType == null) {
						return;
					}
					if (tableType == "DAY_RANGE") {
						oTable.fnSetColumnVis(index.Country, false);
						oTable.fnSetColumnVis(index.Time, false);
						$("#tableTypeHeading").text("Page wise response time breakup. Click on the row to see country wise break up.");
					} else if (tableType == "PAGE_DAY_RANGE") {
						oTable.fnSetColumnVis(index.Country, true);
						oTable.fnSetColumnVis(index.Time, false);
						$("#tableTypeHeading").text("Country wise response time breakup. Click on the row to see day wise break up.");
					} else if (tableType == "PAGE_COUNTRY_DAY") {
						oTable.fnSetColumnVis(index.Country, true);
						oTable.fnSetColumnVis(index.Time, true);
						$("#tableTypeHeading").text("Day wise response time breakup. Click on the row to see hour wise break up.");
					} else if (tableType == "PAGE_COUNTRY_HOUR") {
						oTable.fnSetColumnVis(index.Country, true);
						oTable.fnSetColumnVis(index.Time, true);
						$("#tableTypeHeading").text("Hour wise response time breakup. Click on the row to see minute wise break up.");
					} else if (tableType == "PAGE_COUNTRY_MIN") {
						oTable.fnSetColumnVis(index.Country, true);
						oTable.fnSetColumnVis(index.Time, true);
						$("#tableTypeHeading").text("Minute wise response time breakup");
					}
					plotChart(tableType);
				}
			});

			function plotChart(tableType) {
				var tableRows = oTable.fnGetData();
				var options;
				
				if (tableType=="DAY_RANGE" || tableType=="PAGE_DAY_RANGE") {
					options = {
							xaxis : {
								mode: "categories",
								rotateTicks: 135,
								tickLength: 0
							},
							series : {
								bars: {
									show: true,
									barWidth: 0.6,
									align: "center",
									fill : .9
								},
								stack : true
							}
						};
				} else {
					options = {
							xaxis : {
								mode : "time",
								timezone: "browser"
							},
							series : {
								lines : {
									show : true,
									fill : .9
								},
								stack : true
							}
						};
				}
				
				chartColumns.forEach(function(entry) {
					entry.data.splice(0, entry.data.length);
				});

				for ( var i = 0; i < tableRows.length; i += 1) {
					row = tableRows[i];
					chartColumns.forEach(function(entry) {
						if (tableType=="DAY_RANGE") {
							var p = row.pg;
							entry.data.push([p, row[entry.sname]]);
						} else if (tableType=="PAGE_DAY_RANGE") {
							var p = row.ctr;
							entry.data.push([p, row[entry.sname]]);
						} else {
							var t = moment(row.ts);
							entry.data.push([t.valueOf(), row[entry.sname]]);
						}
					});
				}

				var series = [];
				chartColumns.forEach(function(entry) {
					series.push({
						data : entry.data,
						label : entry.name
					});
				});

				$.plot("#chartDiv", series, options);
			} // plotChart method end
			
			
			$('#dataTable tbody').on('click', 'tr', function() {
						var nTr = this;
						var rowData = oTable.fnGetData(nTr);
						
						var tableType = rowData.tableType;
						var uri = "#";
						if (tableType == "DAY_RANGE") {
							var dates = rowData.ts.split(" - ");
							var fromTs = dates[0];
							var toTs = dates[1];
							uri = '/page-response-query/page/dayrange?page=' + rowData.pg+ '&fromTs=' + fromTs + '&toTs=' + toTs;
						} else if (tableType == "PAGE_DAY_RANGE") {
							var dates = rowData.ts.split(" - ");
							var fromTs = dates[0];
							var toTs = dates[1];
							var country = rowData.ctr;
							uri = '/page-response-query/page/country/day?page=' + rowData.pg + '&country=' + country 
									+ '&fromTs=' + fromTs + '&toTs=' + toTs;
						} else if (tableType == "PAGE_COUNTRY_DAY") {
							var fromTs = moment(rowData.ts);
							var toTs = moment(fromTs);
							toTs.add('days', 1);
							var country = rowData.ctr;
							uri = '/page-response-query/page/country/hour?page=' + rowData.pg + '&country=' + country + '&fromTs='
									+ fromTs.format('YYYY-MM-DDTHH:mm') + '&toTs=' + toTs.format('YYYY-MM-DDTHH:mm');
						} else if (tableType == "PAGE_COUNTRY_HOUR") {
							var fromTs = moment(rowData.ts);
							var toTs = moment(fromTs);
							toTs.add('hours', 1);
							var country = rowData.ctr;
							uri = '/page-response-query/page/country/min?page=' + rowData.pg + '&country=' + country + '&fromTs=' + fromTs.format('YYYY-MM-DDTHH:mm')
									+ '&toTs=' + toTs.format('YYYY-MM-DDTHH:mm');
						} else {
							return;
						}
						oTable.fnReloadAjax(uri);
					});

			$('#form').submit(function(event) {
				event.preventDefault();
				$('#tableChartDiv').show();
				var query = $(this).serialize();
				oTable.fnReloadAjax('/page-response-query/dayrange?' + query);
			});

		});