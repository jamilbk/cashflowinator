'use strict';


window.sum = function (a, b) {
  return a + b;
};


window.CashFlowView = Backbone.View.extend({
  add: function () {
    var date = Date.parse($('[name=date]').val());
    var amount = parseFloat($('[name=amount]').val());
    var existing = window.col.where({date: date.getTime()});

    if (existing.length > 0) {
      var amounts = existing[0].get('amounts');
      amounts.push(amount);

      existing[0].set('amounts', amounts);
      window.col.remove(existing[0]);
      window.col.add(existing[0]);
      console.log(existing[0]);
    } else {
      window.col.add(new window.CashFlowModel({
        amounts: [amount],
        date: date.getTime()
      }));
    }
  },

  el: '#cash-flow-view',

  events: {
    'click [data-action=add]': 'add'
  }
});


window.CashFlowChart = Backbone.View.extend({
  el: '#cash-flow-chart',

  drawChart: function (col) {
    var x = col.pluck("date");
    var y = [];
    var all_amounts = col.pluck("amounts");

    _.each(all_amounts, function (amounts) {
      var sum = _.reduce(amounts, window.sum, 0.0);
      y.push(sum / amounts.length);
    });

    if (this.paper) this.paper.remove();
    this.paper = window.Raphael('cash-flow-chart');
    this.paper.linechart(50, 50, 600, 200, x, y, {
      symbol: 'circle',
      smooth: true,
      nostroke: false,
      axis: '0 0 1 1'
    });
  },

  render: function (col) {
    this.drawChart(col);
  }
});


window.CashFlowModel = Backbone.Model.extend({

});


window.CashFlowCollection = Backbone.Collection.extend({
  onChange: function () {
    this.view.render(this);
  },

  model: window.CashFlowModel
});


jQuery(window).ready(function () {
  $('.datepicker').datepicker();

  window.cashFlowChart = new window.CashFlowChart();

  window.col = new window.CashFlowCollection();
  console.log(window.col);
  window.col.view = window.cashFlowChart;
  window.col.on('add', window.col.onChange);
  window.col.on('change', window.col.onChange);

  var view = new window.CashFlowView();
});
