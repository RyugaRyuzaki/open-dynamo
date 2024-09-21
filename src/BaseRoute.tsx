import {Routes, Route} from "react-router-dom";
import {Helmet} from "react-helmet";
import {Error} from "./Error";
import SuspensePage from "@components/suspense/SuspensePage";
import {lazy, Suspense} from "react";
const BimViewer = lazy(() => import("./pages/viewer/BimViewer"));
const BaseRoute = () => {
  return (
    <Routes>
      <Route
        index
        element={
          <>
            <Helmet>
              <title>Open-dynamo</title>
            </Helmet>
            <Suspense fallback={<SuspensePage />}>
              <BimViewer />
            </Suspense>
          </>
        }
      />
      <Route path="*" element={<Error message="Opp!" />} />
    </Routes>
  );
};

export default BaseRoute;
