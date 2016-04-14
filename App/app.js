'use strict'

//Define an angular module for our app
var myApp = angular.module('myApp', ['ngRoute']);
//Define Routing for the application

//TODOS: Create a directive for chart building
//Clean up unused services from controllers/directives


myApp.run(function ($rootScope) {
    $rootScope.currentIPData = null;
    $rootScope.currentEthernetData = null;
    $rootScope.currentSwitchData = null;

})
//Gabie test comment
myApp.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/home', {
                templateUrl: 'partials/home.html',
                controller: 'homeController'
            })
            .when('/iptable', {
                templateUrl: 'partials/iptable.html',
                controller: 'ipController'
            })
            .when('/switch', {
                templateUrl: 'partials/switch.html',
                controller: 'switchController'
            }).
            when('/ethernet', {
                templateUrl: 'partials/ethernet.html',
                controller: 'ethernetController'
            }).
           otherwise({
               redirectTo: '/home'
           });


    }]);

//change http to file upload control
myApp.controller('homeController', ['$scope', '$http', '$routeParams', '$location', '$rootScope', function ($scope, $http, $routeParams, $location, $rootScope) {

    $scope.fileToUpload = null;

    $scope.selectFile = function () {
        var file = event.target.files[0];
        var fr = new FileReader(); //will not work on old version of IE, need to fix this later
        fr.onload = $scope.receivedText;
        fr.readAsText(file);
    };

    $scope.receivedText = function (e) {
        var lines = e.target.result;
        $scope.fileToUpload = JSON.parse(lines);
    }

    $scope.upload = function () {
        var data = $scope.fileToUpload;
        if (data) {
            if (data.LogType == "IPTable") {
                $rootScope.currentIPData = data;
                $location.path('/iptable');
            }
            else if (data.LogType == "Switch") {
                $rootScope.currentSwitchData = data;
                $location.path('/switch');
            }
            else if (data.LogType == "Ethernet") {
                $rootScope.currentEthernetData = data;
                $location.path('/ethernet');
            }

            else {
                alert("File is not a valid log file");
            }
        }
        else {
            alert("Error uploading data, make sure a valid file was selected before uploading");
        }

    };
}]);

