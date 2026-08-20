import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PublicRoute from "../routing/PublicRoute";

describe("PublicRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders children when access token does not exist", () => {
    jest.spyOn(Storage.prototype, "getItem").mockReturnValue(null);

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

  test("redirects authenticated user to dashboard", () => {
    jest.spyOn(Storage.prototype, "getItem").mockReturnValue("test-token");

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
});