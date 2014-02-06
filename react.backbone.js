'use strict';
var Backbone = require('backbone');
var React = require('react');
var _ = require('lodash');

// Stripped from https://github.com/usepropeller/react.backbone/blob/master/react.backbone.js
React.BackboneMixin = {
    _subscribe: function(model) {
        if (!model) {
            return;
        }

        // Detect if it's a collection
        if (model instanceof Backbone.Collection) {
            model.on('add remove reset sort', this._throttledForceUpdate, this);
        }
        else if (model) {
            var changeOptions = this.changeOptions || 'change';
            model.on(changeOptions, (this.onModelChange || this._throttledForceUpdate), this);
        }
    },
    _unsubscribe: function(model) {
        if (!model) {
            return;
        }
        model.off(null, null, this);
    },
    componentDidMount: function() {
        // Wrap in function rather than using bind, bind will cause an invariant violation as the
        // parameters that are passed are not what react expects.
        this._throttledForceUpdate = _.throttle(function(){ this.forceUpdate();}, 50);
        
        // Whenever there may be a change in the Backbone data, trigger a reconcile.
        this._subscribe(this.props.model);
    },
    componentWillReceiveProps: function(nextProps) {
        if (this.props.model !== nextProps.model) {
            this._unsubscribe(this.props.model);
            this._subscribe(nextProps.model);
        }
    },
    componentWillUnmount: function() {
        // Ensure that we clean up any dangling references when the component is destroyed.
        this._unsubscribe(this.props.model);
    }
};

React.createBackboneClass = function(spec) {
    var currentMixins = spec.mixins || [];

    spec.mixins = currentMixins.concat([React.BackboneMixin]);
    spec.getModel = function() {
        return this.props.model;
    };
    spec.model = function() {
        return this.getModel();
    };
    spec.el = function() {
        return this.isMounted() && this.getDOMNode();
    };
    return React.createClass(spec);
};

module.exports = React;
