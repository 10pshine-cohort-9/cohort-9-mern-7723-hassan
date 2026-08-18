import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PasswordInput from "../components/PasswordInput";

describe("PasswordInput", () => {
  test("renders password input with label and placeholder", () => {
    render(
      <PasswordInput
        id="password"
        label="Password"
        value=""
        onChange={jest.fn()}
      />
    );

    expect(screen.getByLabelText("Password")).toBeInTheDocument();

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

    expect(input).toHaveAttribute("type", "password");
  });

  test("shows password when eye button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <PasswordInput
        id="password"
        label="Password"
        value="secret123"
        onChange={jest.fn()}
      />
    );

    const input = screen.getByLabelText("Password");

    expect(input).toHaveAttribute("type", "password");

    const button = screen.getByRole("button", {
      name: /show password/i,
    });

    expect(button).toHaveAttribute("aria-pressed", "false");

    await user.click(button);

    expect(input).toHaveAttribute("type", "text");

    expect(
      screen.getByRole("button", {
        name: /hide password/i,
      })
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("hides password after clicking eye again", async () => {
    const user = userEvent.setup();

    render(
      <PasswordInput
        id="password"
        label="Password"
        value="secret123"
        onChange={jest.fn()}
      />
    );

    const input = screen.getByLabelText("Password");

    const showButton = screen.getByRole("button", {
      name: /show password/i,
    });

    await user.click(showButton);

    expect(input).toHaveAttribute("type", "text");

    const hideButton = screen.getByRole("button", {
      name: /hide password/i,
    });

    await user.click(hideButton);

    expect(input).toHaveAttribute("type", "password");

    expect(
      screen.getByRole("button", {
        name: /show password/i,
      })
    ).toHaveAttribute("aria-pressed", "false");
  });

  test("calls onChange when typing", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <PasswordInput
        id="password"
        label="Password"
        value=""
        onChange={onChange}
      />
    );

    const input = screen.getByLabelText("Password");

    await user.type(input, "Password123");

    expect(onChange).toHaveBeenCalled();
  });

  test("shows error message and marks input as invalid", () => {
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

    const input = screen.getByLabelText("Password");

    expect(input).toHaveAttribute("aria-invalid", "true");

    expect(input).toHaveAttribute(
      "aria-describedby",
      "password-error"
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
      screen.getByText("Use at least 8 characters")
    ).toBeInTheDocument();

    const input = screen.getByLabelText("Password");

    expect(input).toHaveAttribute(
      "aria-describedby",
      "password-hint"
    );
  });

  test("error takes priority over hint", () => {
    render(
      <PasswordInput
        id="password"
        label="Password"
        value=""
        onChange={jest.fn()}
        error="Password is required"
        hint="Use at least 8 characters"
      />
    );

    expect(
      screen.getByText("Password is required")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Use at least 8 characters")
    ).not.toBeInTheDocument();

    expect(
      screen.getByLabelText("Password")
    ).toHaveAttribute(
      "aria-describedby",
      "password-error"
    );
  });

  test("does not set aria-describedby when there is no error or hint", () => {
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
    ).not.toHaveAttribute("aria-describedby");
  });

  test("uses current-password autocomplete by default", () => {
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
    ).toHaveAttribute(
      "autocomplete",
      "current-password"
    );
  });

  test("supports custom autocomplete value", () => {
    render(
      <PasswordInput
        id="password"
        label="Password"
        value=""
        onChange={jest.fn()}
        autoComplete="new-password"
      />
    );

    expect(
      screen.getByLabelText("Password")
    ).toHaveAttribute(
      "autocomplete",
      "new-password"
    );
  });
});