myApp.controller('ipController', ['$scope', '$rootScope', function ($scope, $rootScope) {


    $scope.loadCharts = function () {
        //build default chartData
        var messageCount = $rootScope.currentIPData.Messages.length - 2; //dont take into account the registration message or the mock obj at the end

        //building series data will go here
        var inputByteData = [];
        var outputByteData = [];
        var forwardByteData = [];

        var inputPacketData = [];
        var outputPacketData = [];
        var forwardPacketData = [];

        //move this logic into core library?
        for (var i = 1; i < messageCount - 1; i++) {
            var dataItems = $rootScope.currentIPData.Messages[i].DataItems;

            var inputByteTotal = 0;
            var outputByteTotal = 0;
            var forwardByteTotal = 0;

            var inputPacketTotal = 0;
            var outputPacketTotal = 0;
            var forwardPacketTotal = 0;

            for (var j = 0; j < dataItems.length - 1; j++) {
                if (dataItems[j].Chain == "INPUT") {
                    inputByteTotal += parseInt(dataItems[j].Bytes);
                    inputPacketTotal += parseInt(dataItems[j].Packets);
                }
                if (dataItems[j].Chain == "OUTPUT") {
                    outputByteTotal += parseInt(dataItems[j].Bytes);
                    outputPacketTotal += parseInt(dataItems[j].Packets);

                }
                if (dataItems[j].Chain == "FORWARD") {
                    forwardByteTotal += parseInt(dataItems[j].Bytes);
                    forwardPacketTotal += parseInt(dataItems[j].Packets);
                }
            }
            inputByteData.push(inputByteTotal);
            outputByteData.push(outputByteTotal);
            forwardByteData.push(forwardByteTotal);

            inputPacketData.push(inputPacketTotal);
            outputPacketData.push(outputPacketTotal);
            forwardPacketData.push(forwardPacketTotal);
        }

        //fill series data;
        var byteSeries = [{
            name: 'Input',
            data: inputByteData
        }, {
            name: 'Output',
            data: outputByteData
        }, {
            name: 'Forward',
            data: forwardByteData
        }];

        var packetSeries = [{
            name: 'Input',
            data: inputPacketData
        }, {
            name: 'Output',
            data: outputPacketData
        }, {
            name: 'Forward',
            data: forwardPacketData
        }];

        //does not separate presentation code from logic and data. need to write a directive for this
        var bytesChart =
		{
			chart: {
				type: 'line',
				zoomType: 'x'
            },
		    title:
			{
			    text: 'Bytes',
			    x: -20 //center
			},
		    credits: {
		        enabled: false
		    },
		    rangeSelector: {
		        enabled: false //can probably use this in the future
		    },
		    xAxis:
			{
			    title:
				{
				    text: 'Elapsed Time (mins)'
				},
			    labels: {
			        formatter: function () {
			            return (this.value * 2);
			        }
			    }
			},
		    yAxis: {
		        title:
				{
				    text: 'Bytes'
				},
		        plotLines: [{
		            value: 0,
		            width: 2,
		            color: 'silver'
		        }]
		    },
		    plotOptions: {
		        series: {
		            compare: 'value'
		        }
		    },
		    tooltip: {
		        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>'
		    },
		    series: byteSeries
		};

        var packetsChart =
		{
			chart: {
				type: 'line',
				zoomType: 'x'
            },
		    title:
			{
			    text: 'Packets',
			    x: -20 //center
			},
		    credits: {
		        enabled: false
		    },
		    rangeSelector: {
		        enabled: false //can probably use this in the future
		    },
		    xAxis:
			{
			    title:
				{
				    text: 'Elapsed Time (mins)'
				},
			    labels: {
			        formatter: function () {
			            return (this.value * 2);
			        }
			    }
			},
		    yAxis: {
		        title:
				{
				    text: 'Packets'
				},
		        plotLines: [{
		            value: 0,
		            width: 2,
		            color: 'silver'
		        }]
		    },
		    plotOptions: {
		        series: {
		            compare: 'value'
		        }
		    },
		    tooltip: {
		        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>'
		    },
		    series: packetSeries
		};


        Highcharts.chart('bytesChart', bytesChart);
        Highcharts.chart('packetsChart', packetsChart);
    }


    if ($rootScope.currentIPData) {
        $scope.loadCharts();
    }



}]);

