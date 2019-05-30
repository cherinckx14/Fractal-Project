
var Fractal = (function(Fractal) {
	"use strict";

	// Check for double inclusion
	if (Fractal.Fractal)
		return Fractal;

	// constructor
	function FractalBase(canvas, pos) {
		if (!(this instanceof FractalBase))
			return new FractalBase(canvas, pos);

		this.width = canvas.width;
		this.height = canvas.height;
		this.ctx = canvas.getContext("2d");

		FractalBase.prototype.update.call(this, pos);
	}

	FractalBase.prototype = {
		clear : function() {
			this.ctx.clearRect(0, 0, this.width, this.height);
		},
		update: function(pos) {
			var x = pos && pos.x || 0,
			    y = pos && pos.y || 0;
			this.pos = this.pos || {x: 0, y: 0};
			this.pos.x = x;
			this.pos.y = y;
		},
		getCanvas: function() {
			return this.ctx.canvas;
		}
	};

	Fractal.Fractal = FractalBase;
	return Fractal;
}(Fractal || {}));
