import assert from "node:assert/strict";
import test from "node:test";
import { rootCertificates } from "node:tls";

import { parseDatabaseEnvironment } from "../lib/validation/environment";

const certificate = rootCertificates[0];
const encodedCertificate = Buffer.from(certificate, "utf8").toString("base64");
const databaseUrl = "postgresql://owner:password@database.example.test:5432/yogaaa?sslmode=require";

test("database environment decodes a valid CA certificate and enforces verify-full", () => {
  const environment = parseDatabaseEnvironment({
    DATABASE_URL: databaseUrl,
    DATABASE_CA_CERT_BASE64: encodedCertificate,
  });

  assert.match(environment.DATABASE_CA_CERT, /^-----BEGIN CERTIFICATE-----/);
  assert.match(environment.DATABASE_CA_CERT, /-----END CERTIFICATE-----\n$/);
  assert.equal(new URL(environment.DATABASE_URL).searchParams.get("sslmode"), "verify-full");
});

test("database environment rejects missing, malformed, or non-certificate CA values safely", () => {
  assert.throws(
    () => parseDatabaseEnvironment({ DATABASE_URL: databaseUrl }),
    /DATABASE_CA_CERT_BASE64/,
  );
  assert.throws(
    () => parseDatabaseEnvironment({
      DATABASE_URL: databaseUrl,
      DATABASE_CA_CERT_BASE64: Buffer.from("not a certificate", "utf8").toString("base64"),
    }),
    /DATABASE_CA_CERT_BASE64/,
  );
  assert.throws(
    () => parseDatabaseEnvironment({
      DATABASE_URL: databaseUrl,
      DATABASE_CA_CERT_BASE64: "not-valid-base64",
    }),
    /DATABASE_CA_CERT_BASE64/,
  );
});
