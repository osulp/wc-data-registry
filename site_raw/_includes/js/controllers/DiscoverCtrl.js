
angular.module('wcodpApp').controller('DiscoverCtrl', ['$scope', '$http', '$location', '$timeout', function($scope, $http, $location, $timeout) { 
	$scope.solrUrl = 'http://localhost:8082/solr/collection1/select?';
	$scope.filterValues = {};
	$scope.resultsData = {};
	$scope.numFound = 0;

	$scope.onLoad = function () {
		// Populate filter values from parameters in the URL.
		var initialFilterValues = {
			searchText: $location.search().text,
		};
		//$timeout(function() { 
		$scope.filterValues = initialFilterValues;
		//}, 1000);
	};

	$scope.runQuery = function (filterVals) {
		$scope.filterValues = filterVals;
		$scope.querySolr($scope.filterValues, $scope.solrSuccess, $scope.solrFail);
	};

	$scope.querySolr = function (filterValues, successCallback, failCallback) {
		var query = "";
			
		// Facet summary
		var facets = ['keywords'];
		var mincount = 1;
		for (var i = 0; i<facets.length; i++) {
			query = query + 'facet.field=' + facets[i] + '&facet.mincount=' + mincount + '&';
		}

		// Build query string
		query = query + $.param({
			'start': 0,
			'rows': 5,
			'wt': 'json', 
			'q': $scope.getSearchTextForQuery() + $scope.getKeywords(filterValues),
			'fq': '',
			'fl': 'id, title, description, keywords, envelope_geo, sys.src.item.lastmodified_tdt, url.metadata_s, sys.src.item.uri_s, sys.sync.foreign.id_s',
			'facet': true
		});

		var url = $scope.solrUrl + query;

		$http.get(url).success(function (data, status, headers, config) {
			console.log('^_^  Solr Success: ' + query);
			$location
				.search('text', $scope.getSearchText())
				.replace();
			$scope.resultsData = data.response.docs;
			$scope.numFound = data.response.numFound;
		}).error(function (data, status, headers, config) {
			console.log(' >_<  Solr Fail');
			$scope.resultsData = {};
			$scope.numFound = 0;
		});
	};

	$scope.getSearchText = function () {
		if ($scope.filterValues.searchText && _.isString($scope.filterValues.searchText)) {
			return $scope.filterValues.searchText;
		}
		return "";
	};

	$scope.getSearchTextForQuery = function () {
		var q = "{!lucene q.op=AND df=text}",
			val = $scope.getSearchText();
		q = val.length > 0 ? q + val + " " : ""; //q + "* ";
		return q;
	};

	$scope.getKeywords = function () {
		return '';
		// if (!isEmpty(app.viewModel.keywords())) {

		// 	var keywords = '(';
		// 	var count = 0;
		// 	$.each(app.viewModel.keywords(), function(key, val){
		// 		if (count > 0) {
		// 			keywords = keywords + ' AND ';
		// 		}
		// 		keywords = keywords + key;
		// 		count++;
		// 	});

		// 	keywords = keywords + ')';

		// 	if (keywords.length > 0) {
		// 	   app.viewModel.q_query(app.viewModel.q_query() + "keywords: " + keywords + " "); 
		// 	}
		// }
	};

	$scope.getBoundingBox = function () {
		return '';
		// if (app.viewModel.useBb() && app.viewModel.bbLat() != "" && app.viewModel.bbLon() != "") {
		// 	app.viewModel.fq_query("{!bbox pt=" + app.viewModel.bbLat() + "," + app.viewModel.bbLon() + " sfield=envelope_geo d=0.001} ");
		// } else {
		// 	app.viewModel.fq_query("");
		// }		
	};

	$scope.onLoad();
}]);