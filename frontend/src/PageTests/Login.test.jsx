import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "../pages/Login";
import { BrowserRouter } from "react-router-dom";
import { loginUser } from "../api/auth";

jest.mock("../api/auth", () => ({
  loginUser: jest.fn(),
}));

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../components/AuthLayout.jsx", () => ({
  __esModule: true,
  default: ({ title, children }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

jest.mock("../components/PasswordInput.jsx", () => ({
  __esModule: true,
  default: ({ label, id, value, onChange }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name="password"
        type="password"
        value={value}
        onChange={onChange}
      />
    </div>
  ),
}));

jest.mock("../utils/validation.js", () => ({
  validateEmail: jest.fn(() => ""),
  validateLoginPassword: jest.fn(() => ""),
}));

const renderLogin = () =>
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );

describe("Login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("renders login page", () => {
    renderLogin();

    expect(
      screen.getByRole("heading", {
        name: /sign in to your account/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /sign in/i,
      })
    ).toBeInTheDocument();
  });

  test("calls login API with form values", async () => {
    loginUser.mockResolvedValue({
      data: {
        success: true,
        token: "fake-token",
      },
    });

    renderLogin();

    await userEvent.type(
      screen.getByLabelText(/email/i),
      "test@example.com"
    );

    await userEvent.type(
      screen.getByLabelText(/password/i),
      "Password123"
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: /sign in/i,
      })
    );

    expect(loginUser).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "Password123",
    });
  });

  test("shows backend error", async () => {
    loginUser.mockRejectedValue({
      response: {
        data: {
          message: "Invalid credentials",
        },
      },
    });

    renderLogin();

    await userEvent.type(
      screen.getByLabelText(/email/i),
      "test@example.com"
    );

    await userEvent.type(
      screen.getByLabelText(/password/i),
      "Password123"
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: /sign in/i,
      })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid credentials"
    );
  });
});