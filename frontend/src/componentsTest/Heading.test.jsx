import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Heading from "../components/Heading";

describe("Heading", () => {
  test("renders heading content", () => {
    render(
      <Heading
        isOpen={false}
        toggleSidebar={jest.fn()}
      />
    );

    expect(screen.getByText("ME")).toBeInTheDocument();
    expect(screen.getByText("ME-Notes")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /dashboard/i })
    ).toBeInTheDocument();
  });

  test("calls toggleSidebar when menu button is clicked", async () => {
    const toggleSidebar = jest.fn();

    render(
      <Heading
        isOpen={false}
        toggleSidebar={toggleSidebar}
      />
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: /open sidebar/i,
      })
    );

    expect(toggleSidebar).toHaveBeenCalledTimes(1);
  });

  test("shows 'Open sidebar' when sidebar is closed", () => {
    render(
      <Heading
        isOpen={false}
        toggleSidebar={jest.fn()}
      />
    );

    const button = screen.getByRole("button", {
      name: /open sidebar/i,
    });

    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  test("shows 'Close sidebar' when sidebar is open", () => {
    render(
      <Heading
        isOpen={true}
        toggleSidebar={jest.fn()}
      />
    );

    const button = screen.getByRole("button", {
      name: /close sidebar/i,
    });

    expect(button).toHaveAttribute("aria-expanded", "true");
  });
});