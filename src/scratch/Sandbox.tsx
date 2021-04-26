// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
// import { useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const Sandbox = () => {
  type FormData = {
    username: string;
  };
  const {
    // register,
    handleSubmit,
    // watch,
    // formState: { errors },
  } = useForm<FormData>();
  const onSubmit = handleSubmit((data) => console.log(data));

  const inputRef = useRef(null);

  useEffect(() => {
    // @ts-ignore
    inputRef.current.focus();
  }, []);

  return (
    <div className="">
      <p className="">To login, enter your details.</p>
      <p className="mb-6">To sign up, type 'signup'.</p>

      <form onSubmit={onSubmit}>
        {/* login: <span className="blink">_</span> */}
        <label>login: </label>
        <input
          autoCapitalize="none"
          autoCorrect="off"
          autoFocus={true}
          className="bg-black outline-none focus:outline-none cursor-text"
          // {...register("username")}
          ref={inputRef}
        />
      </form>
    </div>
  );
};
