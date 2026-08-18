import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dashboard from "../pages/Dashboard";
import { connectSocket, disconnectSocket } from "../socket";

jest.mock("../components/Heading", () => {
  return function MockHeading({ isOpen, toggleSidebar }) {
    return (
      <div data-testid="heading">
        <span>Heading</span>
        <span data-testid="sidebar-status">
          {isOpen ? "open" : "closed"}
        </span>

        <button
          type="button"
          aria-label="Toggle sidebar"
          onClick={toggleSidebar}
        >
          Toggle Sidebar
        </button>
      </div>
    );
  };
});

jest.mock("../components/Sidebar", () => {
  return function MockSidebar({
    onNew,
    onOpen,
    onSave,
    onExport,
    onImport,
    currentFile,
    refreshTrigger,
  }) {
    return (
      <div data-testid="sidebar">
        <span data-testid="current-file">
          {currentFile?.name || "No file"}
        </span>

        <span data-testid="refresh-trigger">
          {refreshTrigger}
        </span>

        <button type="button" onClick={onNew}>
          New File
        </button>

        <button
          type="button"
          onClick={() =>
            onOpen({
              _id: "123",
              name: "Test Note",
              content: "<p>Hello World</p>",
            })
          }
        >
          Open File
        </button>

        <button
          type="button"
          onClick={() =>
            onOpen({
              _id: "124",
              name: "Test Note.txt",
              content: "<p>Hello World</p>",
            })
          }
        >
          Open TXT File
        </button>

        <button type="button" onClick={onSave}>
          Save File
        </button>

        <button type="button" onClick={onExport}>
          Export File
        </button>

        <button
          type="button"
          onClick={() =>
            onImport("<p>Imported Content</p>", "imported.txt")
          }
        >
          Import File
        </button>
      </div>
    );
  };
});

jest.mock("../components/Notepad", () => {
  return function MockNotepad({
    saveTrigger,
    content,
    setContent,
    currentFileName,
    onFileCreated,
  }) {
    return (
      <div data-testid="notepad">
        <span data-testid="notepad-content">{content}</span>

        <span data-testid="notepad-file-name">
          {currentFileName || "No file"}
        </span>

        <span data-testid="save-trigger">{saveTrigger}</span>

        <button
          type="button"
          onClick={() =>
            setContent("<p>Updated Content</p>")
          }
        >
          Update Content
        </button>

        <button
          type="button"
          onClick={() =>
            onFileCreated({
              _id: "456",
              name: "Created Note",
            })
          }
        >
          Create File
        </button>
      </div>
    );
  };
});

jest.mock("../socket", () => ({
  connectSocket: jest.fn(),
  disconnectSocket: jest.fn(),
}));

