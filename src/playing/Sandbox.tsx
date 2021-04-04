// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
// import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const Sandbox = () => {
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

  return (
    <div className="">
      <p className="">To login, enter your details.</p>
      <p className="mb-6">To sign up, type 'signup'.</p>

      <form onSubmit={onSubmit}>
        <p>
          {/* login: <span className="blink">_</span> */}
          login:{" "}
          <input
            autoFocus
            className="bg-black outline-none focus:outline-none cursor-text"
            {...register("username")}
          />
        </p>
      </form>
    </div>
  );
};
