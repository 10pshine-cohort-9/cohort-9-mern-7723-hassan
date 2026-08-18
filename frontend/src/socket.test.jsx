import { io } from "socket.io-client";

jest.mock("socket.io-client", () => ({
  io: jest.fn(),
}));

jest.mock("./config", () => ({
  API_URL: "http://localhost:3000",
}));

import { connectSocket, disconnectSocket } from "./socket";

describe("socket utility", () => {
  let mockSocketInstance;

  beforeEach(() => {
    mockSocketInstance = {
      disconnect: jest.fn(),
    };

    io.mockReturnValue(mockSocketInstance);
  });

  afterEach(() => {
    disconnectSocket();
    jest.clearAllMocks();
  });

  it("creates a socket connection with the provided token", () => {
    const socket = connectSocket("test-token-123");

    expect(io).toHaveBeenCalledTimes(1);
    expect(io).toHaveBeenCalledWith(
      expect.any(String),
      {
        auth: {
          token: "test-token-123",
        },
      }
    );

    expect(socket).toBe(mockSocketInstance);
  });

  it("returns the existing socket instead of creating a new one on repeated calls", () => {
    const first = connectSocket("token-a");
    const second = connectSocket("token-b");

    expect(io).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
  });

  it("disconnects and clears the socket so a new connection can be made", () => {
    connectSocket("token-a");

    disconnectSocket();

    expect(mockSocketInstance.disconnect).toHaveBeenCalledTimes(1);

    connectSocket("token-b");

    expect(io).toHaveBeenCalledTimes(2);
  });

  it("does nothing when disconnect is called with no active socket", () => {
    expect(() => disconnectSocket()).not.toThrow();
    expect(mockSocketInstance.disconnect).not.toHaveBeenCalled();
  });
});