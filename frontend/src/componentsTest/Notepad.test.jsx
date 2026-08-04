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
        "My New Note"
      );
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
  });
});