myApp.controller('ethernetController', ['$scope', '$rootScope', function ($scope, $rootScope) {
	
	
    $scope.loadCharts = function () {
        var messageCount = $rootScope.currentEthernetData.Messages.length - 2; //dont take into account the registration message or the mock obj at the end

        //fill series data;
        var receivedPacketSeries = [];
		var transmittedPacketSeries = [];
		
        //get series categories from registration message
        var registrationDetails = $rootScope.currentEthernetData.Messages[0].DataItems;
        for (var i = 0; i < registrationDetails.length; i++) {
            receivedPacketSeries.push({
                name: registrationDetails[i].InterfaceName,
                data: []
            });
			
			transmittedPacketSeries.push({
                name: registrationDetails[i].InterfaceName,
                data: []
            });
			
        }

        //move this logic into core library?
        for (var i = 1; i < messageCount - 1; i++) {
            var dataItems = $rootScope.currentEthernetData.Messages[i].DataItems;

            for (var j = 0; j < dataItems.length; j++) {
                receivedPacketSeries[j].data.push(parseInt(dataItems[j].RxGood));
				transmittedPacketSeries[j].data.push(parseInt(dataItems[j].TxGood));
            }
            
        }

        //does not separate presentation code from logic and data. need to write a directive for this
        var receivedPacketsChart =
		{
			chart: {
				type: 'line',
				zoomType: 'x'
            },
		    title:
			{
			    text: 'Received Packets',
			    x: -20 //center
			},
		    credits: {
		        enabled: false
		    },
		    rangeSelector: {
		        enabled: false //can probably use this in the future
		    },
		    xAxis:
			{
			    title:
				{
				    text: 'Elapsed Time (mins)'
				},
			    labels: {
			        formatter: function () {
			            return (this.value * 2);
			        }
			    }
			},
		    yAxis: {
		        title:
				{
				    text: 'Received Packets'
				},
		        plotLines: [{
		            value: 0,
		            width: 2,
		            color: 'silver'
		        }]
		    },
		    plotOptions: {
		        series: {
		            compare: 'value'
		        }
		    },
		    tooltip: {
		        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>'
		    },
		    series: receivedPacketSeries
		};
		
		//does not separate presentation code from logic and data. need to write a directive for this
        var transmittedPacketsChart =
		{
			chart: {
				type: 'line',
				zoomType: 'x'
            },
		    title:
			{
			    text: 'Transmitted Packets',
			    x: -20 //center
			},
		    credits: {
		        enabled: false
		    },
		    rangeSelector: {
		        enabled: false //can probably use this in the future
		    },
		    xAxis:
			{
			    title:
				{
				    text: 'Elapsed Time (mins)'
				},
			    labels: {
			        formatter: function () {
			            return (this.value * 2);
			        }
			    }
			},
		    yAxis: {
		        title:
				{
				    text: 'Transmitted Packets'
				},
		        plotLines: [{
		            value: 0,
		            width: 2,
		            color: 'silver'
		        }]
		    },
		    plotOptions: {
		        series: {
		            compare: 'value'
		        }
		    },
		    tooltip: {
		        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>'
		    },
		    series: transmittedPacketSeries
		};

		
        Highcharts.chart('receivedPacketsChart', receivedPacketsChart);
		Highcharts.chart('transmittedPacketsChart', transmittedPacketsChart);
    }

    if ($rootScope.currentEthernetData) {
        $scope.loadCharts();
    }

}]);

