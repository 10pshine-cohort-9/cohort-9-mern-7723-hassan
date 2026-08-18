import React from "react";
import { render, screen } from "@testing-library/react";
import {
  MemoryRouter,
  Routes,
  Route,
} from "react-router-dom";
import PublicRoute from "../PublicRoute";

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

    expect(
      screen.queryByText("Dashboard Page")
    ).not.toBeInTheDocument();
  });

  test("redirects authenticated user to dashboard", () => {
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

    expect(
      screen.queryByText("Login Content")
    ).not.toBeInTheDocument();
  });

  test("treats empty access token as unauthenticated", () => {
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

  test("renders public children for unauthenticated users", () => {
    render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route
            path="/register"
            element={
              <PublicRoute>
                <div>Register Content</div>
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
      screen.getByText("Register Content")
    ).toBeInTheDocument();
  });

  test("redirects authenticated user from register to dashboard", () => {
    localStorage.setItem("accessToken", "valid-token");

    render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route
            path="/register"
            element={
              <PublicRoute>
                <div>Register Content</div>
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

    expect(
      screen.queryByText("Register Content")
    ).not.toBeInTheDocument();
  });
});