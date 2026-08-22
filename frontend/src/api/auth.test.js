jest.mock("../config", () => ({
  API_URL: "http://localhost:3000",
}));

jest.mock("axios");

import axios from "axios";
import { loginUser, registerUser } from "./auth";

describe("auth API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("loginUser", () => {
    it("sends login request with email and password", async () => {
      const response = { data: { success: true } };
      axios.post.mockResolvedValue(response);

      const result = await loginUser({
        email: "test@example.com",
        password: "Password123!",
      });

      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3000/user/login",
        {
          email: "test@example.com",
          password: "Password123!",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      expect(result).toEqual(response);
    });
  });

  describe("registerUser", () => {
    it("sends register request with username, email and password", async () => {
      const response = { data: { success: true } };
      axios.post.mockResolvedValue(response);

      const result = await registerUser({
        username: "testuser",
        email: "test@example.com",
        password: "Password123!",
      });

      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3000/user/register",
        {
          username: "testuser",
          email: "test@example.com",
          password: "Password123!",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      expect(result).toEqual(response);
    });
  });
});