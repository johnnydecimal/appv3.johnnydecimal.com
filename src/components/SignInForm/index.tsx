// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { useContext, useEffect } from "react";
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
  const { handleSignIn } = useContext(MasterMachineContext);

  /**
   * Set up react-hook-form.
   */
  const { handleSubmit, register, setFocus } = useForm<ISignInFormData>();

  /**
   * NEXT: 2021-05-31 16:43:00
   *
   * You want to make this fun, which means the old login form. But of course
   * it has to work with a password manager.
   *
   * So test just hiding the password element with CSS until it's required.
   * Get the state of `username` from RHF and ... hmm no, you have to wait for
   * the user to carriage-return, don't you? Which a password manager won't do.
   *
   * But a password manager will fill both fields simultaneously. So if there's
   * a value in `password`, show it. Otherwise, wait for the user to press
   * return.
   *
   * Why? Because you want to. This is a bit of a silly waste of time, yes. But
   * it's fun, and you need something fun to get you back in to this.
   *
   * -- You've just put the onKeyDown handler there to detect the 'Return',
   *    which works.
   */
  useEffect(() => {
    setFocus("username");
  }, [setFocus]);

  return (
    <div>
      <p className="my-4">SignInForm</p>
      <form
        id="login-form"
        onSubmit={handleSubmit((data) => handleSignIn(data))}
      >
        <label>
          login:{" "}
          <input
            autoCapitalize="off"
            autoComplete="off"
            autoFocus
            className="bg-white focus:outline-none"
            id="input-field"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Tab") {
                document
                  .getElementById("password-wrapper")
                  ?.classList.remove("hidden");
                setTimeout(() => {
                  document.getElementById("password-input")?.focus();
                }, 20);
              }
            }}
            type="text"
            {...register("username", { required: true })}
          />
        </label>
        <div className="text-white" id="password-wrapper">
          <label>
            password:{" "}
            <input
              className="bg-white focus:outline-none"
              id="password-input"
              type="password"
              {...register("password", { required: true })}
            />
          </label>
          <input className="hidden" type="submit" />
        </div>
      </form>
    </div>
  );
};
