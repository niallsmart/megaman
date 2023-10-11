
function MegamanAnimator(solver, el) {

    if (!solver.solution) {
        throw new Error("solver must provide solution")
    }

    this.el = el;
    this.solver = solver;
}

MegamanAnimator.prototype.render = function() {

    var self = this;

    this.el.children().detach();
    this.el.append("<div class='path'><div class='character'></div></div>");

    this.solver.blocks.forEach(function (b) {
        var block = $("<div class='block'></div>");

        if (b === 0) {
            block.css("opacity", "1.0");
        }

        var bg = "bg" + (Math.floor(Math.random() * 3) + 1);

        block.addClass(bg);

        self.el.append(block);
    });

    this.el.css("opacity", 0);

};

MegamanAnimator.prototype.start = function(interval) {
    interval = interval || 1000;
    this.render();
    this.animate(0, interval);
    this.el.fadeTo(250, 1.0);
};

MegamanAnimator.prototype.stop = function() {
    clearTimeout(this.animateTimeout);
    this.el.children().detach();
};

MegamanAnimator.prototype.moveCharacter = function(tm, interval) {

    // custom animation step for achieving "jump" effect.
    var jump = function(val, fx) {
        var pct = ((val - fx.start) / (fx.end - fx.start));

        if (pct > 0.5) {
            pct = 1 - pct;
        }

        var h = Math.sin(pct * 90 * (Math.PI / 180)) * bh;

        $(fx.elem).css("bottom", h);
    };

    var self = this,
        dx = this.solver.solution[tm],
        bw = $(".block:first").outerWidth(true),
        bh = $(".block:first").innerHeight(),
        character = $(".character", self.el),
        inAir = 0.3,
        options = {
            duration: interval * inAir,
            complete: function() {
                character.removeClass("walk jump");
                character.css("bottom", 0);
                if (tm == self.solver.solution.length - 1) {
                    setTimeout(function() {
                        character.addClass("headbanging");
                    }, 250);
                }
            }
        };

    character.removeClass("walk jump headbanging flip");

    if (dx === 0) {
        return;
    }

    if (Math.abs(dx) > 1) {
        options.step = jump;
    }

    var startAnimation = function(next) {
        character.addClass(options.step ? "jump" : "walk");
        character.toggleClass("flip", dx < 0);
        // use setTimeout to allow background animations
        // triggered by the class changes to start first.
        setTimeout(next, 0);
    };

    character.delay(interval * (1 - inAir)).queue(startAnimation).animate({
        left: "+=" + (dx * bw)
    }, options);

};


MegamanAnimator.prototype.animate = function(tm, interval) {

    if (tm >= this.solver.solution.length) {
        return;
    }

    this.moveCharacter(tm, interval);

    var self = this;

    this.solver.blocks.forEach(function (b, i) {

        if (b === 0) {
            return;
        }

        // we are scheduling animations for the next
        // frame, hence tm + 1.

        var on = self.solver.canJump(i, tm + 1);
        var block = self.el.children(".block").eq(i);

        if (on) {
            block.delay(interval * 0.4).fadeTo(interval * 0.1, 1.0);
        } else {
            block.delay(interval).fadeTo(interval * 0.1, 0.0);
        }

    });

    var self = this;

    if (interval > 0) {
        self.animateTimeout = setTimeout(function() {
            self.animate(tm + 1, interval)
        }, interval)
    }

};
