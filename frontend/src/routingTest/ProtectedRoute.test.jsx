import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../routing/ProtectedRoute";

const renderProtectedRoute = () => {
  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Dashboard Content</div>
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
};

describe("ProtectedRoute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("renders children when access token exists", () => {
    localStorage.setItem("accessToken", "test-token");

    renderProtectedRoute();

    expect(
      screen.getByText("Dashboard Content")
    ).toBeInTheDocument();
  });

  test("redirects to login when access token does not exist", () => {
    renderProtectedRoute();

    expect(
      screen.getByText("Login Page")
    ).toBeInTheDocument();
  });
});