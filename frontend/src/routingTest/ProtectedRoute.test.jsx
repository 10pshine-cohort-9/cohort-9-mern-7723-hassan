import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PublicRoute from "../routing/PublicRoute";

describe("PublicRoute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("renders children when access token does not exist", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <div>Login Content</div>
              </PublicRoute>
            }
          />

          <Route
            path="/dashboard"
            element={<div>Dashboard Page</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByText("Login Content")
    ).toBeInTheDocument();
  });

  test("redirects to dashboard when access token exists", () => {
    localStorage.setItem("accessToken", "test-token");

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <div>Login Content</div>
              </PublicRoute>
            }
          />

          <Route
            path="/dashboard"
            element={<div>Dashboard Page</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByText("Dashboard Page")
    ).toBeInTheDocument();
  });

  test("renders children when access token is empty", () => {
    localStorage.setItem("accessToken", "");

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <div>Login Content</div>
              </PublicRoute>
            }
          />

          <Route
            path="/dashboard"
            element={<div>Dashboard Page</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByText("Login Content")
    ).toBeInTheDocument();
  });
});