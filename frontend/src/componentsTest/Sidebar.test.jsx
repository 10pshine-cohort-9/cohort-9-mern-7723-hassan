import React from "react";
import { render, screen, waitFor,fireEvent } from "@testing-library/react";
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
  default: ({ filesList, onOpenFile, onDeleteFile, currentFileId }) => {
    const React = require("react");
    return (
    <div data-testid="available-notes">
      {filesList.map((file) => (
        <React.Fragment key={file._id}>
          <button
            type="button"
            disabled={currentFileId === file._id}
            onClick={() => onDeleteFile(file._id)}
          >
            {file.name}
          </button>
          <button type="button" onClick={() => onOpenFile(file._id)}>
            Open {file.name}
          </button>
        </React.Fragment>
      ))}
    </div>
    );
  },
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

    window.alert = jest.fn();

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
                _id: "507f1f77bcf86cd799439011",
                name: "Note One",
              },
              {
                _id: "507f1f77bcf86cd799439012",
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

  test("renders Home button and hides Save/Export/Import when isProfile is true", async () => {
    renderWithRouter(<Sidebar {...props} isProfile={true} />);

    expect(screen.getByRole("button", { name: /home/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /save/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /export/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /import/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /open/i })).not.toBeInTheDocument();
  });

  test("deletes a file when delete is clicked from AvailableNotes", async () => {
    axios.delete.mockResolvedValue({ data: { success: true } });

    renderWithRouter(<Sidebar {...props} />);

    await userEvent.click(screen.getByRole("button", { name: /open/i }));
    await userEvent.click(screen.getByText("Note One"));

    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
    expect(axios.delete).toHaveBeenCalledWith(
      expect.stringContaining("/note/507f1f77bcf86cd799439011"),
      expect.objectContaining({
        headers: { Authorization: "Bearer fake-token" },
      })
    );
  });

  test("shows an alert and does not call axios when file open fails", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/note/") && !url.includes("files")) {
        return Promise.reject(new Error("Network error"));
      }
      if (url.includes("/user/profile")) {
        return Promise.resolve({
          data: { success: true, user: { username: "Ahmed", email: "a@test.com" } },
        });
      }
      if (url.includes("/note/files")) {
        return Promise.resolve({
          data: { success: true, files: [{ _id: "507f1f77bcf86cd799439011", name: "Note One" }] },
        });
      }
      return Promise.resolve({ data: {} });
    });

    renderWithRouter(<Sidebar {...props} />);

    await userEvent.click(screen.getByRole("button", { name: /open/i }));
    await waitFor(() => expect(screen.getByText("Note One")).toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: "Open Note One" }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith("Failed to open file"));
  });

 test("shows an alert when importing a non-txt file", async () => {
  renderWithRouter(<Sidebar {...props} />);

  const fileInput = document.querySelector('input[type="file"]');
  const badFile = new File(["content"], "notes.pdf", { type: "application/pdf" });

  fireEvent.change(fileInput, { target: { files: [badFile] } });

  await waitFor(() =>
    expect(window.alert).toHaveBeenCalledWith("Only .txt files can be imported.")
  );
});

  test("imports a valid txt file", async () => {
    const onImport = jest.fn();

    renderWithRouter(<Sidebar {...props} onImport={onImport} />);

    const fileInput = document.querySelector('input[type="file"]');
    const goodFile = new File(["hello world"], "notes.txt", { type: "text/plain" });
    goodFile.text = jest.fn().mockResolvedValue("hello world");

    await userEvent.upload(fileInput, goodFile);

    await waitFor(() => expect(onImport).toHaveBeenCalledWith("hello world", "notes.txt"));
  });

  test("closes the settings dropdown when clicking outside", async () => {
    renderWithRouter(<Sidebar {...props} />);

    await userEvent.click(screen.getByRole("button", { name: /^setting$/i }));
    expect(screen.getByText("Logout")).toBeInTheDocument();

    await userEvent.click(document.body);

    await waitFor(() =>
      expect(screen.queryByText("Logout")).not.toBeInTheDocument()
    );
  });
});