describe("Dashboard", () => {
  let mockSocket;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSocket = {
      on: jest.fn(),
    };

    connectSocket.mockReturnValue(mockSocket);

    localStorage.clear();

    window.alert = jest.fn();

    global.URL.createObjectURL = jest.fn(() => "blob:test-url");
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders dashboard with heading, sidebar and notepad", () => {
    render(<Dashboard />);

    expect(screen.getByTestId("heading")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("notepad")).toBeInTheDocument();
  });

  test("sidebar is open by default", () => {
    render(<Dashboard />);

    expect(
      screen.getByTestId("sidebar-status")
    ).toHaveTextContent("open");
  });

  test("toggles sidebar when heading toggle button is clicked", async () => {
    const user = userEvent.setup();

    render(<Dashboard />);

    expect(
      screen.getByTestId("sidebar-status")
    ).toHaveTextContent("open");

    await user.click(
      screen.getByRole("button", {
        name: "Toggle sidebar",
      })
    );

    expect(
      screen.getByTestId("sidebar-status")
    ).toHaveTextContent("closed");

    await user.click(
      screen.getByRole("button", {
        name: "Toggle sidebar",
      })
    );

    expect(
      screen.getByTestId("sidebar-status")
    ).toHaveTextContent("open");
  });

  test("opens a file and updates current file and content", async () => {
    const user = userEvent.setup();

    render(<Dashboard />);

    await user.click(
      screen.getByRole("button", {
        name: "Open File",
      })
    );

    expect(
      screen.getByTestId("notepad-content")
    ).toHaveTextContent("<p>Hello World</p>");

    expect(
      screen.getByTestId("notepad-file-name")
    ).toHaveTextContent("Test Note");

    expect(
      screen.getByTestId("current-file")
    ).toHaveTextContent("Test Note");
  });

  test("creates a new file and clears content and current file", async () => {
    const user = userEvent.setup();

    render(<Dashboard />);

    await user.click(
      screen.getByRole("button", {
        name: "Open File",
      })
    );

    expect(
      screen.getByTestId("notepad-content")
    ).toHaveTextContent("<p>Hello World</p>");

    await user.click(
      screen.getByRole("button", {
        name: "New File",
      })
    );

    expect(
      screen.getByTestId("notepad-content")
    ).toBeEmptyDOMElement();

    expect(
      screen.getByTestId("notepad-file-name")
    ).toHaveTextContent("No file");

    expect(
      screen.getByTestId("current-file")
    ).toHaveTextContent("No file");
  });

  test("imports content and clears current file information", async () => {
    const user = userEvent.setup();

    render(<Dashboard />);

    await user.click(
      screen.getByRole("button", {
        name: "Open File",
      })
    );

    expect(
      screen.getByTestId("current-file")
    ).toHaveTextContent("Test Note");

    await user.click(
      screen.getByRole("button", {
        name: "Import File",
      })
    );

    expect(
      screen.getByTestId("notepad-content")
    ).toHaveTextContent("<p>Imported Content</p>");

    expect(
      screen.getByTestId("notepad-file-name")
    ).toHaveTextContent("No file");

    expect(
      screen.getByTestId("current-file")
    ).toHaveTextContent("No file");
  });

  test("increments save trigger when save is requested", async () => {
    const user = userEvent.setup();

    render(<Dashboard />);

    expect(
      screen.getByTestId("save-trigger")
    ).toHaveTextContent("0");

    await user.click(
      screen.getByRole("button", {
        name: "Save File",
      })
    );

    expect(
      screen.getByTestId("save-trigger")
    ).toHaveTextContent("1");

    await user.click(
      screen.getByRole("button", {
        name: "Save File",
      })
    );

    expect(
      screen.getByTestId("save-trigger")
    ).toHaveTextContent("2");
  });

  test("updates current file when Notepad creates a file", async () => {
    const user = userEvent.setup();

    render(<Dashboard />);

    await user.click(
      screen.getByRole("button", {
        name: "Create File",
      })
    );

    expect(
      screen.getByTestId("current-file")
    ).toHaveTextContent("Created Note");

    expect(
      screen.getByTestId("notepad-file-name")
    ).toHaveTextContent("Created Note");

    expect(
      screen.getByTestId("refresh-trigger")
    ).toHaveTextContent("1");
  });

  test("updates content when Notepad changes content", async () => {
    const user = userEvent.setup();

    render(<Dashboard />);

    await user.click(
      screen.getByRole("button", {
        name: "Update Content",
      })
    );

    expect(
      screen.getByTestId("notepad-content")
    ).toHaveTextContent("<p>Updated Content</p>");
  });

  test("does not connect socket when access token is missing", () => {
    render(<Dashboard />);

    expect(connectSocket).not.toHaveBeenCalled();
  });

  test("connects socket when access token exists", () => {
    localStorage.setItem("accessToken", "test-token");

    render(<Dashboard />);

    expect(connectSocket).toHaveBeenCalledTimes(1);
    expect(connectSocket).toHaveBeenCalledWith("test-token");
  });

  test("registers socket event handlers", () => {
    localStorage.setItem("accessToken", "test-token");

    render(<Dashboard />);

    expect(mockSocket.on).toHaveBeenCalledWith(
      "note:created",
      expect.any(Function)
    );

    expect(mockSocket.on).toHaveBeenCalledWith(
      "note:updated",
      expect.any(Function)
    );

    expect(mockSocket.on).toHaveBeenCalledWith(
      "note:deleted",
      expect.any(Function)
    );
  });

  test("increments refresh trigger when note is created through socket", async () => {
    localStorage.setItem("accessToken", "test-token");

    render(<Dashboard />);

    const createdHandler = mockSocket.on.mock.calls.find(
      ([event]) => event === "note:created"
    )[1];

    expect(
      screen.getByTestId("refresh-trigger")
    ).toHaveTextContent("0");

    act(() => {
      createdHandler();
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("refresh-trigger")
      ).toHaveTextContent("1");
    });
  });

  test("updates current note content when its socket update is received", async () => {
    localStorage.setItem("accessToken", "test-token");

    render(<Dashboard />);

    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", {
        name: "Open File",
      })
    );

    const updatedHandler = mockSocket.on.mock.calls.find(
      ([event]) => event === "note:updated"
    )[1];

    act(() => {
      updatedHandler({
        _id: "123",
        content: "<p>Updated from socket</p>",
      });
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("notepad-content")
      ).toHaveTextContent("<p>Updated from socket</p>");
    });
  });

  test("does not replace content when another note is updated", async () => {
    localStorage.setItem("accessToken", "test-token");

    render(<Dashboard />);

    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", {
        name: "Open File",
      })
    );

    const updatedHandler = mockSocket.on.mock.calls.find(
      ([event]) => event === "note:updated"
    )[1];

    act(() => {
      updatedHandler({
        _id: "999",
        content: "<p>Other Note</p>",
      });
    });

    expect(
      screen.getByTestId("notepad-content")
    ).toHaveTextContent("<p>Hello World</p>");
  });

  test("clears current file when the currently opened note is deleted", async () => {
    localStorage.setItem("accessToken", "test-token");

    render(<Dashboard />);

    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", {
        name: "Open File",
      })
    );

    const deletedHandler = mockSocket.on.mock.calls.find(
      ([event]) => event === "note:deleted"
    )[1];

    act(() => {
      deletedHandler({
        _id: "123",
      });
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("notepad-content")
      ).toBeEmptyDOMElement();

      expect(
        screen.getByTestId("current-file")
      ).toHaveTextContent("No file");

      expect(
        screen.getByTestId("notepad-file-name")
      ).toHaveTextContent("No file");
    });
  });

  test("does not clear current file when another note is deleted", async () => {
    localStorage.setItem("accessToken", "test-token");

    render(<Dashboard />);

    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", {
        name: "Open File",
      })
    );

    const deletedHandler = mockSocket.on.mock.calls.find(
      ([event]) => event === "note:deleted"
    )[1];

    act(() => {
      deletedHandler({
        _id: "999",
      });
    });

    expect(
      screen.getByTestId("notepad-content")
    ).toHaveTextContent("<p>Hello World</p>");

    expect(
      screen.getByTestId("current-file")
    ).toHaveTextContent("Test Note");
  });

  test("disconnects socket when dashboard unmounts", () => {
    localStorage.setItem("accessToken", "test-token");

    const { unmount } = render(<Dashboard />);

    expect(disconnectSocket).not.toHaveBeenCalled();

    unmount();

    expect(disconnectSocket).toHaveBeenCalledTimes(1);
  });

  test("shows alert when exporting without content", async () => {
    const user = userEvent.setup();

    render(<Dashboard />);

    await user.click(
      screen.getByRole("button", {
        name: "Export File",
      })
    );

    expect(window.alert).toHaveBeenCalledWith(
      "No content available to export"
    );
  });

  test("shows alert when exporting content without an opened file", async () => {
    const user = userEvent.setup();

    render(<Dashboard />);

    await user.click(
      screen.getByRole("button", {
        name: "Update Content",
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: "Export File",
      })
    );

    expect(window.alert).toHaveBeenCalledWith(
      "Please open a file before exporting"
    );
  });

  test("exports opened file as txt", async () => {
    const user = userEvent.setup();

    const clickMock = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    render(<Dashboard />);

    await user.click(
      screen.getByRole("button", {
        name: "Open File",
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: "Export File",
      })
    );

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);

    const blob = URL.createObjectURL.mock.calls[0][0];

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("text/plain;charset=utf-8");

    await waitFor(() => {
      expect(clickMock).toHaveBeenCalledTimes(1);
    });

    expect(URL.revokeObjectURL).toHaveBeenCalledWith(
      "blob:test-url"
    );

    clickMock.mockRestore();
  });

  test("does not add duplicate txt extension when file already ends with .txt", async () => {
    const user = userEvent.setup();

    const clickMock = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    render(<Dashboard />);

    await user.click(
      screen.getByRole("button", {
        name: "Open TXT File",
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: "Export File",
      })
    );

    await waitFor(() => expect(clickMock).toHaveBeenCalledTimes(1));
    expect(clickMock.mock.instances[0].download).toBe("Test Note.txt");

    clickMock.mockRestore();
  });

  test("handles desktop resize by keeping sidebar open", () => {
    const originalInnerWidth = window.innerWidth;

    render(<Dashboard />);

    expect(
      screen.getByTestId("sidebar-status")
    ).toHaveTextContent("open");

    act(() => {
      screen.getByRole("button", { name: "Toggle sidebar" }).click();
    });

    expect(
      screen.getByTestId("sidebar-status")
    ).toHaveTextContent("closed");

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    expect(
      screen.getByTestId("sidebar-status")
    ).toHaveTextContent("open");

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  test("increments refresh trigger when socket note is updated", async () => {
    localStorage.setItem("accessToken", "test-token");

    render(<Dashboard />);

    const updatedHandler = mockSocket.on.mock.calls.find(
      ([event]) => event === "note:updated"
    )[1];

    act(() => {
      updatedHandler({
        _id: "999",
        content: "Updated",
      });
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("refresh-trigger")
      ).toHaveTextContent("1");
    });
  });

  test("increments refresh trigger when socket note is deleted", async () => {
    localStorage.setItem("accessToken", "test-token");

    render(<Dashboard />);

    const deletedHandler = mockSocket.on.mock.calls.find(
      ([event]) => event === "note:deleted"
    )[1];

    act(() => {
      deletedHandler({
        _id: "999",
      });
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("refresh-trigger")
      ).toHaveTextContent("1");
    });
  });
});
