
var snapchart = "#snapchart"
var filePath = "commodities-spending.tsv"
var width = 300
var height = 600
var margin = {top: 50, bottom: 10, left: 10, right: 20}
var vert_buffer = .5
var barwidth = 50
var leftbar = margin.left
var rightbar = width - barwidth
var leftX = leftbar + barwidth
var rightX = rightbar
var smoothFactor = (rightbar-leftX)/2

// Draw canvas for chart
var svg = d3.select(snapchart).append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .attr("shape-rendering", "geometricPrecision")
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Find the x position from the ranking and other data
// Pass in relevant subset (s or ns) for set as a string

function position_calc(rank, set, data) {
  count = 0
  percent_above = 0
  data.forEach(function(d) {
    if (d[set].rank < rank) {
      count += 1
      percent_above += d[set].percent
    };
  });
  y_position = (height-(data.length*vert_buffer))*(percent_above/100)+vert_buffer*count;
  return y_position
};

function cellover(d) {

  // Change opaquness of d3 graphic elements

  d3.selectAll("rect").filter(".snaprankviz")
    .transition().duration(100)
    .style("fill-opacity", 0.2);

  d3.selectAll("path").filter(".snaprankviz")
    .transition().duration(100)
    .style("stroke-opacity", 0.2);

  d3.selectAll("rect").filter(".snaprankviz.food" + String(d.s.rank))
    .transition().duration(100)
    .style("fill-opacity", 1);

  d3.selectAll("path").filter(".snaprankviz.food" + String(d.s.rank))
    .transition().duration(100)
    .style("stroke-opacity", 1);

  // Change text / visibility of graphic to the right

  d3.selectAll("g.snap_subtext")
    .style("visibility", "visible");

  d3.select("#food_label").text(d.food);

  d3.select("#rank_s").text("#" + d.s.rank)

  d3.select("#rank_ns").text("#" + d.ns.rank)

  d3.select("#perc_s").text(d.s.percent + "%")

  d3.select("#perc_ns").text(d.ns.percent + "%")
}

function cellout(d) {

  d3.selectAll("rect").filter(".snaprankviz")
    .transition().duration(100)
    .style("fill-opacity", 1);

  d3.selectAll("path").filter(".snaprankviz")
    .transition().duration(100)
    .style("stroke-opacity", 1);

  d3.select("#food_label").text(d.food);

  d3.select("#rank_s").text("")

  d3.select("#rank_ns").text("")

  d3.select("#perc_s").text("")

  d3.select("#perc_ns").text("")

  // Change text / visibility of graphic to the right

  d3.selectAll("g.snap_subtext")
    .style("visibility", "hidden");

  d3.select("#food_label").text("(Hover to examine item)");
}

// Load data
d3.tsv(filePath, function(error, data) {

  data.forEach(function(d) {
    d.food = d.commodity

    d.s = {
      rank: parseInt(d.snap_rank),
      spend: parseFloat(d.snap_spending),
      percent: parseFloat(d.snap_pct_of_total)
    }

    d.ns = {
      rank: parseInt(d.nonsnap_rank),
      spend: parseFloat(d.nonsnap_spending),
      percent: parseFloat(d.nonsnap_pct_of_total)
    }
  });

  // Secondary processing of data. Is this necessary? Can it pull up?

  var colors = d3.quantize(d3.interpolateHclLong("#d83ee0", "#e03e3e"), data.length)
  colorpoint = 0

  data.forEach (function(d){

  // Add y position variable (y.pos) for each snap and non-snap rectangle

    d.s.ypos = position_calc(d.s.rank, "s", data)
    d.ns.ypos = position_calc(d.ns.rank, "ns", data)

  // Add rectangle height for each variable

    d.s.hgt = (height-(data.length*vert_buffer))*(d.s.percent/100)
    d.ns.hgt = (height-(data.length*vert_buffer))*(d.ns.percent/100)

  // Add color for each food type

    d.color = colors[colorpoint]
    colorpoint += 1

  });


  // Draw shapes for Snap

  svg.append("text")
    .attr("x", leftbar + barwidth/2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .attr("font-family", "Filson Soft")
    .text("SNAP")

  svg.append("text")
    .attr("x", rightbar + barwidth/2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .attr("font-family", "Filson Soft")
    .text("non-SNAP")

  svg.selectAll("rect").filter(".snap")
    .data(data)
    .enter()
    .append("rect") // first bar
      .attr("x", function (d) {return leftbar})
      .attr("y", function (d) {return d.s.ypos})
      .attr("width", barwidth)
      .attr("height", function (d) {return d.s.hgt})
      .attr("class", function (d) {return "snap " + "snaprankviz " + "food" + String(d.s.rank)})
      .style("fill", function (d) {return d.color})
      .on("mouseover", function (d) {cellover(d)})
      .on("mouseout", function (d) {cellout(d)});

  svg.selectAll("rect").filter(".nosnap")
    .data(data)
    .enter()
    .append("rect") //second bar
      .attr("x", function (d) {return rightbar})
      .attr("y", function (d) {return d.ns.ypos})
      .attr("width", barwidth)
      .attr("height", function (d) {return d.ns.hgt})
      .attr("class", function (d) {return "nosnap " + "snaprankviz " + "food" + String(d.s.rank)})
      .style("fill", function (d) {return d.color})
      .on("mouseover", function (d) {cellover(d)})
      .on("mouseout", function (d) {cellout(d)});

  svg.selectAll("path")
    .data(data)
    .enter()
    .append("path")
      .attr("d", function (d) { // Build bezier path connecting same item in each bar
        var leftY = d.s.ypos + d.s.hgt/2
        var rightY = d.ns.ypos + d.ns.hgt/2
        var halfY = Math.abs(d.s.ypos-d.ns.ypos)/2 + Math.min(leftY, rightY)
        var bez_string = "M" + String(leftX) + "," + String(leftY) + "C" + String(leftX + smoothFactor) + "," + String(leftY) + "," + String(rightX - smoothFactor) + "," + String(rightY) + "," + String(rightX) + "," + String(rightY)
        console.log(bez_string)
        return bez_string
      })
      .attr("stroke", function (d) {return d.color})
      .attr("stroke-width", 1)
      .style("stroke-opacity", 1)
      .attr("fill", "none")
      .attr("class", function (d) {return "snaprankviz " + "food" + String(d.s.rank)})
      .on("mouseover", function (d) {cellover(d)})
      .on("mouseout", function (d) {cellout(d)});


}); // Final data curly bracket