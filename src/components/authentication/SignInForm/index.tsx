// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { useContext } from "react";
import { useForm } from "react-hook-form";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { AuthMachineReactContext } from "../../../components";
import { LogViewer } from "../../../components";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export interface ISignInFormData {
  username: string;
  password: string;
}

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const SignInForm = () => {
  /**
   * Grab `handleSignIn` from context. This sends the `attempt signin` event
   * along with `data`.
   */
  const { handleSignIn, state, switchToSignUp } = useContext(
    AuthMachineReactContext
  );

  /**
   * Set up react-hook-form.
   */
  const { handleSubmit, register } = useForm<ISignInFormData>();

  /**
   * Construct the UI.
   */
  const UI = {
    disabled: false,
    buttonClass: "",
    inputClass: "",
  };
  const buttonClassBase =
    "px-4 py-2 font-bold shadow-inner justify-self-stretch border-2 border-black focus:outline-none";
  const inputClassBase =
    "rounded-none flex-grow bg-white border-b-2 focus:outline-none";
  switch (true) {
    case state.matches({ signedOut: "idle" }):
    case state.matches({ signedOut: "tryingSignOut" }):
      UI.disabled = false;
      UI.buttonClass = `${buttonClassBase}`;
      UI.inputClass = `${inputClassBase} border-black`;
      break;
    case state.matches({ signedOut: "tryingSignIn" }):
      UI.disabled = true;
      UI.buttonClass = `${buttonClassBase} cursor-wait`;
      UI.inputClass = `${inputClassBase} border-black text-grey`;
      break;
    case state.matches({ signedOut: "signInFailed" }):
      UI.disabled = false;
      UI.buttonClass = `${buttonClassBase}`;
      UI.inputClass = `${inputClassBase} border-red text-red`;
      break;
    default:
      break;
  }

  return (
    <>
      <form onSubmit={handleSubmit((data) => handleSignIn(data))}>
        <div className="max-w-sm mt-20">
          <h1 className="mb-10 text-3xl font-bold">Sign in</h1>
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
              disabled={UI.disabled}
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
            <button
              className="px-4 py-2 font-bold border-black justify-self-stretch focus:outline-none"
              onClick={switchToSignUp}
            >
              Sign up
            </button>
          </div>
        </div>
      </form>
      <div className="my-8 text-sm">
        <LogViewer log={state.context.log} />
      </div>
    </>
  );
};
