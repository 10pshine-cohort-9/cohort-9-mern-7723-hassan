import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";

jest.mock("axios");

jest.mock("../config", () => ({
  API_URL: "http://localhost:3000",
}));

import Notepad from "../components/Notepad";

describe("Notepad", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    localStorage.setItem("accessToken", "fake-token");

    window.alert = jest.fn();
    window.prompt = jest.fn();
    window.confirm = jest.fn();
  });

  test("renders editable notepad with content", () => {
    render(
      <Notepad
        saveTrigger={0}
        content="My first note"
        setContent={jest.fn()}
        onFileCreated={jest.fn()}
        currentFileName={null}
      />
    );

    const editor = document.querySelector(
      "[contenteditable='true']"
    );

    expect(editor).toBeInTheDocument();
  });

  test("updates content when user types", async () => {
    const setContent = jest.fn();

    try {
      render(
        <Notepad
          saveTrigger={0}
          content=""
          setContent={setContent}
          onFileCreated={jest.fn()}
          currentFileName={null}
        />
      );

      const editor = document.querySelector(
        "[contenteditable='true']"
      );

      await userEvent.click(editor);

      await userEvent.type(
        editor,
        "Hello Notes"
      );

      expect(setContent).toHaveBeenCalled();
    } catch (error) {
      throw new Error(
        "Notepad: updates content when user types failed",
        {
          cause: error,
        }
      );
    }
  });

  test("saves new file when save trigger changes", async () => {
    axios.post.mockResolvedValue({
      data: {
        message: "File saved successfully",
      },
    });

    window.prompt.mockReturnValue(
      "My New Note"
    );

    const onFileCreated = jest.fn();

    try {
      const { rerender } = render(
        <Notepad
          saveTrigger={0}
          content="Hello World"
          setContent={jest.fn()}
          onFileCreated={onFileCreated}
          currentFileName={null}
        />
      );

      rerender(
        <Notepad
          saveTrigger={1}
          content="Hello World"
          setContent={jest.fn()}
          onFileCreated={onFileCreated}
          currentFileName={null}
        />
      );

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          expect.stringContaining("/note/save"),
          {
            name: "My New Note",
            text: "Hello World",
            action: null,
            newName: null,
          },
          expect.objectContaining({
            headers: {
              Authorization: "Bearer fake-token",
            },
          })
        );
      });

      expect(window.alert)
        .toHaveBeenCalledWith(
          "File saved successfully"
        );

      expect(onFileCreated)
        .toHaveBeenCalledWith(
          { _id: null, name: "My New Note" }
        );
    } catch (error) {
      throw new Error(
        "Notepad: saves new file when save trigger changes failed",
        {
          cause: error,
        }
      );
    }
  });

  test("uses the server-returned note identity after rename and save", async () => {
    axios.post.mockResolvedValue({
      data: {
        message: "File saved with new name.",
        note: {
          _id: "saved-note-123",
          name: "Renamed Note",
        },
      },
    });

    const onFileCreated = jest.fn();

    try {
      const { rerender } = render(
        <Notepad
          saveTrigger={0}
          content="Existing Note"
          setContent={jest.fn()}
          onFileCreated={onFileCreated}
          currentFileName="Old Name"
        />
      );

      rerender(
        <Notepad
          saveTrigger={1}
          content="Existing Note"
          setContent={jest.fn()}
          onFileCreated={onFileCreated}
          currentFileName="Old Name"
        />
      );

      await waitFor(() => {
        expect(onFileCreated).toHaveBeenCalledWith({
          _id: "saved-note-123",
          name: "Renamed Note",
        });
      });
    } catch (error) {
      throw new Error(
        "Notepad: uses the server-returned note identity after rename and save failed",
        { cause: error }
      );
    }
  });

  test("shows Edit button when opening existing file", () => {
    render(
      <Notepad
        saveTrigger={0}
        content="Existing Note"
        setContent={jest.fn()}
        onFileCreated={jest.fn()}
        currentFileName="notes.txt"
      />
    );

    expect(
      screen.getByRole("button", {
        name: /edit/i,
      })
    ).toBeInTheDocument();
  });

  test("enables editing after clicking Edit button", async () => {
    try {
      render(
        <Notepad
          saveTrigger={0}
          content="Existing Note"
          setContent={jest.fn()}
          onFileCreated={jest.fn()}
          currentFileName="notes.txt"
        />
      );

      await userEvent.click(
        screen.getByRole("button", {
          name: /edit/i,
        })
      );

      const editor = document.querySelector(
        "[contenteditable='true']"
      );

      expect(editor)
        .toHaveAttribute(
          "contenteditable",
          "true"
        );
    } catch (error) {
      throw new Error(
        "Notepad: enables editing after clicking Edit button failed",
        {
          cause: error,
        }
      );
    }
  });

  test("handles overwrite confirmation when duplicate file exists", async () => {
    axios.post
      .mockRejectedValueOnce({
        response: {
          status: 409,
          data: {
            requiresAction: true,
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          message: "File overwritten",
        },
      });

    window.prompt.mockReturnValue(
      "Duplicate Note"
    );

    window.confirm.mockReturnValue(true);

    try {
      const { rerender } = render(
        <Notepad
          saveTrigger={0}
          content="Duplicate content"
          setContent={jest.fn()}
          onFileCreated={jest.fn()}
          currentFileName={null}
        />
      );

      rerender(
        <Notepad
          saveTrigger={1}
          content="Duplicate content"
          setContent={jest.fn()}
          onFileCreated={jest.fn()}
          currentFileName={null}
        />
      );

      await waitFor(() => {
        expect(window.confirm)
          .toHaveBeenCalled();
      });

      expect(axios.post)
        .toHaveBeenCalledTimes(2);
    } catch (error) {
      throw new Error(
        "Notepad: handles overwrite confirmation when duplicate file exists failed",
        { cause: error }
      );
    }
  });

  test("applies bold formatting when Bold is clicked", async () => {
    document.execCommand = jest.fn();

    try {
      render(
        <Notepad
          saveTrigger={0}
          content="Hello"
          setContent={jest.fn()}
          onFileCreated={jest.fn()}
          currentFileName={null}
        />
      );

      await userEvent.click(
        screen.getByRole("button", { name: /bold/i })
      );

      await waitFor(() => {
        expect(document.execCommand).toHaveBeenCalledWith(
          "bold",
          false,
          null
        );
      });
    } catch (error) {
      throw new Error(
        "Notepad: applies bold formatting when Bold is clicked failed",
        {
          cause: error,
        }
      );
    }
  });

  test("applies italic formatting when Italic is clicked", async () => {
    document.execCommand = jest.fn();

    try {
      render(
        <Notepad
          saveTrigger={0}
          content="Hello"
          setContent={jest.fn()}
          onFileCreated={jest.fn()}
          currentFileName={null}
        />
      );

      await userEvent.click(
        screen.getByRole("button", { name: /italic/i })
      );

      await waitFor(() => {
        expect(document.execCommand).toHaveBeenCalledWith(
          "italic",
          false,
          null
        );
      });
    } catch (error) {
      throw new Error(
        "Notepad: applies italic formatting when Italic is clicked failed",
        {
          cause: error,
        }
      );
    }
  });

  test("applies underline formatting when Underline is clicked", async () => {
    document.execCommand = jest.fn();

    try {
      render(
        <Notepad
          saveTrigger={0}
          content="Hello"
          setContent={jest.fn()}
          onFileCreated={jest.fn()}
          currentFileName={null}
        />
      );

      await userEvent.click(
        screen.getByRole("button", { name: /underline/i })
      );

      await waitFor(() => {
        expect(document.execCommand).toHaveBeenCalledWith(
          "underline",
          false,
          null
        );
      });
    } catch (error) {
      throw new Error(
        "Notepad: applies underline formatting when Underline is clicked failed",
        {
          cause: error,
        }
      );
    }
  });

  test("exposes formatting button active states with aria-pressed", () => {
    render(
      <Notepad
        saveTrigger={0}
        content="Hello"
        setContent={jest.fn()}
        onFileCreated={jest.fn()}
        currentFileName={null}
      />
    );

    expect(
      screen.getByRole("button", { name: /bold/i })
    ).toHaveAttribute("aria-pressed", "false");

    expect(
      screen.getByRole("button", { name: /italic/i })
    ).toHaveAttribute("aria-pressed", "false");

    expect(
      screen.getByRole("button", { name: /underline/i })
    ).toHaveAttribute("aria-pressed", "false");
  });

  test("exposes read-only state to assistive technology", () => {
    render(
      <Notepad
        saveTrigger={0}
        content="Existing Note"
        setContent={jest.fn()}
        onFileCreated={jest.fn()}
        currentFileName="notes.txt"
      />
    );

    const editor = screen.getByRole("textbox");

    expect(editor).toHaveAttribute("aria-readonly", "true");
  });

  test("exposes editable state to assistive technology", () => {
    render(
      <Notepad
        saveTrigger={0}
        content="New Note"
        setContent={jest.fn()}
        onFileCreated={jest.fn()}
        currentFileName={null}
      />
    );

    const editor = screen.getByRole("textbox");

    expect(editor).toHaveAttribute("aria-readonly", "false");
  });
});