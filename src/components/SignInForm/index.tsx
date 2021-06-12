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
   * Construct it better.
   */
  const UI = {
    disabled: false,
    buttonClass: "",
    inputClass: "",
  };
  const buttonClassBase =
    "px-4 py-2 font-bold shadow-inner justify-self-stretch border-2 border-black focus:outline-none";
  const inputClassBase = "rounded-none flex-grow bg-white focus:outline-none";
  switch (true) {
    case state.matches({ signedOut: "idle" }):
    case state.matches({ signedOut: "tryingSignOut" }):
      UI.disabled = false;
      UI.buttonClass = `${buttonClassBase}`;
      UI.inputClass = `${inputClassBase} bg-white border-b-2 border-black focus:outline-none`;
      break;
    case state.matches({ signedOut: "tryingSignIn" }):
      UI.disabled = true;
      UI.buttonClass = `${buttonClassBase} cursor-wait`;
      UI.inputClass = `${inputClassBase} bg-white border-b-2 border-black focus:outline-none`;
      break;
    case state.matches({ signedOut: "signInFailed" }):
      UI.disabled = false;
      UI.buttonClass = `${buttonClassBase}`;
      UI.inputClass = `${inputClassBase} border-b-2 border-red focus:outline-none`;
      break;
    default:
      break;
  }

  return (
    <>
      <form onSubmit={handleSubmit((data) => handleSignIn(data))}>
        <div className="max-w-sm mt-24">
          <div className="flex">
            <label htmlFor="username">Username:&nbsp;</label>
            <input
              autoCapitalize="off"
              autoComplete="off"
              autoFocus
              className={UI.inputClass}
              disabled={UI.disabled}
              type="text"
              {...register("username", { required: true })}
            />
          </div>
          <div className="flex mt-8">
            <label htmlFor="password">Password:&nbsp;</label>
            <input
              className={UI.inputClass}
              type="password"
              {...register("password", { required: true })}
            />
          </div>
          <div className="grid grid-flow-col grid-cols-2 gap-2 mt-12">
            <button
              className={UI.buttonClass}
              disabled={UI.disabled}
              type="submit"
            >
              {state.value.signedOut === "tryingSignIn" ? "Wait..." : "Sign in"}
            </button>
            <button className="px-4 py-2 font-bold border-black justify-self-stretch focus:outline-none">
              Sign up
            </button>
          </div>
        </div>
      </form>
      <div className="mt-8 text-sm">
        {state.context.log.map((entry: string, i: number) => (
          <p
            className="mt-1"
            dangerouslySetInnerHTML={{ __html: entry }}
            key={i}
            style={{ paddingLeft: "10ch", textIndent: "-10ch" }}
          ></p>
        ))}
      </div>
    </>
  );
};
