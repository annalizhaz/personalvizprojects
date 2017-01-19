var snapchart = "#snapchart"
var filePath = "../commodities-spending.tsv"
var width = 100
var height = 200
var margin = {"top": 10, "bottom": 10, "left": 10, "right": 10}
var vert_buffer = 10

// Draw canvas for chart
var svg = d3.select(snapchart)
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin,top + margin.bottom)
  .attr("shape-rendering", "geometricPrecision") //uncertain if needed
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); //uncertain

// Find the x position from the ranking and other data
// Pass in relevant subset (s or ns) for set

function position_calc(rank, set, data) {
  count = 0
  percent_above = 0
  for (i = 0; i < data.length; i++) {
    if (data.set.rank < rank) {
      count += 1
      percent_above += data.set.percent
    };
  };
  x_position = height*(percent_above/100)+vert_buffer*count;
  return y_position
};

// Load data
d3.tsv(filePath, function(error, data) {

  data.forEach(function(d) {
    d.food = d.commodity

    d.s = {
      rank: d.snap_rank,
      spend: d.snap_spending,
      percent: d.snap_pct_of_total
    }

    d.ns = {
      rank: d.nonsnap_rank,
      spend: d.nonsnap_spending,
      percent: d.nonsnap_pct_of_total
    }
  });
});

// Add y position variable (y.pos) for each snap and non-snap rectangle

for (i=0; i < data.length; i++) {
  data[i].s.ypos = position_calc(data[i].s.rank, s, data)
  data[i].ns.ypos = position_calc(data[i].ns.rank, ns, data)
}

console.log(data)




