import { handleDrag } from "../handleDrag";

describe("handleDrag", () => {
  const jobs = [
    { id: "job123", status: "applied" },
    { id: "job456", status: "interview" },
  ];

  it("calls update function when status changes", async () => {
    const mockUpdate = jest.fn();

    const event = {
      active: { id: "job123" },
      over: { id: "interview" },
    };

    await handleDrag(jobs, event, mockUpdate);

    expect(mockUpdate).toHaveBeenCalledWith("job123", "interview");
  });

  it("does not call update if dragged to same status", async () => {
    const mockUpdate = jest.fn();

    const event = {
      active: { id: "job456" },
      over: { id: "interview" },
    };

    await handleDrag(jobs, event, mockUpdate);

    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("does nothing if over is null", async () => {
    const mockUpdate = jest.fn();

    const event = {
      active: { id: "job123" },
      over: null,
    };

    await handleDrag(jobs, event, mockUpdate);

    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
