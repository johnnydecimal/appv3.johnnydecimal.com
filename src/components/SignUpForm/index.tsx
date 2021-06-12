// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { MasterMachineContext } from "../MasterMachine/master.machine";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export interface ISignUpFormData {
  username: string;
  password: string;
}

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const SignUpForm = () => {
  /**
   * Grab `handleSignIn` from context. This sends the `TRY_SIGNIN` event along
   * with `data`.
   */
  const { handleSignUp, state } = useContext(MasterMachineContext);

  /**
   * Set up react-hook-form.
   */
  const { handleSubmit, register } = useForm<ISignUpFormData>();

  /**
   * Set up history so we can navigate.
   */
  const history = useHistory();

  /**
   * Set up the warning box that scares you in to remembering your password.
   */
  const [warningHasBeenSeen, setWarningHasBeenSeen] = useState(false);

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
      <form onSubmit={handleSubmit((data) => handleSignUp(data))}>
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
              className="px-4 py-2 font-bold border-black justify-self-stretch focus:outline-none"
              onClick={() => history.push("/")}
            >
              Sign in
            </button>
            <button
              className={UI.buttonClass}
              disabled={UI.disabled}
              type="submit"
            >
              Sign up
            </button>
          </div>
        </div>
      </form>
      {!warningHasBeenSeen ? (
        <div
          className="mt-8 text-sm"
          onClick={() => setWarningHasBeenSeen(true)}
        >
          <h2 className="font-semibold underline">Really important message</h2>
          <p>
            Your data is end-to-end encrypted. I can't see it, ever, under any
            circumstances.
          </p>
          <p>
            As a result, it is critically important that you remember your
            password. If you forget it, I can't reset it. Your data will be
            lost. As in lost-lost, forever-encrypted lost.
          </p>
          <p>
            Click this message to make it go away. The 'Sign up' button will
            then become active.
          </p>
        </div>
      ) : null}
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
