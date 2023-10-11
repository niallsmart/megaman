
/**
 * Create a new solver for the given level spec.
 */
function MegamanSolver(spec) {

    if (!MegamanSolver.isValidSpec(spec)) {
        throw new Error("invalid level spec: " + spec)
    }

    this.spec = spec;

    // translate spec string into array of intervals
    this.blocks = spec.split('').map(function(ch) {
        if (ch === "x") {
            return 0;
        } else if (ch === '.') {
            return -1;
        } else {
            return parseInt(ch, 10);
        }
    });

    // max clock tick at which the block sequence
    // starts repeating = LCM(6, 5, 4, 3, 2)
    this.tickWrapsAt = 60;
}


/**
 * Returns true if the specified level spec is valid.
 */
MegamanSolver.isValidSpec = function(spec) {
    return spec.match(/^x[0-5x.]*x$/);
};


/**
 * Returns true if MegaMan can jump to block i at time tm.
 */
MegamanSolver.prototype.canJump = function(i, tm) {

    var block = this.blocks[i];

    return block === 0 || ((tm + 1) % (block + 1)) === 0;

};


/**
 * Returns the next clock tick modulo this.tickWrapsAt.
 */
MegamanSolver.prototype.nextTick = function(tm) {
    return (tm + 1) % this.tickWrapsAt;
};


/**
 * Compare two sequences of steps, returning <0, 0 or >0 as
 * s1 is more, equal or less optimal than s2.
 */
MegamanSolver.compare = function(s1, s2) {

    var l1 = s1.length,
        l2 = s2.length;

    // compare lengths first...
    if (l1 !== l2) {
        return l1 - l2;
    }

    // then cost (i.e., number of jumps) ...
    var cost = function(acc, s) { return acc + !(s === 0) },
        c1 = s1.reduce(cost, 0),
        c2 = s2.reduce(cost, 0);

    if (c1 !== c2) {
        return c1 - c2;
    }

    // then progress (i.e., position at each step)
    for (var tm = 0, p1 = 0, p2 = 0; tm < l1; tm++) {
        p1 += s1[tm];
        p2 += s2[tm];

        if (p1 !== p2) {
            return p2 - p1;
        }
    }

    return 0;
};


/**
 * Returns the optimal sequence of steps to proceed from
 * block i at time tm.  Depth is the number of steps
 * taken so far and is used for pruning the search space.
 */
MegamanSolver.prototype.best = function(i, tm, depth) {

    this.maxDepth = Math.max(this.maxDepth, depth)

    this.furthest = Math.max(i, this.furthest);

    if (depth > this.shortest) {
        return false;
    }

    if (i === this.blocks.length - 1) {
        this.shortest  = Math.min(depth, this.shortest);
        return [];
    }

    var jumps = [2, 1, 0, -1, -2];
    var solver = this;
    var solution = false;

    jumps.forEach(function (j) {

        if (solver.canJump(i + j, solver.nextTick(tm))) {
            var solved = solver.memoizedBest(i + j, solver.nextTick(tm), depth + 1);
            if (solved) {
                solved = [j].concat(solved);
            }
            if (solved && (!solution || MegamanSolver.compare(solved, solution) < 0)) {
                solution = solved;
            }
        }

    });

    return solution;
};


/**
 * Memoized version of MegamanSolver.best(). Used to avoid repeatedly
 * searching the same subset of system state.
 */
MegamanSolver.prototype.memoizedBest = function(i, tm, steps) {

    var best_i = this.memo[i];

    if (!best_i) {
        best_i = this.memo[i] = [];
    }

    if (best_i[tm] === undefined) {
        best_i[tm] = false; // block re-entry during the search.
        best_i[tm] = this.best(i, tm, steps);
    }

    return best_i[tm];
};


/**
 * Returns the optimal sequence of steps to cross the level.
 */
MegamanSolver.prototype.solve = function() {

    // the furthest across we've been
    this.furthest = 0;

    // the shortest solution found so far; initialized
    // to the number of distinct system states, which
    // is an upper bound on the solution size.
    this.shortest = this.tickWrapsAt * this.blocks.length;

    // memoized results from this.best();
    this.memo = [[]];

    this.maxDepth = 0;

    this.solution = this.memoizedBest(0, 0, 0);

    return this.solution ? this.solution : this.furthest + 1;
};

/**
 * Encode the specified steps (int[]) as a string.
 */
MegamanSolver.translate = function(steps) {
    
    return steps.map(function(b) {
        return ["L2", "L1", "W", "R1", "R2"][b + 2];
    }).join("")

};
