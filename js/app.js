var app = angular.module('S_calculator', []);
app.controller('Main', function ($scope) {

    $scope.unit_sys_cost = parseInt(75000);
    $scope.loan_tenure = 0;
    $scope.emi = 0;
    $scope.i_rate = 11;
    $scope.loan_error = false;
    $scope.pro_loc = 0;
    $scope.roof_size = 0;
    $scope.electricity_cons = 0;
    $scope.loan_tenure = 0;
    $scope.loan_amount = 0;
    $scope.emi = 0;
    $scope.saving = 0;
    $scope.show_chart = false;


    $scope.tenure_changed = function () {
        $scope.show_chart = true;
    }


    $scope.$watchGroup(['pro_loc', 'roof_size', 'electricity_cons', 'loan_tenure', 'loan_amount'], function (newVal, oldVal) {
        $scope.s_size = Math.round(Math.min(parseFloat(parseFloat(newVal[1]) / 100), parseFloat(parseFloat(newVal[2]) / 120)) * 100) / 100;
        $scope.s_sys_cost = parseFloat($scope.s_size) * parseFloat($scope.unit_sys_cost);

        $scope.c_elec_bill = parseInt(newVal[0]) * parseInt(newVal[2]);
        $scope.solar_units = Math.round((parseFloat($scope.s_size) * 4 * 30) * 100) / 100;
        $scope.reduced_units = Math.round(Math.max((parseFloat(newVal[2]) - parseFloat($scope.solar_units)), 0) * 100) / 100;
        $scope.reducedBill = Math.round((parseFloat($scope.reduced_units) * parseFloat(newVal[0])) * 100) / 100;
        $scope.emi = Math.round(((parseFloat(newVal[4]) + ((parseFloat(newVal[4]) * parseFloat($scope.i_rate) * parseInt(newVal[3])) / 100)) / (parseInt(newVal[3]) * 12)) * 100) / 100;
        $scope.saving = Math.round((parseInt($scope.c_elec_bill) - parseInt($scope.reducedBill) - parseInt($scope.emi)) * 100) / 100;
        $scope.loan_tenure = parseInt(newVal[3]);
        $scope.loan_amount = parseInt(newVal[4]);
        if ($scope.saving < 0)
        {
            $scope.show_emi_suggest = true;
        } else {
            $scope.show_emi_suggest = false;
        }
        if ($scope.s_size > 0)
        {
            $scope.show1 = true;
        }
        if ($scope.s_sys_cost > 0)
        {
            $scope.show2 = true;
        }
        if ($scope.c_elec_bill > 0)
        {
            $scope.show3 = true;
        }
        if ($scope.solar_units > 0)
        {
            $scope.show4 = true;
        }
        if ($scope.reduced_units > 0)
        {
            $scope.show5 = true;
        }
        if ($scope.reducedBill > 0)
        {
            $scope.show6 = true;
        }
        if ($scope.emi > 0)
        {
            $scope.show7 = true;
        }
        if ($scope.saving > 0)
        {
            $scope.show8 = true;
        }
        if (typeof $scope.loan_amount === 'undefined')
        {
            $scope.loan_error = true;
        } else {
            $scope.loan_error = false;
        }



        var solar_graph = [];
        var m_eclecbill = parseFloat($scope.c_elec_bill) * 12;
        var reducedBill = parseFloat($scope.reducedBill) * 12;
        var elecbill = 0;
        var solar_wo_loan_Bills = parseFloat($scope.s_sys_cost);
        var solar_wi_loan_Bills = parseFloat($scope.s_sys_cost) - parseFloat($scope.loan_amount);
        var emis = parseFloat($scope.emi) * 12;
        var loan_tenure = parseInt($scope.loan_tenure) + 1;
        var graph_tenure = parseInt($scope.loan_tenure) + 6;
        var currentYear = 2016;
        for (var p = 0; p < graph_tenure; p++)
        {
            solar_graph.push({
                year: currentYear,
                nsolar_cash_flow: elecbill,
                solar_wo_loan_cash_flow: solar_wo_loan_Bills,
                solar_wi_loan_cash_flow: solar_wi_loan_Bills
            })
            if (p < loan_tenure)
            {
                solar_wi_loan_Bills = solar_wi_loan_Bills + emis + reducedBill;
            } else {
                solar_wi_loan_Bills = solar_wi_loan_Bills + reducedBill;
            }
            elecbill = elecbill + m_eclecbill;
            solar_wo_loan_Bills = solar_wo_loan_Bills + reducedBill;
            currentYear++;
        }
         
        createChart(solar_graph, parseInt($('#chart').width()));


    });





});




function createChart(data, wi) {
    $('#chart').html('');
    var margin = {top: 20, right: 80, bottom: 30, left: 80},
    width = wi - margin.left - margin.right,
            height = 320 - margin.top - margin.bottom;



    var x = d3.scale.linear()
            .range([0, width]);

    var y = d3.scale.linear()
            .range([height, 0]);

    var color = d3.scale.ordinal().range(["red", "blue", "green"]);

    var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom").tickFormat(d3.format("d"));

    var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

    var line = d3.svg.line()
            .interpolate("linear")
            .x(function (d) {
                return x(d.year);
            })
            .y(function (d) {
                return y(d.cash_flow);
            });

    var svg = d3.select('#chart').append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    function make_y_axis() {
        return d3.svg.axis()
                .scale(y)
                .orient("left")
    }



    color.domain(d3.keys(data[0]).filter(function (key) {
        return key !== "year";
    }));





    var cash_flows = color.domain().map(function (name) {
        return {
            name: name,
            values: data.map(function (d) {
                return {year: d.year, cash_flow: +d[name]};
            })
        };
    });



    x.domain(d3.extent(data, function (d) {
        return d.year;
    }));
    
    


    y.domain([
        d3.min(cash_flows, function (c) {
            return d3.min(c.values, function (v) {
                return v.cash_flow;
            });
        }),
        d3.max(cash_flows, function (c) {
            return d3.max(c.values, function (v) {
                return v.cash_flow;
            });
        })
    ]);

    svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

    svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
    svg.append("g")
            .attr("class", "grid")
            .call(make_y_axis()
                    .tickSize(-width, 0, 0)
                    .tickFormat("")
                    )


    var cash_f = svg.selectAll(".cash_flow")
            .data(cash_flows)
            .enter().append("g")
            .attr("class", "cash_flow");

    cash_f.append("path")
            .attr("class", "line")
            .attr("d", function (d) {
                return line(d.values);
            })
            .style("stroke", function (d) {
                return color(d.name);
            });

}
