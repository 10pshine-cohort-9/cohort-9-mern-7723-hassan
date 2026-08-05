import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Register from "../pages/Register";
import { registerUser } from "../api/auth";

jest.mock("../api/auth", () => ({
  registerUser: jest.fn(),
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
  validateStrongPassword: jest.fn(() => ""),
  validateUsername: jest.fn(() => ""),
}));

const renderRegister = () =>
  render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  );

describe("Register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("renders register page", () => {
    renderRegister();

    expect(
      screen.getByRole("heading", {
        name: /create your account/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /create account/i,
      })
    ).toBeInTheDocument();
  });

  test("calls register API with form values", async () => {
    registerUser.mockResolvedValue({
      data: {
        success: true,
      },
    });

    renderRegister();

    await userEvent.type(
      screen.getByLabelText(/username/i),
      "Ahmed"
    );

    await userEvent.type(
      screen.getByLabelText(/email/i),
      "test@example.com"
    );

    await userEvent.type(
      screen.getByLabelText(/password/i),
      "Password123!"
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: /create account/i,
      })
    );

    expect(registerUser).toHaveBeenCalledWith({
      username: "Ahmed",
      email: "test@example.com",
      password: "Password123!",
    });
  });

  test("shows backend error", async () => {
    registerUser.mockRejectedValue(
      new Error("Unable to create your account.")
    );

    renderRegister();

    await userEvent.type(
      screen.getByLabelText(/username/i),
      "Ahmed"
    );

    await userEvent.type(
      screen.getByLabelText(/email/i),
      "test@example.com"
    );

    await userEvent.type(
      screen.getByLabelText(/password/i),
      "Password123!"
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: /create account/i,
      })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /unable to create your account/i
    );
  });
});