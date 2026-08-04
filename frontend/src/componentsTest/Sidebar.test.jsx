import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";

jest.mock("axios");

jest.mock("../config", () => ({
  API_URL: "http://localhost:5000",
}));

import Sidebar from "../components/Sidebar";
jest.mock("axios");

jest.mock("../components/AvailableNotes", () => ({
  __esModule: true,
  default: ({ filesList }) => (
    <div data-testid="available-notes">
      {filesList.map((file) => (
        <div key={file._id}>{file.name}</div>
      ))}
    </div>
  ),
}));

describe("Sidebar", () => {
  const props = {
    onNew: jest.fn(),
    onSave: jest.fn(),
    onOpen: jest.fn(),
    onExport: jest.fn(),
    onSettings: jest.fn(),
    setContent: jest.fn(),
    refreshTrigger: 0,
    currentFile: {
      id: null,
      name: null,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    localStorage.setItem("accessToken", "fake-token");

    axios.get.mockImplementation((url) => {
      if (url.includes("/user/profile")) {
        return Promise.resolve({
          data: {
            success: true,
            user: {
              username: "Ahmed",
              email: "ahmed@test.com",
            },
          },
        });
      }

      if (url.includes("/note/files")) {
        return Promise.resolve({
          data: {
            success: true,
            files: [
              {
                _id: "1",
                name: "Note One",
              },
              {
                _id: "2",
                name: "Note Two",
              },
            ],
          },
        });
      }

      return Promise.resolve({ data: {} });
    });
  });

  test("renders sidebar buttons", async () => {
    render(<Sidebar {...props} />);

    expect(
      screen.getByRole("button", { name: /create new/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /open/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /save/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /export/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /settings/i })
    ).toBeInTheDocument();
  });

  test("loads user profile", async () => {
    render(<Sidebar {...props} />);

    expect(await screen.findByText("Ahmed")).toBeInTheDocument();

    expect(screen.getByText("ahmed@test.com")).toBeInTheDocument();
  });

  test("calls onNew when Create New is clicked", async () => {
    render(<Sidebar {...props} />);

    await userEvent.click(
      screen.getByRole("button", { name: /create new/i })
    );

    expect(props.onNew).toHaveBeenCalledTimes(1);
  });

  test("calls onSave when Save is clicked", async () => {
    render(<Sidebar {...props} />);

    await userEvent.click(
      screen.getByRole("button", { name: /save/i })
    );

    expect(props.onSave).toHaveBeenCalledTimes(1);
  });

  test("calls onExport when Export is clicked", async () => {
    render(<Sidebar {...props} />);

    await userEvent.click(
      screen.getByRole("button", { name: /export/i })
    );

    expect(props.onExport).toHaveBeenCalledTimes(1);
  });

  test("calls onSettings when Settings is clicked", async () => {
    render(<Sidebar {...props} />);

    await userEvent.click(
      screen.getByRole("button", { name: /settings/i })
    );

    expect(props.onSettings).toHaveBeenCalledTimes(1);
  });

  test("shows available notes after clicking Open", async () => {
    render(<Sidebar {...props} />);

    await waitFor(() =>
      expect(axios.get).toHaveBeenCalled()
    );

    await userEvent.click(
      screen.getByRole("button", { name: /open/i })
    );

    expect(
      screen.getByTestId("available-notes")
    ).toBeInTheDocument();

    expect(screen.getByText("Note One")).toBeInTheDocument();
    expect(screen.getByText("Note Two")).toBeInTheDocument();
  });
});