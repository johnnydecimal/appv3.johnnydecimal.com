// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { useContext } from "react";
import { useForm } from "react-hook-form";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { MasterMachineContext } from "../MasterMachine/master.machine";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export interface ISignInFormData {
  username: string;
  password: string;
}

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const SignInForm = () => {
  /**
   * Grab `handleSignIn` from context. This sends the `TRY_SIGNIN` event along
   * with `data`.
   */
  const { handleSignIn, state } = useContext(MasterMachineContext);

  /**
   * Set up react-hook-form.
   */
  const { handleSubmit, register } = useForm<ISignInFormData>();

  /**
   * NEXT: 2021-05-31 16:43:00
   *
   * Okay, you tried the old-school login form and it didn't work. See the notes
   * in the commit `fb2a5f5b ❌ Abandoned Unix-style login is here`.
   *
   * So let's go with a funky-box approach instead. Just a bit of fun!
   */

  /**
   * Construct the interface.
   */
  let inputBorders;
  if (state.value.signedOut !== "signInFailed") {
    inputBorders = "bg-white border-b-2 border-black focus:outline-none";
  } else {
    inputBorders = "bg-white border-b-2 border-red focus:outline-none";
  }

  return (
    <div className="mt-24">
      <form onSubmit={handleSubmit((data) => handleSignIn(data))}>
        <div className="">
          <label htmlFor="username">Username: </label>
          <input
            autoCapitalize="off"
            autoComplete="off"
            autoFocus
            className={inputBorders}
            type="text"
            {...register("username", { required: true })}
          />
        </div>
        <div className="mt-8">
          <label htmlFor="password">Password: </label>
          <input
            className={inputBorders}
            type="password"
            {...register("password", { required: true })}
          />
        </div>
        <button
          className="px-4 py-2 mt-12 border-2 border-black focus:outline-none"
          type="submit"
        >
          Sign in
        </button>
      </form>
      <div className="mt-8 text-sm">
        {state.context.log.map((entry: string, i: number) => (
          <p key={i}>{entry}</p>
        ))}
      </div>
    </div>
  );
};
