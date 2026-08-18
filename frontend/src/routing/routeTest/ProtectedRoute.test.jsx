import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../ProtectedRoute";

describe("ProtectedRoute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("renders children when access token exists", () => {
    localStorage.setItem("accessToken", "test-token");

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/login"
            element={<div>Login Page</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByText("Protected Content")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Login Page")
    ).not.toBeInTheDocument();
  });

  test("redirects to login when access token does not exist", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/login"
            element={<div>Login Page</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByText("Login Page")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Protected Content")
    ).not.toBeInTheDocument();
  });
});