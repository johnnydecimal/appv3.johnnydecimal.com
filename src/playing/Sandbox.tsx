// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
// import { useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

import { GREEN } from "../constants";

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const Sandbox = () => {
  const loginInput = useRef(null);

  type FormData = {
    username: string;
  };
  const {
    register,
    handleSubmit,
    // watch,
    // formState: { errors },
  } = useForm<FormData>();
  const onSubmit = handleSubmit((data) => console.log(data));

  useEffect(() => {
    // @ts-expect-error
    loginInput.current.focus();
    console.log(loginInput);
  }, []);

  return (
    <div className="">
      <p className="">To login, enter your details.</p>
      <p className="mb-6">To sign up, type 'signup'.</p>

      <form onSubmit={onSubmit}>
        <p>
          {/* login: <span className="blink">_</span> */}
          login:{" "}
          <input
            autoCapitalize="none"
            autoCorrect="off"
            autoFocus
            className="bg-black outline-none focus:outline-none cursor-text"
            {...register("username")}
            ref={loginInput}
            style={{
              caretColor: GREEN,
            }}
          />
        </p>
      </form>
    </div>
  );
};
