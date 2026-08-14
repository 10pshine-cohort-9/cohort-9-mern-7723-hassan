import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
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

  test("renders all available notes", () => {
    render(
      <AvailableNotes
        filesList={files}
        onOpenFile={onOpenFile}
        onDeleteFile={onDeleteFile}
        currentFileId={null}
      />
    );

    expect(screen.getByText("First Note")).toBeInTheDocument();
    expect(screen.getByText("Second Note")).toBeInTheDocument();
  });

  test("calls onOpenFile when a note is clicked", () => {
    render(
      <AvailableNotes
        filesList={files}
        onOpenFile={onOpenFile}
        onDeleteFile={onDeleteFile}
        currentFileId={null}
      />
    );

    fireEvent.click(screen.getByText("First Note"));

    expect(onOpenFile).toHaveBeenCalledTimes(1);
    expect(onOpenFile).toHaveBeenCalledWith("1");
  });

  test("calls onOpenFile when a note is activated with the keyboard", async () => {
    const user = userEvent.setup();

    render(
      <AvailableNotes
        filesList={files}
        onOpenFile={onOpenFile}
        onDeleteFile={onDeleteFile}
        currentFileId={null}
      />
    );

    const firstNoteButton = screen.getByRole("button", { name: "First Note" });
    firstNoteButton.focus();
    await user.keyboard("{Enter}");

    expect(onOpenFile).toHaveBeenCalledTimes(1);
    expect(onOpenFile).toHaveBeenCalledWith("1");
  });

  test("supports Space activation on rows and ignores delete-button keyboard events", async () => {
    const user = userEvent.setup();

    render(
      <AvailableNotes
        filesList={files}
        onOpenFile={onOpenFile}
        onDeleteFile={onDeleteFile}
        currentFileId={null}
      />
    );

    const firstNoteButton = screen.getByRole("button", { name: "First Note" });
    firstNoteButton.focus();
    await user.keyboard(" ");

    expect(onOpenFile).toHaveBeenCalledTimes(1);
    expect(onOpenFile).toHaveBeenCalledWith("1");

    const deleteButton = screen.getByLabelText("Delete First Note");
    deleteButton.focus();
    await user.keyboard("{Enter}");

    expect(onDeleteFile).toHaveBeenCalledTimes(1);
    expect(onOpenFile).toHaveBeenCalledTimes(1);
  });

  test("calls onDeleteFile when delete button is clicked", () => {
    render(
      <AvailableNotes
        filesList={files}
        onOpenFile={onOpenFile}
        onDeleteFile={onDeleteFile}
        currentFileId={null}
      />
    );

    fireEvent.click(screen.getByLabelText("Delete First Note"));

    expect(onDeleteFile).toHaveBeenCalledTimes(1);
    expect(onDeleteFile).toHaveBeenCalledWith("1");
  });

  test("does not open file when delete button is clicked", () => {
    render(
      <AvailableNotes
        filesList={files}
        onOpenFile={onOpenFile}
        onDeleteFile={onDeleteFile}
        currentFileId={null}
      />
    );

    fireEvent.click(screen.getByLabelText("Delete First Note"));

    expect(onDeleteFile).toHaveBeenCalledTimes(1);
    expect(onOpenFile).not.toHaveBeenCalled();
  });

  test("disables delete button for currently opened file", () => {
    render(
      <AvailableNotes
        filesList={files}
        onOpenFile={onOpenFile}
        onDeleteFile={onDeleteFile}
        currentFileId="1"
      />
    );

    expect(
      screen.getByLabelText("Delete First Note")
    ).toBeDisabled();

    expect(
      screen.getByLabelText("Delete Second Note")
    ).not.toBeDisabled();
  });

  test("filters notes by search term", async () => {
    const user = userEvent.setup();

    render(
      <AvailableNotes
        filesList={files}
        onOpenFile={onOpenFile}
        onDeleteFile={onDeleteFile}
        currentFileId={null}
      />
    );

    await user.type(screen.getByLabelText("Search notes"), "First");

    expect(screen.getByText("First Note")).toBeInTheDocument();
    expect(screen.queryByText("Second Note")).not.toBeInTheDocument();
  });

  test("search is case-insensitive", async () => {
    const user = userEvent.setup();

    render(
      <AvailableNotes
        filesList={files}
        onOpenFile={onOpenFile}
        onDeleteFile={onDeleteFile}
        currentFileId={null}
      />
    );

    await user.type(screen.getByLabelText("Search notes"), "second");

    expect(screen.getByText("Second Note")).toBeInTheDocument();
    expect(screen.queryByText("First Note")).not.toBeInTheDocument();
  });

  test("shows empty state when there are no notes available", () => {
    render(
      <AvailableNotes
        filesList={[]}
        onOpenFile={onOpenFile}
        onDeleteFile={onDeleteFile}
        currentFileId={null}
      />
    );

    expect(screen.getByText("No notes available")).toBeInTheDocument();
  });

  test("shows empty state when no notes match search", async () => {
    const user = userEvent.setup();

    render(
      <AvailableNotes
        filesList={files}
        onOpenFile={onOpenFile}
        onDeleteFile={onDeleteFile}
        currentFileId={null}
      />
    );

    await user.type(screen.getByLabelText("Search notes"), "nonexistent");

    expect(screen.getByText(/No notes match/i)).toBeInTheDocument();
    expect(screen.queryByText("First Note")).not.toBeInTheDocument();
    expect(screen.queryByText("Second Note")).not.toBeInTheDocument();
  });

  test("clear button resets search and restores full list", async () => {
    const user = userEvent.setup();

    render(
      <AvailableNotes
        filesList={files}
        onOpenFile={onOpenFile}
        onDeleteFile={onDeleteFile}
        currentFileId={null}
      />
    );

    await user.type(screen.getByLabelText("Search notes"), "First");
    expect(screen.queryByText("Second Note")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("Clear search"));

    expect(screen.getByText("First Note")).toBeInTheDocument();
    expect(screen.getByText("Second Note")).toBeInTheDocument();
  });
});