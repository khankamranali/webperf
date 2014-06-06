$(document).ready(
		
		function() {
			var mdata=[]
			$('#world-map').vectorMap({
				  map: 'world_mill_en',
				  series: {
					regions: [{
					  scale: ['#FFC2B2', '#FF3300'],
					  normalizeFunction: 'polenomial'
					}]
				  },
				  onRegionLabelShow: function(e, el, code){
					var value = parseInt(mdata[code])
					el.html(el.html()+' ('+value+')');
				  }
			});
				
			$('#form').submit(function(event) {
				event.preventDefault();
				var query = $(this).serialize();
				$.ajax({
					url: "/page-response-heatmap/q?"+query,
					type: "GET",
					dataType: "json",
					success: function(data) { 
						mdata = data;
						showOnMap(data);
					}
				});
				
			});
						
			function showOnMap(data) {
				var map = $('#world-map').vectorMap('get', 'mapObject');
				map.series.regions[0].clear();
				map.series.regions[0].scale.setMin(dataMin(data));
				map.series.regions[0].scale.setMax(dataMax(data));
				map.series.regions[0].setValues(data);
			}
			
			function dataMax(arr) {
				return Math.max.apply(null, Object.keys(arr).map(function(e) {return arr[e];}));
			}
			function dataMin(arr) {
				return Math.min.apply(null, Object.keys(arr).map(function(e) {return arr[e];}));
			}
	}
);