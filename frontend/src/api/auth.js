import axios from "axios";
import { API_URL } from "../config";

async function request(path, payload) {
  let response

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    // Normalize network, CORS, and abort failures.
    throw new Error(
      error?.message || 'Unable to reach the server. Please check your connection and try again.'
    )
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    // Response had no JSON body — that's fine, we just fall through.
  }

  if (!response.ok) {
    const message =
      (data && (data.message || data.error)) ||
      'Something went wrong. Please try again.'
    throw new Error(message)
  }

  return data
}

export async function loginUser({ email, password }) {
  return axios.post(
    `${API_URL}/user/login`,
    { email, password },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
export async function registerUser({ username, email, password }) {
  return axios.post(
    `${API_URL}/user/register`,
    { username, email, password },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}