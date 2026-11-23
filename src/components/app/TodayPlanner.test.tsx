import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it } from "vitest";
import { habitActions } from "@/lib/habits/store";
import { TodayPlanner } from "./TodayPlanner";

beforeEach(() => {
  habitActions.clearAll();
});

it("creates, completes, undoes and edits a planner task", () => {
  render(<TodayPlanner today="2026-11-23" />);
  fireEvent.click(screen.getByRole("button", { name: "Add task" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Task name" }), { target: { value: "Walk" } });
  fireEvent.click(screen.getByRole("button", { name: "Save task" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "Complete Walk" }));
  expect(screen.getByText("Done")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("checkbox", { name: "Undo completion for Walk" }));
  expect(screen.queryByText("Done")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Edit Walk" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Task name" }), { target: { value: "Walk outside" } });
  fireEvent.click(screen.getByRole("button", { name: "Save task" }));
  expect(screen.getByRole("checkbox", { name: "Complete Walk outside" })).toBeInTheDocument();
});
