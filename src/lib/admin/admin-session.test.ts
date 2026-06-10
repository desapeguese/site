import { beforeEach, describe, expect, it } from "vitest";
import { clearAdminSession, getAdminSession, saveAdminSession } from "./admin-session";

describe("admin session", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and reads only ADMIN sessions", () => {
    saveAdminSession({
      accessToken: "token",
      refreshToken: "refresh",
      user: {
        id: "1",
        name: "Admin",
        email: "admin@example.com",
        role: "ADMIN",
      },
    });

    expect(getAdminSession()?.accessToken).toBe("token");
  });

  it("does not persist MEMBER sessions as admin mode", () => {
    saveAdminSession({
      accessToken: "token",
      refreshToken: "refresh",
      user: {
        id: "1",
        name: "Member",
        email: "member@example.com",
        role: "MEMBER",
      },
    });

    expect(getAdminSession()).toBeNull();
  });

  it("clears admin session", () => {
    saveAdminSession({
      accessToken: "token",
      refreshToken: "refresh",
      user: {
        id: "1",
        name: "Admin",
        email: "admin@example.com",
        role: "ADMIN",
      },
    });

    clearAdminSession();

    expect(getAdminSession()).toBeNull();
  });
});
