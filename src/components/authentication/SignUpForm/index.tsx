// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { useContext } from "react";
import { useForm } from "react-hook-form";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { AuthMachineReactContext } from "../AuthMachine/context";
import { LogViewer } from "../LogViewer";

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
  const {
    handleAcknowledgeDireWarningAboutE2EEncryption,
    handleSignUp,
    state,
    switchToSignIn,
  } = useContext(AuthMachineReactContext);

  /**
   * Set up react-hook-form.
   */
  const { handleSubmit, register } = useForm<ISignUpFormData>();

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
    case state.matches({
      signUp: "direWarningAboutE2EEncryptionNotAcknowledged",
    }):
      UI.disabled = true;
      UI.buttonClass = `${buttonClassBase}`;
      UI.inputClass = `${inputClassBase} border-black`;
      break;
    case state.matches({
      signUp: "okayToTrySignUp",
    }):
      UI.disabled = false;
      UI.buttonClass = `${buttonClassBase}`;
      UI.inputClass = `${inputClassBase} border-black`;
      break;
    case state.matches({ signUp: "tryingSignUp" }):
      UI.disabled = true;
      UI.buttonClass = `${buttonClassBase} cursor-wait`;
      UI.inputClass = `${inputClassBase} border-black text-grey`;
      break;
    case state.matches({ signUp: "signUpFailed" }):
      UI.disabled = false;
      UI.buttonClass = `${buttonClassBase}`;
      UI.inputClass = `${inputClassBase} border-red text-red`;
      break;
    default:
      break;
  }

  return (
    <>
      <form onSubmit={handleSubmit((data) => handleSignUp(data))}>
        <div className="max-w-sm mt-20">
          <h1 className="mb-10 text-3xl font-bold">Sign up</h1>
          <div className="flex">
            <label htmlFor="username">Username:&nbsp;</label>
            <input
              autoCapitalize="off"
              autoComplete="off"
              autoFocus
              className={UI.inputClass}
              disabled={UI.disabled}
              id="username"
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
              className="px-4 py-2 font-bold border-black justify-self-stretch focus:outline-none"
              onClick={switchToSignIn}
              type="button"
              value="Sign in"
            >
              Sign in
            </button>
            <button
              className={UI.buttonClass}
              disabled={UI.disabled}
              type="submit"
            >
              {state.value.signUp ===
              "direWarningAboutE2EEncryptionNotAcknowledged"
                ? "↓ Read below ↓"
                : state.value.signUp === "tryingSignUp"
                ? "Wait..."
                : "Sign up"}
            </button>
          </div>
        </div>
      </form>
      {state.matches("signUp.direWarningAboutE2EEncryptionNotAcknowledged") ? (
        <div
          className="p-4 mt-8 text-sm border cursor-pointer border-red"
          onClick={() => handleAcknowledgeDireWarningAboutE2EEncryption()}
        >
          <h2 className="font-bold text-red">Really important message</h2>
          <p className="my-2">
            Your data is end-to-end encrypted. I can't see it, ever, under any
            circumstances.
          </p>
          <p className="my-2">
            Because of this, it is{" "}
            <span className="font-semibold">critically important</span> that you
            remember your password. If you forget it, I can't reset it. Your
            data will be lost. As in lost-lost, forever-encrypted-much-sadness
            lost.
          </p>
          <p className="mt-2">
            Click anywhere on this message to make it go away. The form above
            will then become active.
          </p>
        </div>
      ) : null}
      <div className="my-8 text-sm">
        <LogViewer log={state.context.log} />
      </div>
    </>
  );
};
