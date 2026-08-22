import React from "react";
import { render, screen } from "@testing-library/react";
import AuthLayout from "../components/AuthLayout";

describe("AuthLayout", () => {
  test("renders brand content and children", () => {
    render(
      <AuthLayout title="Create your account">
        <input placeholder="Username" />
      </AuthLayout>
    );

    expect(screen.getByText("ME-Notes")).toBeInTheDocument();

    expect(
      screen.getByText(/pick up right where/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/simple, secure, and reliable note-taking app/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /create your account/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Username")
    ).toBeInTheDocument();
  });


  test("renders eyebrow when provided", () => {
    render(
      <AuthLayout
        eyebrow="Welcome Back"
        title="Sign In"
      />
    );

    expect(
      screen.getByText("Welcome Back")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /sign in/i,
      })
    ).toBeInTheDocument();
  });


  test("renders subtitle when provided", () => {
    render(
      <AuthLayout
        title="Login"
        subtitle="Enter your credentials"
      />
    );

    expect(
      screen.getByText("Enter your credentials")
    ).toBeInTheDocument();
  });


  test("renders footer when provided", () => {
    render(
      <AuthLayout
        title="Register"
        footer={
          <span>
            Already have an account?
          </span>
        }
      />
    );

    expect(
      screen.getByText(/already have an account/i)
    ).toBeInTheDocument();
  });


  test("does not render optional content when not provided", () => {
    render(
      <AuthLayout title="Login">
        <button>Submit</button>
      </AuthLayout>
    );

    expect(
      screen.queryByText("Welcome Back")
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Enter your credentials")
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText(/already have an account/i)
    ).not.toBeInTheDocument();
  });
});