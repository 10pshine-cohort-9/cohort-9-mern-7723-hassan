import { render } from "@testing-library/react";

jest.mock("socket.io-client", () => ({
  io: jest.fn(() => ({
    disconnect: jest.fn(),
  })),
}));

jest.mock("./config", () => ({
  API_URL: "http://localhost:3000",
}));

import { io } from "socket.io-client";
import { connectSocket, disconnectSocket } from "./socket";

describe("socket utility", () => {
  let mockSocket;

  beforeEach(() => {
    mockSocket = {
      disconnect: jest.fn(),
    };

    io.mockReturnValue(mockSocket);
  });

  afterEach(() => {
    disconnectSocket();
    jest.clearAllMocks();
  });

  test("connects socket with token", () => {
    const socket = connectSocket("test-token");

    expect(io).toHaveBeenCalledTimes(1);

    expect(io).toHaveBeenCalledWith(
      "http://localhost:3000",
      {
        auth: {
          token: "test-token",
        },
      }
    );

    expect(socket).toBe(mockSocket);
  });

  test("returns existing socket instead of creating another connection", () => {
    const first = connectSocket("token-a");
    const second = connectSocket("token-b");

    expect(io).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
  });

  test("disconnects and clears socket", () => {
    connectSocket("token-a");

    disconnectSocket();

    expect(mockSocket.disconnect).toHaveBeenCalledTimes(1);

    connectSocket("token-b");

    expect(io).toHaveBeenCalledTimes(2);
  });

  test("does nothing when socket does not exist", () => {
    expect(() => disconnectSocket()).not.toThrow();
    expect(mockSocket.disconnect).not.toHaveBeenCalled();
  });
});