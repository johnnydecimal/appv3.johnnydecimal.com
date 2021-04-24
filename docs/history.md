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

Let's get a new branch going for this, `methodical-machine`. Sounds like an
Ubuntu release.

## Matt’s XState - Global state in React video

Notes here so you can jump to the key stuff.

- [31:26](https://youtu.be/1kJcnFBrk2I?t=31m26s)
  - Just do a normal `const [state, send] = useMachine(machineDef);`
- [34:20](https://youtu.be/1kJcnFBrk2I?t=34m20s)
  - This is the definition of the callback function in `services`.
  - Note that he does just `callback("THE_STRING")` but you've tried that and it
    doesn't work, you must wrap it in `{ type: "THE_STRING" }`.
- [39:00](https://youtu.be/1kJcnFBrk2I?t=39m00s)
  - The pattern where you do an `onError` on `src` to catch errors within your
    callback. Not errors you've detected and caught, rather the sort of error
    that you'd normally catch in a `try {} catch {}` block.
- [47:22](https://youtu.be/1kJcnFBrk2I?t=47m22s)
  - The 'global state' discussion starts. Here, the "just pass it through props"
    idea.
  - He literally just passes down the `send` function. Easy. But not preferred!
- [48:42](https://youtu.be/1kJcnFBrk2I?t=48m42s)
  - Heeeeeere we go using (React) context.
  - So he just "bungs it in [the machine.ts file] because I'm lazy".
  - I guess the 'correct' way to do it would be to import the machine in to
    another file, create the context, and export the context.
  - `export const AuthStateContext = React.createContext<any>({})`.
  - So that has a default value of 'an object' and just "bunged in an 'any'".
  - Then in the top-level app component, you need to wrap everything in:
    - `<AuthStateContext.Provider value={{ send }}>`
    - Where `send` is the function you destructured out of `useMachine`.
  - And now in the child component where you want this, you do a:
    - `const { send } = useContext(AuthStateContext)`
- [52:00](https://youtu.be/1kJcnFBrk2I?t=52m00s)
  - His preferred method.
  - Rather than just shooting `send` down via context, create a function which
    does a specific thing and send _that_ down.
  - And the idea here is that you're "hiding information, providing an
    abstraction" down to the component.
  - All the `<SignInForm>` needs to know is that there's a signIn function that
    it calls to do what you want.
  - And you only destructure the functions you want from context. Nice.
  - Let's just check that we know how to pass data also. Yup. Just like you'd
    expect.
- [55:00](https://youtu.be/1kJcnFBrk2I?t=55m00s)
  - An alternative pattern. The singleton.
  - Aah this is the thing where he interprets the machine right in the
    definition file, and exports the running service. Then in any other
    component he just pulls in that running service and `useService`s it.
  - So everything is done "outside of the React tree".
  - I like that idea but he seems more keen on the method above and he knows
    better than you do.
  - [This](https://www.youtube.com/watch?v=1kJcnFBrk2I&t=1h01m37s) is how you
    subscribe to the service. But it's just how you'd think, given that you've
    exported the _running service_ in the first place.
  - His main beef is the exposing of the entire state object down to the
    children. And the fact that it's harder to re-use, whereas if you want to
    re-use something that you're managing with React context you just use React
    context. No big deal.
- [1:10:20](https://youtu.be/1kJcnFBrk2I?t=1h10m20s)
  - This is where you got up to on the second review.
  - He starts to talk about using the last method to store the entire machine in
    localStorage.
  - But you don't wanna do that just now so we're stopping.
