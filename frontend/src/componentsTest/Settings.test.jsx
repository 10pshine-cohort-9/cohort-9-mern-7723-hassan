import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Settings from "../components/Setting";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Settings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("accessToken", "fake-token");
  });

  test("renders Logout and Visit Profile options", () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Visit Profile" })
    ).toBeInTheDocument();
  });

  test("logs out and navigates to login", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );

    try {
      await user.click(
        screen.getByRole("button", { name: "Logout" })
      );

      expect(localStorage.getItem("accessToken")).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    } catch (error) {
      throw new Error("Logout test failed", { cause: error });
    }
  });

  test("navigates to profile when Visit Profile is clicked", async () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Visit Profile" })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });
});