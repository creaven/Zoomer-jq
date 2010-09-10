/*
---
 
name: Zoomer
description: Class to show zoomed image inside original. MooTools Zoomer port
license: MIT-Style License (http://mifjs.net/license.txt)
copyright: Anton Samoylov (http://mifjs.net)
authors: Anton Samoylov (http://mifjs.net)
requires: jQuery1.4
provides: Zoomer
 
...
*/

var Zoomer = function(element, options){
	this.initialize.apply(this, arguments);
	return this;
};


Zoomer.prototype = {
	
	version: '1.8.2',

	initialize: function(element, options){
		var dflt = {
			smooth: 6
		};
		this.options = $.extend(dflt, options || {});
		this.small = $(element);
		var self = this;
		if(!this.small[0].complete){
			this.small.bind('load', function(){
				self.prepareSmall();
			});
		}else{
			this.prepareSmall();
		}
		var src = this.options.big || this.small.attr('big');
		var img = new Image();
		img.src = src;
		this.big = $(img).css({
			position: 'absolute',
			top: 0,
			left: 0,
			cursor: 'crosshair'
		}).hide();
		if(!this.big[0].complete){
			this.big.bind('load', function(){
				self.prepareBig();
			});
		}else{
			this.prepareBig();
		}
	},
	
	prepareSmall: function(){
		this.small.wrap('<div class="zoomer-wrapper"></div>');
		this.wrapper = this.small.parent();
		var self = this;
		function getComputedStyle(element, property){
			if (element.currentStyle) return element.currentStyle[property];
			var computed = document.defaultView.getComputedStyle(element, null);
			return (computed) ? computed.getPropertyValue(property) : null;
		};
		$.each(['margin', 'left', 'top', 'bottom', 'right', 'float', 'clear', 'border', 'padding'], function(i, p){
			var style;
			if($.inArray(p, ['left', 'top', 'bottom', 'right']) != -1){
				style = getComputedStyle(self.small[0], p);
			}else{
				style = self.small.css(p);
			}
			if(p == 'margin' && style == 'auto') return;
			var dflt = 'auto';
			if($.inArray(p, ['float', 'clear', 'border']) != -1) dflt = 'none';
			if(p == 'padding') dflt = '0';
			try{
				self.small.css(p, dflt);
				self.wrapper.css(p, style);
			}catch(e){};
		});
		this.wrapper.css({
			width: this.small[0].offsetWidth,
			height: this.small[0].offsetHeight,
			position: 'relative',
			overflow: 'hidden'
		});
		this.smallSize = {
			width: this.small[0].width,
			height: this.small[0].height
		};
		if(this.bigPrepared){
			this.ready();
		}else{
			this.smallPrepared = true;
		}
	},
	
	prepareBig: function(){
		this.bigSize = {
			width: this.big[0].width,
			height: this.big[0].height
		};
		if(this.smallPrepared){
			this.ready();
		}else{
			this.bigPrepared = true;
		}
	},
	
	ready: function(){
		this.big.appendTo(this.wrapper);
		this.big.wrap('<div class="zoomer-wrapper-big"></div>');
		this.bigWrapper = this.big.parent();
		this.bigWrapper.css({
			position: 'absolute',
			overflow: 'hidden',
			top: this.small.offset().top - this.wrapper.offset().top - parseInt(this.wrapper.css('border-top-width'), 10) || 0,
			left: this.small.offset().left - this.wrapper.offset().left - parseInt(this.wrapper.css('border-left-width'), 10) || 0,
			width: this.small[0].offsetWidth,
			height: this.small[0].offsetHeight,
			background: 'url("' + this.small.attr('src') + '")'
		}).mouseenter($.proxy(this.startZoom, this))
		.mouseleave($.proxy(this.stopZoom, this))
		.mousemove($.proxy(this.move, this));
	},
	
	move: function(event){
		this.dstPos = {x: event.pageX, y: event.pageY};
	},
	
	startZoom: function(){
		this.position = this.small.offset();
		
		/** precalculations **/
		this.ratio = {
			x: 1 - this.bigSize.width / this.smallSize.width,
			y: 1 - this.bigSize.height / this.smallSize.height
		};
		this.current = {
			left: parseInt(this.big.css('left'), 10),
			top: parseInt(this.big.css('top'), 10)
		};
		
		this.timer = setInterval($.proxy(this.zoom, this), 10);
		this.big.fadeIn();
	},
	
	stopZoom: function(){
		clearInterval(this.timer);
		this.big.fadeOut();
	},
	
	zoom: function(){
		if(!this.dstPos) return;
		var steps = this.options.smooth;
		var dst = {
			left: parseInt((this.dstPos.x - this.position.left) * this.ratio.x, 10),
			top: parseInt((this.dstPos.y - this.position.top) * this.ratio.y, 10)
		};
		this.current.left -= (this.current.left - dst.left) / steps;
		this.current.top -= (this.current.top - dst.top) / steps;
		
		this.big.css(this.current);
	}
	
};

$.fn.zoomer = function(options){
	for(var i = 0, l = this.length; i < l; i++){
		new Zoomer(this[i], options);
	}
};
