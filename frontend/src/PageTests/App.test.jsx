import { render, screen, cleanup } from "@testing-library/react";
import App from "../App";

afterEach(() => {
  cleanup();
  window.history.pushState({}, "", "/");
});

// Mock pages so App.test.jsx focuses on routing
jest.mock("../pages/Login", () => () => (
  <div>Login Page</div>
));

jest.mock("../pages/Register", () => () => (
  <div>Register Page</div>
));

jest.mock("../pages/Dashboard", () => () => (
  <div>Dashboard Page</div>
));

jest.mock("../pages/Profile", () => () => (
  <div>Profile Page</div>
));

// Mock route guards.
// Authentication behavior will be tested separately.
jest.mock("../routing/ProtectedRoute", () => ({ children }) => (
  <>{children}</>
));

jest.mock("../routing/PublicRoute", () => ({ children }) => (
  <>{children}</>
));

describe("App Routing", () => {
  test("redirects root path to login", () => {
    window.history.pushState({}, "", "/");

    render(<App />);

    expect(screen.getByText("Login Page")).toBeTruthy();
  });

  test("renders Login page at /login", () => {
    window.history.pushState({}, "", "/login");

    render(<App />);

    expect(screen.getByText("Login Page")).toBeTruthy();
  });

  test("renders Register page at /register", () => {
    window.history.pushState({}, "", "/register");

    render(<App />);

    expect(screen.getByText("Register Page")).toBeTruthy();
  });

  test("renders Dashboard page at /dashboard", () => {
    window.history.pushState({}, "", "/dashboard");

    render(<App />);

    expect(screen.getByText("Dashboard Page")).toBeTruthy();
  });

  test("renders Profile page at /profile", () => {
    window.history.pushState({}, "", "/profile");

    render(<App />);

    expect(screen.getByText("Profile Page")).toBeTruthy();
  });

  test("redirects unknown route to login", () => {
    window.history.pushState({}, "", "/unknown-route");

    render(<App />);

    expect(screen.getByText("Login Page")).toBeTruthy();
  });
});