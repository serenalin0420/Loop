import tamtam2 from "../assets/tamtam2.png";
import { Coin } from "../assets/images";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="h-screen py-32 sm:h-full">
      <div className="h-screen text-center">
        <h1 className="text-8xl font-bold text-indian-khaki-500">
          4<span className="animate-horizontalSpin inline-block">0</span>4
        </h1>
        <p className="my-6 text-lg text-indian-khaki-800">
          抱歉......此頁面不存在
          <br />
          趕快回到 Loop 吧！
        </p>
        <div className="flex items-center justify-center">
          <img src={tamtam2} alt="tamtam" className="mx-6 h-72 w-auto" />
          <div className="flex max-w-max flex-col items-center gap-4">
            <Coin className="size-20 animate-swing" />

            <Link
              to="/"
              className="rounded-full bg-indian-khaki-500 px-6 py-3 text-lg text-white hover:bg-indian-khaki-600"
            >
              回 Loop 首頁
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
