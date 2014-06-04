$(document).ready(
		
		function() {
			var mdata=[]
			$('#world-map').vectorMap({
				  map: 'world_mill_en',
				  series: {
					regions: [{
					  //scale: ['#00A455', '#A40000'],
					  scale: ['#FFC2B2', '#FF3300'],
					  normalizeFunction: 'linear'
					}]
				  },
				  onRegionLabelShow: function(e, el, code){
					el.html(el.html()+' ('+mdata[code]+')');
				  }
			});
				
			$('#form').submit(function(event) {
				event.preventDefault();
				var query = $(this).serialize();
				$.ajax({
					url: "/analysis-on-worldmap/q?"+query,
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