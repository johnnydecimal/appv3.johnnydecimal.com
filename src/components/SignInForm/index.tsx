// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { useForm } from "react-hook-form";
import { useContext } from "react";
import { MasterMachineContext } from "../../machines/master.machine";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export interface ISignInFormData {
  username: string;
  password: string;
}

// import { TheMachineEvent } from "../machines/master.machine";

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const SignInForm = () => {
  const { handleSignIn, state } = useContext(MasterMachineContext);
  const { handleSubmit, register } = useForm<ISignInFormData>();

  const onSubmit = handleSubmit((formData) => {
    console.log(formData);
    handleSignIn(formData);
  });

  return (
    <div className="p-4 mt-8 border border-black">
      <p>This is SignInForm</p>
      <p>state.value: {state.toStrings()[0]}</p>
      <form onSubmit={onSubmit}>
        <label>login: </label>
        <input
          autoCapitalize="none"
          autoCorrect="off"
          autoFocus={true}
          {...register("username", { required: true })}
        />
        <label>password: </label>
        <input
          autoCapitalize="none"
          autoCorrect="off"
          autoFocus={true}
          type="password"
          {...register("password", { required: true })}
        />
        <input type="submit" />
      </form>
    </div>
  );
};