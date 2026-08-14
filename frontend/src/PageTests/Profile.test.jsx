import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import axios from "axios";
import Profile from "../pages/Profile";

jest.mock("axios");

jest.mock("../config", () => ({
  API_URL: "http://localhost:5000",
}));

const renderProfile = () =>
  render(
    <MemoryRouter initialEntries={["/profile"]}>
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<h1>Dashboard</h1>} />
      </Routes>
    </MemoryRouter>
  );

describe("Profile navigation", () => {
  beforeEach(() => {
    localStorage.setItem("accessToken", "fake-token");
    axios.get.mockResolvedValue({
      data: {
        success: true,
        user: { username: "Ahmed", email: "ahmed@test.com" },
        files: [],
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Home navigates to Dashboard", async () => {
    const user = userEvent.setup();
    renderProfile();

    await user.click(screen.getByRole("button", { name: /^home$/i }));

    expect(await screen.findByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
  });

  test("Create New navigates to Dashboard", async () => {
    const user = userEvent.setup();
    renderProfile();

    await user.click(screen.getByRole("button", { name: /create new/i }));

    expect(await screen.findByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
  });
});
