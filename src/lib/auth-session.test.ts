import { describe, expect, it } from "vitest";
import { normalizeAuthTokens } from "./auth-session";

describe("normalizeAuthTokens", () => {
  it("accepts camelCase login/register tokens", () => {
    expect(
      normalizeAuthTokens({
        accessToken: "access",
        refreshToken: "refresh",
      }),
    ).toEqual({ accessToken: "access", refreshToken: "refresh" });
  });

  it("accepts snake_case refresh tokens from the API", () => {
    expect(
      normalizeAuthTokens({
        access_token: "access",
        refresh_token: "refresh",
      }),
    ).toEqual({ accessToken: "access", refreshToken: "refresh" });
  });

  it("returns empty strings for incomplete auth responses", () => {
    expect(normalizeAuthTokens({ access_token: "access" })).toEqual({
      accessToken: "access",
      refreshToken: "",
    });
  });
});
