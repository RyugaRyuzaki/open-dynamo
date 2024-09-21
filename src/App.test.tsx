import {render} from "@testing-library/react";
import {screen} from "@testing-library/dom";
import App from "./App";
it("Render", () => {
  render(<App />);
  const message = screen.queryAllByText("Link");
  expect(message).toBeDefined();

  const cookieConsent = screen.getByText(/This website uses cookies/i);
  expect(cookieConsent).toBeInTheDocument();
  const baseRoute = screen.getByText(/Hello/i); // Kiểm tra nội dung "Hello" trong BaseRoute
  expect(baseRoute).toBeInTheDocument();
});
