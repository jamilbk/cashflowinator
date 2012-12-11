'use strict';


window.sum = function ( a, b ) {

  return a + b;

};


window.runningSum = function ( arr ) {

  for ( var i = 0; i < arr.length; i++ ) {

    if ( i !== 0 ) arr[i] += arr[i - 1];

  }

  return arr;

};


window.CashFlowView = Backbone.View.extend({

  add: function () {

    var date = Date.parse( $( '[name=date]' ).val() ),
      amount = parseFloat( $( '[name=amount]' ).val() ),
      existing = window.col.where( { date: date.getTime() } );

    if ( existing.length > 0 ) {

      var point = existing[0],
        amounts = point.get( 'amounts' );

      amounts.push( amount );
      point.set('amounts', amounts);

      window.col.remove( point );
      window.col.add( point );

    } else {

      var attrs = { amounts: [ amount ], date: date.getTime() },
        newPoint = new window.CashFlowModel( attrs );

      window.col.add( newPoint );

    }
     
  },

  el: '#cash-flow-view',

  events: {
     
    'click [data-action=add]': 'add'
     
  }
   
});


window.CashFlowChart = Backbone.View.extend({

  el: '#cash-flow-chart',

  dateForLabel: function ( x ) {

    var d = new Date();
      
    d.setUTCTime( x );

    return d.toString( 'mm/dd/yyyy' );

  },


  drawChart: function ( col ) {

    var x = col.pluck( 'date' ),
      self = this,
      y,
      sums = [],
      allAmounts = col.pluck( 'amounts' ),
      linechartOpts;

    _.each( allAmounts, function ( amounts ) {

      sums.push( _.reduce( amounts, window.sum, 0.0 ) );

    });

    y = window.runningSum( sums );

    // Initialize drawing canvas
    if ( this.paper ) this.paper.remove();
    this.paper = window.Raphael( 'cash-flow-chart' );

    // Documented at http://g.raphaeljs.com/reference.html#Paper.linechart
    linechartOpts = {

      symbol: 'circle',

      smooth: true,

      nostroke: false,

      axis: '0 0 0 0'

    };

    this.paper.linechart( 50, 50, 600, 200, x, y, linechartOpts ).hoverColumn( function () {

      this.tags = self.paper.set();

      for ( var i = 0; i < this.y.length; i++ ) {

        this.tags.push(self.paper.tag(this.x, this.y[i], "$" + this.values[i] + " on " + self.dateForLabel( this.x ), 160, 10).insertBefore(this).attr([{ fill: "#fff" }, { fill: this.symbols[i].attr("fill") }]));

      }

    }, function () {
                                                                             
      if ( this.tags ) this.tags.remove();

    });

  },


  render: function ( col ) {

    this.drawChart( col );

  }


});


window.CashFlowModel = Backbone.Model.extend({

  defaults: {

    date: Date.now(),

  }

});


window.CashFlowCollection = Backbone.Collection.extend({

  comparator: function ( element ) {

    return element.get( 'date' );

  },

  onChange: function () {

    this.view.render( this );

  },

  model: window.CashFlowModel

});


jQuery( window ).ready( function () {

  $( '.datepicker' ).datepicker();

  window.cashFlowChart = new window.CashFlowChart();

  window.col = new window.CashFlowCollection();
  window.col.view = window.cashFlowChart;
  window.col.on( 'add change', window.col.onChange );

  ( new window.CashFlowView() );

});
