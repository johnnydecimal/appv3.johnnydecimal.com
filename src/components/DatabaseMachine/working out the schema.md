We need to start building out some 'add to JD database' sort of functions.

So what does the database that we're running internally look like?

And when is it generated? By `changeHandler`, we assume?

You looked at this format earlier, why did you stop?

```js
const jdObject = {
	// "001": {
		// jdType: "project", // no, why would we?
		title: "My first project", // ditch the pointless `jd` prefix
		"00-09": {
			title: "My first area",
			meta: {
				// any shape you like
			},
			"00": {
				title: "My first category",
				"00.00": {
					title: "My first area",
					meta: {
						comment: "This is the comment on 00.00"
					}
				}
			}
		}
	// },
	/**
	 * Remember, a database = a project
	 */
	// "002": { 
	// 	// jdType: "project",
	// 	jdTitle: "The second project"
	// }
}
```

Hmm TypeScript, remember. Although I'm sure you can type this. And even if you can't, you're going to be creating it programatically so does it really matter?

So how does this work in reality?

1. Remember, `userbaseItems` is **a full JD project**. 