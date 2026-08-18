import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AvailableNotes from "../components/AvailableNotes";

describe("AvailableNotes", () => {
  const files = [
    {
      _id: "1",
      name: "First Note",
    },
    {
      _id: "2",
      name: "Second Note",
    },
  ];

  let onOpenFile;
  let onDeleteFile;

  beforeEach(() => {
    onOpenFile = jest.fn();
    onDeleteFile = jest.fn();
  });

  const renderAvailableNotes = (props = {}) => {
    return render(
      <AvailableNotes
        filesList={files}
        onOpenFile={onOpenFile}
        onDeleteFile={onDeleteFile}
        currentFileId={null}
        {...props}
      />
    );
  };

  test("renders all available notes", () => {
    renderAvailableNotes();

    expect(screen.getByText("First Note")).toBeInTheDocument();
    expect(screen.getByText("Second Note")).toBeInTheDocument();
  });

  test("renders each note as an accessible button", () => {
    renderAvailableNotes();

    expect(
      screen.getByRole("button", { name: "First Note" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Second Note" })
    ).toBeInTheDocument();
  });

  test("calls onOpenFile when a note is clicked", async () => {
    const user = userEvent.setup();

    renderAvailableNotes();

    await user.click(
      screen.getByRole("button", { name: "First Note" })
    );

    expect(onOpenFile).toHaveBeenCalledTimes(1);
    expect(onOpenFile).toHaveBeenCalledWith("1");
  });

  test("calls onOpenFile when a note is activated with Enter", async () => {
    const user = userEvent.setup();

    renderAvailableNotes();

    const firstNoteButton = screen.getByRole("button", {
      name: "First Note",
    });

    firstNoteButton.focus();

    await user.keyboard("{Enter}");

    expect(onOpenFile).toHaveBeenCalledTimes(1);
    expect(onOpenFile).toHaveBeenCalledWith("1");
  });

  test("calls onOpenFile when a note is activated with Space", async () => {
    const user = userEvent.setup();

    renderAvailableNotes();

    const firstNoteButton = screen.getByRole("button", {
      name: "First Note",
    });

    firstNoteButton.focus();

    await user.keyboard(" ");

    expect(onOpenFile).toHaveBeenCalledTimes(1);
    expect(onOpenFile).toHaveBeenCalledWith("1");
  });

  test("calls onDeleteFile when delete button is clicked", async () => {
    const user = userEvent.setup();

    renderAvailableNotes();

    await user.click(
      screen.getByRole("button", {
        name: "Delete First Note",
      })
    );

    expect(onDeleteFile).toHaveBeenCalledTimes(1);
    expect(onDeleteFile).toHaveBeenCalledWith("1");
  });

  test("does not open file when delete button is clicked", async () => {
    const user = userEvent.setup();

    renderAvailableNotes();

    await user.click(
      screen.getByRole("button", {
        name: "Delete First Note",
      })
    );

    expect(onDeleteFile).toHaveBeenCalledTimes(1);
    expect(onOpenFile).not.toHaveBeenCalled();
  });

  test("delete button is disabled for the currently opened file", () => {
    renderAvailableNotes({
      currentFileId: "1",
    });

    expect(
      screen.getByRole("button", {
        name: "Delete First Note",
      })
    ).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "Delete Second Note",
      })
    ).not.toBeDisabled();
  });

  test("disabled delete button does not call onDeleteFile", async () => {
    const user = userEvent.setup();

    renderAvailableNotes({
      currentFileId: "1",
    });

    const deleteButton = screen.getByRole("button", {
      name: "Delete First Note",
    });

    expect(deleteButton).toBeDisabled();

    await user.click(deleteButton);

    expect(onDeleteFile).not.toHaveBeenCalled();
  });

  test("filters notes by search term", async () => {
    const user = userEvent.setup();

    renderAvailableNotes();

    await user.type(
      screen.getByRole("textbox", {
        name: "Search notes",
      }),
      "First"
    );

    expect(screen.getByText("First Note")).toBeInTheDocument();
    expect(screen.queryByText("Second Note")).not.toBeInTheDocument();
  });

  test("search is case-insensitive", async () => {
    const user = userEvent.setup();

    renderAvailableNotes();

    await user.type(
      screen.getByRole("textbox", {
        name: "Search notes",
      }),
      "second"
    );

    expect(screen.getByText("Second Note")).toBeInTheDocument();
    expect(screen.queryByText("First Note")).not.toBeInTheDocument();
  });

  test("search ignores leading and trailing spaces", async () => {
    const user = userEvent.setup();

    renderAvailableNotes();

    await user.type(
      screen.getByRole("textbox", {
        name: "Search notes",
      }),
      "  First  "
    );

    expect(screen.getByText("First Note")).toBeInTheDocument();
    expect(screen.queryByText("Second Note")).not.toBeInTheDocument();
  });

  test("shows empty state when there are no notes available", () => {
    renderAvailableNotes({
      filesList: [],
    });

    expect(
      screen.getByText("No notes available")
    ).toBeInTheDocument();
  });

  test("shows empty state when no notes match search", async () => {
    const user = userEvent.setup();

    renderAvailableNotes();

    await user.type(
      screen.getByRole("textbox", {
        name: "Search notes",
      }),
      "nonexistent"
    );

    expect(
      screen.getByText(/No notes match/i)
    ).toBeInTheDocument();

    expect(
      screen.queryByText("First Note")
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Second Note")
    ).not.toBeInTheDocument();
  });

  test("clear button resets search and restores full list", async () => {
    const user = userEvent.setup();

    renderAvailableNotes();

    const searchInput = screen.getByRole("textbox", {
      name: "Search notes",
    });

    await user.type(searchInput, "First");

    expect(
      screen.queryByText("Second Note")
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Clear search",
      })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Clear search",
      })
    );

    expect(searchInput).toHaveValue("");

    expect(screen.getByText("First Note")).toBeInTheDocument();
    expect(screen.getByText("Second Note")).toBeInTheDocument();
  });

  test("clear button is not shown when search is empty", () => {
    renderAvailableNotes();

    expect(
      screen.queryByRole("button", {
        name: "Clear search",
      })
    ).not.toBeInTheDocument();
  });

  test("delete button has correct title for currently opened file", () => {
    renderAvailableNotes({
      currentFileId: "1",
    });

    expect(
      screen.getByRole("button", {
        name: "Delete First Note",
      })
    ).toHaveAttribute(
      "title",
      "Cannot delete the currently open file"
    );
  });

  test("delete button has normal title for other files", () => {
    renderAvailableNotes();

    expect(
      screen.getByRole("button", {
        name: "Delete First Note",
      })
    ).toHaveAttribute("title", "Delete file");
  });

  test("handles files with missing names during search", async () => {
    const user = userEvent.setup();

    renderAvailableNotes({
      filesList: [
        {
          _id: "3",
        },
        {
          _id: "4",
          name: "Valid Note",
        },
      ],
    });

    await user.type(
      screen.getByRole("textbox", {
        name: "Search notes",
      }),
      "valid"
    );

    expect(screen.getByText("Valid Note")).toBeInTheDocument();
  });
});