import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import axios from "axios";

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

jest.mock("axios");

jest.mock("../config", () => ({
  API_URL: "http://localhost:5000",
}));

import Sidebar from "../components/Sidebar";
jest.mock("axios");

jest.mock("../components/AvailableNotes", () => ({
  __esModule: true,
  default: ({ filesList, onDeleteFile, currentFileId }) => (
    <div data-testid="available-notes">
      {filesList.map((file) => (
        <button
          key={file._id}
          type="button"
          disabled={currentFileId === file._id}
          onClick={() => onDeleteFile(file._id)}
        >
          {file.name}
        </button>
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
    try {
      renderWithRouter(<Sidebar {...props} />);

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
      screen.getByRole("button", { name: /^setting$/i })
      ).toBeInTheDocument();
    } catch (error) {
      throw new Error("Sidebar: renders sidebar buttons failed", { cause: error });
    }
  });

  test("loads user profile", async () => {
    try {
      renderWithRouter(<Sidebar {...props} />);

    expect(await screen.findByText("Ahmed")).toBeInTheDocument();

      expect(screen.getByText("ahmed@test.com")).toBeInTheDocument();
    } catch (error) {
      throw new Error("Sidebar: loads user profile failed", { cause: error });
    }
  });

  test("calls onNew when Create New is clicked", async () => {
    try {
      renderWithRouter(<Sidebar {...props} />);

    await userEvent.click(
      screen.getByRole("button", { name: /create new/i })
    );

      expect(props.onNew).toHaveBeenCalledTimes(1);
    } catch (error) {
      throw new Error("Sidebar: calls onNew when Create New is clicked failed", {
        cause: error,
      });
    }
  });

  test("calls onSave when Save is clicked", async () => {
    try {
      renderWithRouter(<Sidebar {...props} />);

    await userEvent.click(
      screen.getByRole("button", { name: /save/i })
    );

      expect(props.onSave).toHaveBeenCalledTimes(1);
    } catch (error) {
      throw new Error("Sidebar: calls onSave when Save is clicked failed", {
        cause: error,
      });
    }
  });

  test("calls onExport when Export is clicked", async () => {
    try {
      renderWithRouter(<Sidebar {...props} />);

    await userEvent.click(
      screen.getByRole("button", { name: /export/i })
    );

      expect(props.onExport).toHaveBeenCalledTimes(1);
    } catch (error) {
      throw new Error("Sidebar: calls onExport when Export is clicked failed", {
        cause: error,
      });
    }
  });

  test("toggles the settings panel when Setting is clicked", async () => {
    try {
      renderWithRouter(<Sidebar {...props} />);

    await userEvent.click(
      screen.getByRole("button", { name: /^setting$/i })
    );

      expect(screen.getByText("Logout")).toBeInTheDocument();
      expect(screen.getByText("Visit Profile")).toBeInTheDocument();
    } catch (error) {
      throw new Error("Sidebar: toggles the settings panel when Setting is clicked failed", {
        cause: error,
      });
    }
  });

  test("shows available notes after clicking Open", async () => {
    try {
      renderWithRouter(<Sidebar {...props} />);

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
    } catch (error) {
      throw new Error("Sidebar: shows available notes after clicking Open failed", {
        cause: error,
      });
    }
  });
});