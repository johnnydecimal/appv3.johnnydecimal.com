// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { useForm } from "react-hook-form";
import { useService } from "@xstate/compiled/react";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
interface FormData {
  username: string;
  password: string;
}

// import { TheMachineEvent } from "../machines/master.machine";

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const SignInForm = ({ masterMachineService }: any) => {
  const [state, send] = useService(masterMachineService);
  const { handleSubmit, register } = useForm<FormData>();

  const onSubmit = handleSubmit((formData) => {
    console.log(formData);
    send({
      type: "TRY_SIGNIN",
      // data: formData,
    });
  });

  return (
    <div className="p-4 mt-8 border border-black">
      <p>This is SignInForm</p>
      <p>state.value: {state.value}</p>
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
