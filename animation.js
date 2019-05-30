var Fractal = (function(Fractal) {
	"use strict";

	// Check for double inclusion
	if (Fractal.Animation)
		return Fractal;

	function getMousePos(canvas, evt, pos) {
		var rect = canvas.getBoundingClientRect();
		pos = pos || {};
		pos.x = evt.clientX - rect.left;
		pos.y = evt.clientY - rect.top;
		return pos;
	}

	var slowAnimations = document.cookie.replace(/(?:(?:^|.*;\s*)slowAnimations\s*\=\s*([^;]*).*$)|^.*$/, "$1") === "true";
	// constructor
	function Animation(fractal, startPos, target, interval, step, autoDisableAnim) {
		if (!(this instanceof Animation))
			return new Animation(fractal, startPos, target, interval, step, autoDisableAnim);

		startPos = startPos || {x: 0, y: 0};
		target = target || {x: 0, y: 0};
		interval = interval || 32;
		step = step || 5;

		this.fractal = fractal;
		this.startPos = startPos;
		this.target = target;
		this.interval = interval;
		this.step = step;
		this.frameId = 0;
		this.timeoutId = 0;
		this.autoDisableAnim = !!autoDisableAnim;

		var canvas = fractal.getCanvas(),
		    pos = {x: 0, y: 0},
		    frameId = 0;

		var stepFrame = function() {
			fractal.update(pos);
			this.skip(2000);
			frameId = 0;
		}.bind(this);

		this.moveListener = function(evt) {
			if (slowAnimations && this.autoDisableAnim) {
				canvas.removeEventListener('mousemove', this);
				return;
			}

			pos = getMousePos(canvas, evt, pos);

			if (frameId)
				window.cancelAnimationFrame(frameId);
			frameId = window.requestAnimationFrame(stepFrame);
		}.bind(this);

		canvas.addEventListener('mousemove', this.moveListener, false);

		fractal.update(startPos);
	}

	Animation.prototype = {
		start: function() {
			this.stop();

			var lastTimestamp = 0,
				stepPerMs =  this.step / this.interval,
				avgDiff = 0,
				avgDiffCount = 0;

			var step = function(timestamp) {
				var diff = timestamp - (lastTimestamp || timestamp);

				if (!slowAnimations && this.autoDisableAnim) {
					// Moving average
					avgDiff += (diff - avgDiff) / ++avgDiffCount;
					if (avgDiff > 350) {
						slowAnimations = true;
						document.cookie = "slowAnimations=true; path=/;"
					}
				}
				this.frameId = window.requestAnimationFrame(step);

				// Scale the steps according to the actual time difference
				this.approachTarget(diff * stepPerMs);
				lastTimestamp = timestamp;
			}.bind(this);
			this.frameId = window.requestAnimationFrame(step);
		},
		destroy: function() {
			this.stop();
			this.fractal.getCanvas().removeEventListener('mousemove', this.moveListener);
			this.moveListener = null;
			this.fractal = null;
		},
		stop: function() {
			if (this.frameId) {
				window.cancelAnimationFrame(this.frameId);
				this.frameId = 0;
			}
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = 0;
			}
		},
		skip: function(time) {
			this.stop();

			this.timeoutId = setTimeout(function() {
				this.start();
			}.bind(this), time);
		},
		approachTarget: function(step) {
			var pos = this.fractal.pos,
			    target = this.target,
			    diff = pos.x - target.x;

			step = step || this.step;

			if (pos.x == target.x && pos.y == target.y) {
				this.stop();
				return;
			}

			if (diff < step && -diff < step) {
				pos.x = target.x;
			} else if (diff > 0) {
				pos.x -= step;
			} else {
				pos.x += step;
			}

			diff = pos.y - target.y;

			if (diff < step && -diff < step) {
				pos.y = target.y;
			} else if (diff > 0) {
				pos.y -= step;
			} else {
				pos.y += step;
			}

			if (slowAnimations && this.autoDisableAnim) {
				pos = target;
			}

			this.fractal.update(pos);
		}
	};

	Fractal.Animation = Animation;
	return Fractal;
}(Fractal || {}));
