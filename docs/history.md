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

# Doing the machine methodically

Let's get a new branch going for this, `methodical-machine`. Sounds like an Ubuntu release.

## Matt’s XState - Global state in React video

Notes here so you can jump to the key stuff.

- [31:26](https://youtu.be/1kJcnFBrk2I?t=31m26s)
  - Just do a normal `const [state, send] = useMachine(machineDef);`
- [34:20](https://youtu.be/1kJcnFBrk2I?t=34m20s)
  - This is the definition of the callback function in `services`.
  - Note that he does just `callback("THE_STRING")` but you've tried that and it doesn't work, you must wrap it in `{ type: "THE_STRING" }`.
- [39:00](https://youtu.be/1kJcnFBrk2I?t=39m00s)
  - The pattern where you do an `onError` on `src` to catch errors within your callback. Not errors you've detected and caught, rather the sort of error that you'd normally catch in a `try {} catch {}` block.
- [47:22](https://youtu.be/1kJcnFBrk2I?t=47m22s)
  - The 'global state' discussion starts. Here, the "just pass it through props" idea.
  - He literally just passes down the `send` function. Easy. But not preferred!
- [48:42](https://youtu.be/1kJcnFBrk2I?t=48m42s)
  - Heeeeeere we go using (React) context.
  - So he just "bungs it in [the machine.ts file] because I'm lazy".
  - I guess the 'correct' way to do it would be to import the machine in to another file, create the context, and export the context.
  - `export const AuthStateContext = React.createContext<any>({})`.
  - So that has a default value of 'an object' and just "bunged in an 'any'".
  - Then in the top-level app component, you need to wrap everything in:
    - `<AuthStateContext.Provider value={{ send }}>`
    - Where `send` is the function you destructured out of `useMachine`.
  - And now in the child component where you want this, you do a:
    - `const { send } = useContext(AuthStateContext)`
