/**
 * This file is me spitballing the *internal* jdSystem object layout.
 *
 * Hmm what's the point of this? We're not going to push it back to Userbase.
 * It's not like it's going to make rendering any faster: we've got to calculate
 * a render object at some point, doesn't matter if it's this one.
 *
 * Crucially, it feels harder to Type.
 *
 * So this morning the idea was to write functions that added items to the
 * database. And now you're doing this. This isn't that. Go and do that.
 *
 * We need to conform to [the published spec](https://github.com/johnnydecimal/johnnydecimal.com/blob/feature/jd-language-spec/docs/language-spec/index.md).
 */
export const jdSystem = {
  // Project numbers need to be quoted or JS treats them as octal literals.
  "001": {
    jdTitle: "Project 001",
    jdMeta: {
      // This is the metadata for the thing.
      comment: "An inline comment was detected",
      note: "This is as if we had written '- Note: This is as if...'",
    },
    "00-09": {
      // See below, just a blank for example.
    },
    "10-19": {
      "00": {},
      "01": {
        jdTitle: "",
      },
    },
  },
  "002": {},
};
