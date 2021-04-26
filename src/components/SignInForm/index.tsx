// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { MasterMachineContext } from "../../machines/master.machine";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export interface ISignInFormData {
  username: string;
  password: string;
}

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const SignInForm = () => {
  /**
   * If you want to make this the sort of form that looks like a shell prompt -
   * so you type your login, you hit return, then the password field appears -
   * how would you do that?
   *
   * First, show the login field. It has to be its own form, I guess?
   * Then the submit handler for that form just stores the username in state.
   * And now we have a username in state, so we can show the second form
   * which is the password form. And *its* handler can actually do the submit.
   */

  const [userCredentials, setUserCredentials] = useState<ISignInFormData>();

  const { handleSignIn } = useContext(MasterMachineContext);
  // const { handleSubmit, register } = useForm<ISignInFormData>();

  /**
   * Set up the username form and its associated submit handlers.
   */
  const {
    handleSubmit: handleUsernameSubmit,
    register: registerUsername,
  } = useForm<any>();

  const onUsernameSubmit = handleUsernameSubmit((formData: any) => {
    setUserCredentials({
      username: formData.username,
      password: "",
    });
  });

  /**
   * Set up the password form and its associated submit handlers.
   */
  const {
    handleSubmit: handlePasswordSubmit,
    register: registerPassword,
  } = useForm<any>();

  const onPasswordSubmit = handlePasswordSubmit((formData: any) => {
    handleSignIn({
      username: userCredentials?.username,
      password: formData.password,
    });
  });

  if (!userCredentials?.username) {
    // The `login:` prompt
    return (
      <div>
        <form onSubmit={onUsernameSubmit}>
          <label>login: </label>
          <input
            autoCapitalize="none"
            autoCorrect="off"
            autoFocus={true}
            className="bg-white outline-none"
            {...registerUsername("username", { required: true })}
          />
        </form>
      </div>
    );
  } else {
    return (
      <div>
        <div>login: {userCredentials.username}</div>
        <form onSubmit={onPasswordSubmit}>
          <label>password: </label>
          <input
            autoCapitalize="none"
            autoCorrect="off"
            autoFocus={true}
            className="bg-white outline-none"
            type="password"
            {...registerPassword("password", { required: true })}
          />
        </form>
      </div>
    );
  }
};
