'use strict';

window.CashFlowView = Backbone.View.extend({
  el: '#cash-flow-view',
});

window.CashFlowModel = Backbone.Model.extend({

});

window.CashFlowCollection = Backbone.Collection.extend({

});

jQuery(document).ready(function () {
  var cashFlowView = new window.CashFlowView();
  cashFlowView.render();
});
