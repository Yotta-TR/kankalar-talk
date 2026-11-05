import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("conversation migration constraints", () => {
  const migration = readFileSync(
    resolve(
      __dirname,
      "../../prisma/migrations/20261105181800_conversation_storage/migration.sql",
    ),
    "utf8",
  );

  it("enforces that a request user owns its session with a composite foreign key", () => {
    expect(migration).toContain(
      'CREATE UNIQUE INDEX "conversation_sessions_id_user_id_key" ON "conversation_sessions"("id", "user_id")',
    );
    expect(migration).toContain(
      'CREATE UNIQUE INDEX "messages_session_id_sequence_no_key" ON "messages"("session_id", "sequence_no")',
    );
    expect(migration).toMatch(
      /FOREIGN\s+KEY\s+\("session_id", "user_id"\)\s+REFERENCES\s+"conversation_sessions"\("id", "user_id"\)\s+ON DELETE CASCADE\s+ON UPDATE CASCADE/,
    );
  });

  it("enforces that a request referenced by a message belongs to the same session", () => {
    expect(migration).toContain(
      'CREATE UNIQUE INDEX "message_requests_id_session_id_key" ON "message_requests"("id", "session_id")',
    );
    expect(migration).toContain(
      'CREATE UNIQUE INDEX "messages_request_id_session_id_key" ON "messages"("request_id", "session_id")',
    );
    expect(migration).toMatch(
      /FOREIGN\s+KEY\s+\("request_id", "session_id"\)\s+REFERENCES\s+"message_requests"\("id", "session_id"\)\s+ON DELETE NO ACTION\s+ON UPDATE CASCADE/,
    );
  });

  it("uses correctly separated SQL referential-action keywords for every foreign key", () => {
    const foreignKeys = migration
      .split("\n")
      .filter(
        (line) => line.includes("ADD CONSTRAINT") && line.includes("FOREIGN"),
      );

    expect(foreignKeys).toHaveLength(6);
    for (const foreignKey of foreignKeys) {
      expect(foreignKey).toMatch(
        /FOREIGN\s+KEY\s*\(.+\)\s+REFERENCES\s+.+\s+ON DELETE (CASCADE|SET NULL|NO ACTION)\s+ON UPDATE CASCADE;/,
      );
    }
    expect(migration).toContain("ON DELETE SET NULL ON UPDATE CASCADE");
  });

  it("retains the private character and speaker character check constraints", () => {
    expect(migration).toContain(
      'ADD CONSTRAINT "conversation_sessions_mode_character_check"',
    );
    expect(migration).toContain(
      'ADD CONSTRAINT "messages_speaker_character_check"',
    );
  });
});