myApp.controller('switchController', ['$scope', '$rootScope', function ($scope, $rootScope) {


    $scope.loadCharts = function () {

        var messageCount = $rootScope.currentSwitchData.Messages.length - 2; //dont take into account the registration message or the mock obj at the end

        //building series data will go here
        var ingressByteData = [];
        var egressByteData = [];
		
		//Gabie 
		var ingressMulticastData = [];
		var egressMulticastData = [];
		
		//Nicole broadcast
		var ingressBroadcastData = [];
		var egressBroadcastData = [];
		
		//Nicole unicast
		var ingressUnicastData = [];
		var egressUnicastData = [];
		
		var ingressBandwidthData = [];
		var egressBandwidthData = [];

        //move this logic into core library?
        for (var i = 1; i < messageCount - 1; i++) {
            var dataItems = $rootScope.currentSwitchData.Messages[i].DataItems;

            var ingressByteTotal = 0;
            var egressByteTotal = 0;
			
			//Gabie
			var ingressMulticastTotal = 0;
			var egressMulticastTotal = 0;
			
			//Nicole broadcast
			var ingressBroadcastTotal = 0;
			var egressBroadcastTotal = 0;
			//Nicole unicast
			var ingressUnicastTotal = 0;
			var egressUnicastTotal = 0;
			
			var firstIngressBandwidth = 0;
			var firstEgressBandwidth = 0;
			
			var secondIngressBandwidth = 0;
			var secondEgressBandwidth = 0;
			
			var ingressBandwidth = 0;
			var egressBandwidth = 0;
			
            for (var j = 0; j < dataItems.length - 1; j++) {
                ingressByteTotal += parseInt(dataItems[j].IngressBytes);
                egressByteTotal += parseInt(dataItems[j].EgressBytes);
				
				//Gabie
				ingressMulticastTotal += parseInt(dataItems[j].IngressMulticast);
				egressMulticastTotal += parseInt(dataItems[j].EgressMulticast);
				
				//Nicole broadcast
				ingressBroadcastTotal += parseInt(dataItems[j].IngressBroadcast);
				egressBroadcastTotal += parseInt(dataItems[j].EgressBroadcast);
				//Nicole unicast
				ingressUnicastTotal += parseInt(dataItems[j].IngressUnicast);
				egressUnicastTotal += parseInt(dataItems[j].EgressUnicast);
				
				if(j == 0){
					ingressBandwidth = 0;
					egressBandwidth = 0;
				}
				else{
					firstIngressBandwidth = parseInt(dataItems[j-1].IngressBytes);
					secondIngressBandwidth = parseInt(dataItems[j].IngressBytes);
					firstEgressBandwidth = parseInt(dataItems[j-1].EgressBytes);
					secondEgressBandwidth = parseInt(dataItems[j].EgressBytes);
				}
				/*if(firstIngressBandwidth > secondIngressBandwidth){
					ingressBandwidth = firstIngressBandwidth - secondIngressBandwidth;
				}else{
					ingressBandwidth = secondIngressBandwidth - firstIngressBandwidth;
				}		
				if(firstEgressBandwidth > secondEgressBandwidth){
					egressBandwidth = firstEgressBandwidth - secondEgressBandwidth;
				}else{
					egressBandwidth = secondEgressBandwidth - firstEgressBandwidth;
				}
			*/	ingressBandwidth = Math.abs((secondIngressBandwidth - firstIngressBandwidth));
				egressBandwidth = Math.abs((secondEgressBandwidth - firstEgressBandwidth));
				if(ingressBandwidth < 0){
					ingressBandwidth *= (-1);
				}
				if(egressBandwidth < 0){
					egressBandwidth *= (-1);
				}
				
				ingressBandwidthData.push(ingressBandwidth);
				egressBandwidthData.push(egressBandwidth);
            }
            ingressByteData.push(ingressByteTotal);
            egressByteData.push(egressByteTotal);
		
			
			//Gabie
			ingressMulticastData.push(ingressMulticastTotal);
			egressMulticastData.push(egressMulticastTotal);
			
			//Nicole broadcast
			ingressBroadcastData.push(ingressBroadcastTotal);
			egressBroadcastData.push(egressBroadcastTotal);
			//Nicole unicast
			ingressUnicastData.push(ingressUnicastTotal);
			egressUnicastData.push(egressUnicastTotal);
        }

        //fill series data;
        var byteSeries = [{
            name: 'Ingress',
            data: ingressByteData
        }, {
            name: 'Egress',
            data: egressByteData
        }];
		
		//Gabie
		var multicastSeries = [{
			name: 'Ingress',
			data: ingressMulticastData
		},{
			name: 'Egress',
			data: egressMulticastData
		}];

		//Nicole broadcast series
		var broadcastSeries = [{
			name: 'Ingress',
			data: ingressBroadcastData
		},{
			name: 'Egress',
			data: egressBroadcastData
		}];
		//Nicole unicast series
		var unicastSeries = [{
			name: 'Ingress',
			data: ingressUnicastData
		}, {
			name: 'Egress',
			data: egressUnicastData
		}];
		var bandwidthSeries = [{
			name: 'Ingress',
			data: ingressBandwidthData
		}, {
			name: 'Egress',
			data: egressBandwidthData
		}];
        //does not separate presentation code from logic and data. need to write a directive for this
        var bytesChart =
		{
			
			chart: {
				type: 'line',
				zoomType: 'x'
            },
		    title:
			{
			    text: 'Bytes',
			    x: -20 //center
			},
		    credits: {
		        enabled: false
		    },
		    rangeSelector: {
		        enabled: false //can probably use this in the future
		    },
		    xAxis:
			{
			    title:
				{
				    text: 'Elapsed Time (mins)'
				},
			    labels: {
			        formatter: function () {
			            return (this.value * 2);
			        }
			    }
			},
		    yAxis: {
		        title:
				{
				    text: 'Bytes'
				},
		        plotLines: [{
		            value: 0,
		            width: 2,
		            color: 'silver'
		        }]
		    },
		    plotOptions: {
		        series: {
		            compare: 'value'
		        }
		    },
		    tooltip: {
		        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>'
		    },
		    series: byteSeries
		};

        //Gabie
		//Multicast Chart
		var multicastChart =
		{
		    chart: {
				type: 'line',
				zoomType: 'x'
            },
			title:
			{
			    text: 'Multicast',
			    x: -20 //center
			},
		    credits: {
		        enabled: false
		    },
		    rangeSelector: {
		        enabled: false //can probably use this in the future
		    },
		    xAxis:
			{
			    title:
				{
				    text: 'Elapsed Time (mins)'
				},
			    labels: {
			        formatter: function () {
			            return (this.value * 2);
			        }
			    }
			},
		    yAxis: {
		        title:
				{
				    text: 'Multicast'
				},
		        plotLines: [{
		            value: 0,
		            width: 2,
		            color: 'silver'
		        }]
		    },
		    plotOptions: {
		        series: {
		            compare: 'value'
		        }
		    },
		    tooltip: {
		        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>'
		    },
		    series: multicastSeries
		};
		
		//Nicole
		//Broadcast Chart
		var broadcastChart =
		{
		    chart: {
				type: 'line',
				zoomType: 'x'
            },
			title:
			{
			    text: 'Broadcast',
			    x: -20 //center
			},
		    credits: {
		        enabled: false
		    },
		    rangeSelector: {
		        enabled: false //can probably use this in the future
		    },
		    xAxis:
			{
			    title:
				{
				    text: 'Elapsed Time (mins)'
				},
			    labels: {
			        formatter: function () {
			            return (this.value * 2);
			        }
			    }
			},
		    yAxis: {
		        title:
				{
				    text: 'Broadcast'
				},
		        plotLines: [{
		            value: 0,
		            width: 2,
		            color: 'silver'
		        }]
		    },
		    plotOptions: {
		        series: {
		            compare: 'value'
		        }
		    },
		    tooltip: {
		        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>'
		    },
		    series: broadcastSeries
		};
		
		//Nicole
		//Unicast Chart
		var unicastChart =
		{
		    chart: {
				type: 'line',
				zoomType: 'x'
            },
			title:
			{
			    text: 'Unicast',
			    x: -20 //center
			},
		    credits: {
		        enabled: false
		    },
		    rangeSelector: {
		        enabled: false //can probably use this in the future
		    },
		    xAxis:
			{
			    title:
				{
				    text: 'Elapsed Time (mins)'
				},
			    labels: {
			        formatter: function () {
			            return (this.value * 2);
			        }
			    }
			},
		    yAxis: {
		        title:
				{
				    text: 'Unicast'
				},
		        plotLines: [{
		            value: 0,
		            width: 2,
		            color: 'silver'
		        }]
		    },
		    plotOptions: {
		        series: {
		            compare: 'value'
		        }
		    },
		    tooltip: {
		        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>'
		    },
		    series: unicastSeries
		};
		var bandwidthChart =
		{
			chart: {
				type: 'line',
				zoomType: 'x'
            },
		    title:
			{
			    text: 'Bandwidth',
			    x: -20 //center
			},
		    credits: {
		        enabled: false
		    },
		    rangeSelector: {
		        enabled: false //can probably use this in the future
		    },
		    xAxis:
			{
			    title:
				{
				    text: 'Elapsed Time (mins)'
				},
			    labels: {
			        formatter: function () {
			            return (this.value * 2);
			        }
			    }
			},
		    yAxis: {
		        title:
				{
				    text: 'Bandwidth'
				},
		        plotLines: [{
		            value: 0,
		            width: 2,
		            color: 'silver'
		        }]
		    },
		    plotOptions: {
		        series: {
		            compare: 'value'
		        }
		    },
		    tooltip: {
		        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>'
		    },
		    series: bandwidthSeries
		};
		Highcharts.chart('bytesChart', bytesChart);
		Highcharts.chart('multicastChart', multicastChart);
		Highcharts.chart('broadcastChart', broadcastChart);
		Highcharts.chart('unicastChart', unicastChart);
		Highcharts.chart('bandwidthChart', bandwidthChart);
    }


    if ($rootScope.currentSwitchData) {
        $scope.loadCharts();
    }

}]);



//directives start here
myApp.directive('customOnChange', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeFunc = scope.$eval(attrs.customOnChange);
            element.bind('change', onChangeFunc);
        }
    };
});



























