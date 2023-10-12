# MegaMan

As a kid, one of my most memorable and frustrating game experiences was getting past the disappearing block puzzles on Mega Man 2, where (long story short) a series of blocks appear and disappear in a certain rhythm.

Sounds pretty harmless, until the block you're standing on disappears -- or the block that you're jumping to goes away mid-jump -- and you fall to your death and the level restarts, leaving you to slog your way back and repeat. As you soon discover, there are millions of possible sequences of movements, pauses and jumps (actually many more than that), most of which send you hurtling to an abrupt end.

We're older and wiser now (but still dorks), and don't have quite as much time to kill. Naturally, we figured a little code would solve these puzzles a lot faster than we would...

# Problem

So here's your mission. Given a simplified 1D map of disappearing blocks, write a function that returns the fastest sequence of moves that gets you safely across.
The map is specified as a string (e.g. `x.1.x`), where each character corresponds to either a fixed (non-disappearing) block (`x`), a disappearing block (`[1-5]`), or empty space (`.`). The map always starts and ends with fixed blocks (`x`), and your character begins on the leftmost block and must proceed (if possible) to the rightmost block, without falling into empty space.

Disappearing blocks come and go over time according to the value of their corresponding digit. Blocks marked `1` are absent for 1 second, then present for one second; blocks marked `2` are absent for 2 seconds, then present for one second, and so on all the way up to `5`. Each block is on its own timer, and the sequence repeats -- so a `2` block will be absent for 2 seconds, then appear for one second, then repeat. At the start, all blocks are absent and their timers begin.

# Example

So let's look at how the map `x.12.x` changes over time.

At the start (i.e. after 0 seconds), the field is effectively empty except for the beginning and end blocks.

0 seconds: `x....x`

After 1 second, the block marked '1' appears; the block marked '2' is still absent.

1 second: `x.=..x`

At 2 seconds, the block marked '1' disappears again, but the block marked '2' appears.

2 seconds: `x..=.x`

At 4 seconds, neither block is present, but at 5 seconds, both are present. And so the cycle continues.

4 seconds: `x....x`

5 seconds: `x.==.x`

In one second, your character can either wait and do nothing, walk one block either left or right, or jump two blocks either left or right. Your task is to return the fastest sequence of moves (subject to additional constraints below) that gets you safely from the left to the right. It's not possible to traverse more than 2 spaces in one second, and each action (waiting or moving) takes precisely 1 second.

We can describe a sequence of moves as follows: `W` for waiting one second, `L1` or `L2` for going left and `R1` or `R2` for going right one or two spaces, respectively. So, the string `WR2R1` means wait one second, go right two spaces, go right one space, and takes a total of exactly 3 seconds.

The simplest possible map is `xx`. To cross, simply walk right (`R1`). This takes 1 second. Similarly, cross `x.x` by jumping 2 spaces to the right (`R2`). This also takes 1 second. `x.x.x` is a little trickier; you need to jump right twice (`R2R2`) -- 2 seconds.
`x.1.x` has a disappearing block that appears after 1 second, so right at the start you need to initiate a jump so that you touch down after 1 second when the block appears. Then, immediately after you land, you jump again, also resulting in a sequence of `R2R2` (2 seconds.)

`x.2x` is trickier. You need to wait one second first before beginning your jump; the disappearing block in the middle doesn't appear until exactly 2 seconds have passed. So the entire sequence is `WR2R1`, arriving at the end at 3 seconds. Note that even though 2 seconds elapse before the block appears, you only wait for one second (i.e. not two), as the next second is spent mid-jump so that you arrive right as the block appears.
Now in all of these examples, you could also wait at the beginning for some extra amount of time and still come up with a safe sequence, e.g. `WWWWR2R1` for the previous map. But we're only interested in the fastest sequence; `WR2R1` takes 3 seconds, but `WWWWR2R1` takes 6.

Finally, some puzzles, like `x..x`, are unsolvable. For these, return -1.

# Summary

Write a function that given a string composed of the characters `x`, `.` and `1`-`5`, return the number of seconds it takes to cross in the best case, or -1 if the puzzle is unsolvable.

# Bonus Points

Knowing how long it takes to cross a given map is nice, but doesn't tell us precisely how that's accomplished. So, we'll modify our function to return the string corresponding to the optimal sequence (like `WR2R1`) instead of the elapsed time.

## Tiebreaking

Sometimes there are equally fast sequences, so we need some additional constraints. Specifically, given two sequences that take equal time, we want to pick the one that requires the least effort (fewest non-waiting moves) and also has the most forward progress at any given moment.

For example, consider the map `x.x.4.x`. `WWR2R2R2` solves this, as does `R2L2R2R2R2`, but the first requires 3 jumps and the latter requires 5, so `WWR2R2R2` is preferred. (Assume walking and jumping take equal effort.)

In terms of maximizing "forward progress" at every moment, `R2WWR2R2` is even better than `WWR2R2R2` (and is in fact the optimal solution) as you're further to the right while you're waiting (the `WW` part) in the first example compared to the second. This is a subtle point -- another example is the map `xxxx`; both `R2R1` and `R1R2` take the same amount of time and effort, but `R2R1` puts you further to the right after the first second compared to `R1R2`.

## Unsolvable maps

As mentioned before, some maps are impossible to solve, like `x.x...x`. But we can get as far as the third square before giving up. For unsolvable maps, return a string corresponding to the position of the farthest reachable square -- in this case, `3`; for a map like `x....x`, `1`.

## Summary

Return a string containing the optimal sequence, instead of an int. Optimal sequences are ranked first by shortest time, second by least effort (fewest non-waiting moves), third by maximizing forward progress at each time interval (i.e. maximize `sum(time*position)` over the entire sequence.) If the map is unsolvable, return the position of the farthest reachable square.

```
megaman_solve( 'xx' ) -> 'R1'
megaman_solve( 'x..x' ) -> '1'
megaman_solve( 'x.2.x' ) -> 'WR2R2'
megaman_solve( 'x4.2313x.41.x..4x143x414x' ) -> '13'
megaman_solve( 'x42x442x13x44134x215x4x.x' ) - > 'WR2R1R2R2WR2R1WWWWWR2R2R2R2R2R2R2'
```
