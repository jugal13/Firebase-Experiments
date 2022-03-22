const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");
const { setDoc, doc } = require("@firebase/firestore");
const { readFileSync } = require("fs");

module.exports.setup = async (auth, data) => {
  const projectId = `rules-spec-${Date.now()}`;
  const app = await initializeTestEnvironment({
    projectId,
    firestore: {
      host: "localhost",
      port: 8080,
      rules: readFileSync("firestore.rules", "utf8"),
    },
  });

  if (data) {
    await app.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();

      for (const key in data) {
        const path = key.split("/");
        const ref = doc(db, ...path);
        await setDoc(ref, data[key]);
      }
    });
  }

  const user = app.authenticatedContext(auth.user_id, {
    email: auth.email,
  });

  const db = user.firestore();

  return { app, db };
};

expect.extend({
  async toAllow(testPromise) {
    let pass = false;
    try {
      await assertSucceeds(testPromise);
      pass = true;
    } catch (err) {
      console.log(err);
    }

    return {
      pass,
      message: () =>
        "Expected Firebase operation to be allowed, but it was denied",
    };
  },
});

expect.extend({
  async toDeny(testPromise) {
    let pass = false;
    try {
      await assertFails(testPromise);
      pass = true;
    } catch (err) {
      console.log(err);
    }
    return {
      pass,
      message: () =>
        "Expected Firebase operation to be denied, but it was allowed",
    };
  },
});
