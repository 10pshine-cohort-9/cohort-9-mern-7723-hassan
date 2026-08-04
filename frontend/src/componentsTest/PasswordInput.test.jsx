import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PasswordInput from "../components/PasswordInput";

describe("PasswordInput", () => {
  test("renders password input with label", () => {
    render(
      <PasswordInput
        id="password"
        label="Password"
        value=""
        onChange={jest.fn()}
      />
    );

    expect(
      screen.getByLabelText("Password")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter your password")
    ).toBeInTheDocument();
  });


  test("input type is password by default", () => {
    render(
      <PasswordInput
        id="password"
        label="Password"
        value="secret123"
        onChange={jest.fn()}
      />
    );

    const input = screen.getByLabelText("Password");

    expect(input).toHaveAttribute(
      "type",
      "password"
    );
  });


  test("shows password when eye button is clicked", async () => {
    render(
      <PasswordInput
        id="password"
        label="Password"
        value="secret123"
        onChange={jest.fn()}
      />
    );

    const button = screen.getByRole("button", {
      name: /show password/i,
    });

    await userEvent.click(button);

    const input = screen.getByLabelText("Password");

    expect(input).toHaveAttribute(
      "type",
      "text"
    );

    expect(button).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });


  test("hides password after clicking eye again", async () => {
    render(
      <PasswordInput
        id="password"
        label="Password"
        value="secret123"
        onChange={jest.fn()}
      />
    );

    const button = screen.getByRole("button", {
      name: /show password/i,
    });

    await userEvent.click(button);

    await userEvent.click(
      screen.getByRole("button", {
        name: /hide password/i,
      })
    );

    const input = screen.getByLabelText("Password");

    expect(input).toHaveAttribute(
      "type",
      "password"
    );
  });


  test("calls onChange when typing", async () => {
    const onChange = jest.fn();

    render(
      <PasswordInput
        id="password"
        label="Password"
        value=""
        onChange={onChange}
      />
    );

    await userEvent.type(
      screen.getByLabelText("Password"),
      "Password123"
    );

    expect(onChange).toHaveBeenCalled();
  });


  test("shows error message", () => {
    render(
      <PasswordInput
        id="password"
        label="Password"
        value=""
        onChange={jest.fn()}
        error="Password is required"
      />
    );

    expect(
      screen.getByText("Password is required")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Password")
    ).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });


  test("shows hint when no error exists", () => {
    render(
      <PasswordInput
        id="password"
        label="Password"
        value=""
        onChange={jest.fn()}
        hint="Use at least 8 characters"
      />
    );

    expect(
      screen.getByText(
        "Use at least 8 characters"
      )
    ).toBeInTheDocument();
  });
});