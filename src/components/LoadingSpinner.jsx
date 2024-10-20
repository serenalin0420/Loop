import { Coin } from "../assets/images";

const LoadingSpinner = () => {
  return (
    <div className="col-span-3 mt-6 flex h-screen items-center justify-center">
      <div className="flex flex-col items-center justify-center text-indian-khaki-800">
        <Coin className="my-2 size-16 animate-swing" />
        <p>請再稍等一下...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
