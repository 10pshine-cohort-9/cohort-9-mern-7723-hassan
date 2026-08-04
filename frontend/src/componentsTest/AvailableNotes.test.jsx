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
});