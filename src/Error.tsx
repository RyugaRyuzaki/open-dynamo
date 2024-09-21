import React from "react";
import {Link} from "react-router-dom";

export function Error({message}: {message: string}) {
  return (
    <div className="relative h-full w-full flex items-center">
      <div className="relative h-[50%] w-[50%] m-auto">
        <h1 className="text-2xl text-center font-bold">
          <Link
            to={"/"}
            className="text-2xl text-center font-bold w-[50%] mx-auto"
          >
            Oop!....{message}
          </Link>
        </h1>
      </div>
    </div>
  );
}
