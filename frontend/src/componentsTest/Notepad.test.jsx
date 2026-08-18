import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
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
      throw new Error("Notepad: updates content when user types failed", {
        cause: error,
      });
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
      throw new Error("Notepad: saves new file when save trigger changes failed", {
        cause: error,
      });
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
      throw new Error("Notepad: enables editing after clicking Edit button failed", {
        cause: error,
      });
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
  test("calls execCommand when Bold button is clicked", async () => {
    document.execCommand = jest.fn();
    document.queryCommandState = jest.fn().mockReturnValue(false);

    render(
      <Notepad
        saveTrigger={0}
        content=""
        setContent={jest.fn()}
        onFileCreated={jest.fn()}
        currentFileName={null}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /bold/i }));

    await waitFor(() => expect(document.execCommand).toHaveBeenCalledWith("bold", false, null));
  });

  test("calls execCommand when Italic button is clicked", async () => {
    document.execCommand = jest.fn();
    document.queryCommandState = jest.fn().mockReturnValue(false);

    render(
      <Notepad
        saveTrigger={0}
        content=""
        setContent={jest.fn()}
        onFileCreated={jest.fn()}
        currentFileName={null}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /italic/i }));

    await waitFor(() => expect(document.execCommand).toHaveBeenCalledWith("italic", false, null));
  });

  test("calls execCommand when Underline button is clicked", async () => {
    document.execCommand = jest.fn();
    document.queryCommandState = jest.fn().mockReturnValue(false);

    render(
      <Notepad
        saveTrigger={0}
        content=""
        setContent={jest.fn()}
        onFileCreated={jest.fn()}
        currentFileName={null}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /underline/i }));

    await waitFor(() => expect(document.execCommand).toHaveBeenCalledWith("underline", false, null));
  });

  test("does not apply formatting when not editing", async () => {
    document.execCommand = jest.fn();

    render(
      <Notepad
        saveTrigger={0}
        content="Existing"
        setContent={jest.fn()}
        onFileCreated={jest.fn()}
        currentFileName="notes.txt"
      />
    );

    const boldButton = screen.getByRole("button", { name: /bold/i });
    expect(boldButton).toBeDisabled();
  });

  test("triggers bold formatting on Ctrl+B keydown", async () => {
    document.execCommand = jest.fn();

    render(
      <Notepad
        saveTrigger={0}
        content=""
        setContent={jest.fn()}
        onFileCreated={jest.fn()}
        currentFileName={null}
      />
    );

    const editor = document.querySelector("[contenteditable='true']");
    editor.focus();

    fireEvent.keyDown(editor, { key: "b", ctrlKey: true });

    expect(document.execCommand).toHaveBeenCalledWith("bold");
  });

  test("triggers italic formatting on Ctrl+I keydown", async () => {
    document.execCommand = jest.fn();

    render(
      <Notepad
        saveTrigger={0}
        content=""
        setContent={jest.fn()}
        onFileCreated={jest.fn()}
        currentFileName={null}
      />
    );

    const editor = document.querySelector("[contenteditable='true']");
    editor.focus();

    fireEvent.keyDown(editor, { key: "i", ctrlKey: true });

    expect(document.execCommand).toHaveBeenCalledWith("italic");
  });

  test("triggers underline formatting on Ctrl+U keydown", async () => {
    document.execCommand = jest.fn();

    render(
      <Notepad
        saveTrigger={0}
        content=""
        setContent={jest.fn()}
        onFileCreated={jest.fn()}
        currentFileName={null}
      />
    );

    const editor = document.querySelector("[contenteditable='true']");
    editor.focus();

    fireEvent.keyDown(editor, { key: "u", ctrlKey: true });

    expect(document.execCommand).toHaveBeenCalledWith("underline");
  });

  test("ignores keydown without ctrl or meta key", async () => {
    document.execCommand = jest.fn();

    render(
      <Notepad
        saveTrigger={0}
        content=""
        setContent={jest.fn()}
        onFileCreated={jest.fn()}
        currentFileName={null}
      />
    );

    const editor = document.querySelector("[contenteditable='true']");
    fireEvent.keyDown(editor, { key: "b", ctrlKey: false });

    expect(document.execCommand).not.toHaveBeenCalled();
  });

  test("cancels save when file name prompt is dismissed", async () => {
    window.prompt.mockReturnValue(null);

    const { rerender } = render(
      <Notepad
        saveTrigger={0}
        content="Some content"
        setContent={jest.fn()}
        onFileCreated={jest.fn()}
        currentFileName={null}
      />
    );

    rerender(
      <Notepad
        saveTrigger={1}
        content="Some content"
        setContent={jest.fn()}
        onFileCreated={jest.fn()}
        currentFileName={null}
      />
    );

    await waitFor(() => expect(window.prompt).toHaveBeenCalled());
    expect(axios.post).not.toHaveBeenCalled();
  });

  test("handles rename flow when overwrite is declined", async () => {
    axios.post
      .mockRejectedValueOnce({
        response: { status: 409, data: { requiresAction: true } },
      })
      .mockResolvedValueOnce({ data: { message: "File renamed and saved." } });

    window.prompt
      .mockReturnValueOnce("Existing Note")
      .mockReturnValueOnce("A New Name");

    window.confirm.mockReturnValue(false);

    const { rerender } = render(
      <Notepad
        saveTrigger={0}
        content="Some content"
        setContent={jest.fn()}
        onFileCreated={jest.fn()}
        currentFileName={null}
      />
    );

    rerender(
      <Notepad
        saveTrigger={1}
        content="Some content"
        setContent={jest.fn()}
        onFileCreated={jest.fn()}
        currentFileName={null}
      />
    );

    await waitFor(() => expect(window.confirm).toHaveBeenCalled());

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(2);
      expect(axios.post).toHaveBeenLastCalledWith(
        expect.stringContaining("/note/save"),
        expect.objectContaining({ action: "rename", newName: "A New Name" }),
        expect.anything()
      );
    });
  });

  test("does nothing when rename is cancelled after declining overwrite", async () => {
    axios.post.mockRejectedValueOnce({
      response: { status: 409, data: { requiresAction: true } },
    });

    window.prompt
      .mockReturnValueOnce("Existing Note")
      .mockReturnValueOnce(null);

    window.confirm.mockReturnValue(false);

    const { rerender } = render(
      <Notepad
        saveTrigger={0}
        content="Some content"
        setContent={jest.fn()}
        onFileCreated={jest.fn()}
        currentFileName={null}
      />
    );

    rerender(
      <Notepad
        saveTrigger={1}
        content="Some content"
        setContent={jest.fn()}
        onFileCreated={jest.fn()}
        currentFileName={null}
      />
    );

    await waitFor(() => expect(window.confirm).toHaveBeenCalled());
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
  });

  test("shows an error alert when save fails for a non-409 reason", async () => {
    axios.post.mockRejectedValue({
      response: { status: 500, data: { message: "Server exploded" } },
    });

    window.prompt.mockReturnValue("New Note");

    const { rerender } = render(
      <Notepad
        saveTrigger={0}
        content="Some content"
        setContent={jest.fn()}
        onFileCreated={jest.fn()}
        currentFileName={null}
      />
    );

    rerender(
      <Notepad
        saveTrigger={1}
        content="Some content"
        setContent={jest.fn()}
        onFileCreated={jest.fn()}
        currentFileName={null}
      />
    );

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith("Server exploded"));
  });

  test("sanitizes incoming content with DOMPurify", () => {
    render(
      <Notepad
        saveTrigger={0}
        content="<img src=x onerror=alert(1)>Hello"
        setContent={jest.fn()}
        onFileCreated={jest.fn()}
        currentFileName={null}
      />
    );

    const editor = document.querySelector("[contenteditable='true']");
    expect(editor.innerHTML).not.toContain("onerror");
  });

  test("updates active formatting state on mouse up", () => {
    document.queryCommandState = jest.fn().mockReturnValue(true);

    render(
      <Notepad
        saveTrigger={0}
        content=""
        setContent={jest.fn()}
        onFileCreated={jest.fn()}
        currentFileName={null}
      />
    );

    const editor = document.querySelector("[contenteditable='true']");
    fireEvent.mouseUp(editor);

    expect(document.queryCommandState).toHaveBeenCalledWith("bold");
  });
});
