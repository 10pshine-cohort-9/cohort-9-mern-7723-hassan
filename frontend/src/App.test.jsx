import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("./pages/Login", () => () => <div>Login Page</div>);
jest.mock("./pages/Register", () => () => <div>Register Page</div>);
jest.mock("./pages/Dashboard", () => () => <div>Dashboard Page</div>);
jest.mock("./pages/Profile", () => () => <div>Profile Page</div>);

jest.mock('./routing/ProtectedRoute', () => {
    const PropTypes = require("prop-types");
    const MockRoute = ({ children }) => <>{children}</>;

    MockRoute.propTypes = {
        children: PropTypes.node.isRequired,
    };

    return MockRoute;
});

jest.mock("./routing/PublicRoute", () => {
    const MockRoute = require("./routing/ProtectedRoute");

    return MockRoute;
});

describe("App", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test("renders login page", () => {
        render(<App />);
        expect(screen.getByText("Login Page")).toBeInTheDocument();
    });

    test("renders register page", () => {
        window.history.pushState({}, "", "/register");
        render(<App />);
        expect(screen.getByText("Register Page")).toBeInTheDocument();
    });

    test("renders dashboard page", () => {
        window.history.pushState({}, "", "/dashboard");
        render(<App />);
        expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
    });

    test("renders profile page", () => {
        window.history.pushState({}, "", "/profile");
        render(<App />);
        expect(screen.getByText("Profile Page")).toBeInTheDocument();
    });
});