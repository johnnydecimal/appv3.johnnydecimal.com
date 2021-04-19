# How this thing was built

1. Set up with CRA.
2. Add Tailwind & some fonts @ `3ced9b09`.
3. Add React Router @ `df0299f0`.

Now think about it, how do you want to build this out? Just bit-by-bit as it
goes? Install things as you need them.

# Colour pallet

[This](https://colordesigner.io/#DC3522-D9CB9E-374140-2A2C2B-BDC3C7) is nice.

# Let's get the machine going

It's nothing without the machine. And we're going to rock `xstate-codegen` right
from the off. So add it, it complains about `@babel/plugin-transform-typescript`
so we add that, and `@xstate/inspect` and other XState stuff, and `userbase-js`
so we can actually connect to a database.

And don't forget we're doing `npx xstate-codegen "src/**/**.machine.ts"`.
