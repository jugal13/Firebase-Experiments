const { setup } = require("./helpers");
const {
  collection,
  addDoc,
  setLogLevel,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} = require("@firebase/firestore");

describe("Safety rules", () => {
  beforeAll(() => setLogLevel("error"));

  test("should allow create to posts collection", async () => {
    const auth = {
      user_id: "user",
      email: "user@example.com",
    };

    const { app, db } = await setup(auth);

    const postsRef = collection(db, "/posts");

    const post = {
      title: "title",
      description: "description",
      userId: "user",
    };

    await expect(addDoc(postsRef, post)).toAllow();

    await app.cleanup();
  });

  test("should deny create to posts collection", async () => {
    const auth = {
      user_id: "user",
      email: "user@example.com",
    };

    const { app, db } = await setup(auth);

    const postsRef = collection(db, "/posts");

    const post = {
      title: "title",
      description: "description",
      userId: "random",
    };

    await expect(addDoc(postsRef, post)).toDeny();

    await app.cleanup();
  });

  test("should deny create to posts collection due to invalid length", async () => {
    const auth = {
      user_id: "user",
      email: "user@example.com",
    };

    const { app, db } = await setup(auth);

    const postsRef = collection(db, "/posts");

    const post = {
      title: "title length gt 10",
      description: "description",
      userId: "user",
    };

    await expect(addDoc(postsRef, post)).toDeny();

    await app.cleanup();
  });

  test("should allow update to post", async () => {
    const auth = {
      user_id: "user",
      email: "user@example.com",
    };

    const data = {
      "posts/id1": {
        title: "Old Title",
        description: "Old Description",
        userId: "user",
      },
      "posts/id2": {
        title: "Old 2",
        description: "Old 2",
        userId: "random",
      },
    };

    const { app, db } = await setup(auth, data);

    const docRef = doc(db, "posts", "id1");

    const updatedPost = {
      title: "title",
      description: "description",
      userId: "user",
    };

    await expect(updateDoc(docRef, updatedPost)).toAllow();

    await app.cleanup();
  });

  test("should deny update to post wrong id", async () => {
    const auth = {
      user_id: "user",
      email: "user@example.com",
    };

    const data = {
      "posts/id1": {
        title: "Old Title",
        description: "Old Description",
        userId: "user",
      },
      "posts/id2": {
        title: "Old 2",
        description: "Old 2",
        userId: "random",
      },
    };

    const { app, db } = await setup(auth, data);

    const docRef = doc(db, "posts", "id2");

    const updatedPost = {
      title: "title",
      description: "description",
      userId: "user",
    };

    await expect(updateDoc(docRef, updatedPost)).toDeny();

    await app.cleanup();
  });

  test("should deny update to post wrong user", async () => {
    const auth = {
      user_id: "random",
      email: "random@example.com",
    };

    const data = {
      "posts/id1": {
        title: "Old Title",
        description: "Old Description",
        userId: "user",
      },
      "posts/id2": {
        title: "Old 2",
        description: "Old 2",
        userId: "random",
      },
    };

    const { app, db } = await setup(auth, data);

    const docRef = doc(db, "posts", "id1");

    const updatedPost = {
      title: "title",
      description: "description",
      userId: "user",
    };

    await expect(updateDoc(docRef, updatedPost)).toDeny();

    await app.cleanup();
  });

  test("should deny update to post wrong data", async () => {
    const auth = {
      user_id: "user",
      email: "user@example.com",
    };

    const data = {
      "posts/id1": {
        title: "Old Title",
        description: "Old Description",
        userId: "user",
      },
      "posts/id2": {
        title: "Old 2",
        description: "Old 2",
        userId: "random",
      },
    };

    const { app, db } = await setup(auth, data);

    const docRef = doc(db, "posts", "id1");

    const updatedPost = {
      title: "title updated gt 10",
      description: "description",
      userId: "user",
    };

    await expect(updateDoc(docRef, updatedPost)).toDeny();

    await app.cleanup();
  });

  test("should allow delete post", async () => {
    const auth = {
      user_id: "user",
      email: "user@example.com",
    };

    const data = {
      "posts/id1": {
        title: "Old Title",
        description: "Old Description",
        userId: "user",
      },
      "posts/id2": {
        title: "Old 2",
        description: "Old 2",
        userId: "random",
      },
    };

    const { app, db } = await setup(auth, data);

    const docRef = doc(db, "posts", "id1");

    await expect(deleteDoc(docRef)).toAllow();

    await app.cleanup();
  });

  test("should deny delete post wrong user", async () => {
    const auth = {
      user_id: "random",
      email: "random@example.com",
    };

    const data = {
      "posts/id1": {
        title: "Old Title",
        description: "Old Description",
        userId: "user",
      },
      "posts/id2": {
        title: "Old 2",
        description: "Old 2",
        userId: "random",
      },
    };

    const { app, db } = await setup(auth, data);

    const docRef = doc(db, "posts", "id1");

    await expect(deleteDoc(docRef)).toDeny();

    await app.cleanup();
  });

  test("should deny delete post wrong user", async () => {
    const auth = {
      user_id: "random",
      email: "random@example.com",
    };

    const data = {
      "posts/id1": {
        title: "Old Title",
        description: "Old Description",
        userId: "user",
      },
      "posts/id2": {
        title: "Old 2",
        description: "Old 2",
        userId: "random",
      },
    };

    const { app, db } = await setup(auth, data);

    const docRef = doc(db, "posts", "id1");

    await expect(deleteDoc(docRef)).toDeny();

    await app.cleanup();
  });

  test("should allow read collection", async () => {
    const auth = {
      user_id: "random",
      email: "random@example.com",
    };

    const data = {
      "posts/id1": {
        title: "Old Title",
        description: "Old Description",
        userId: "user",
      },
      "posts/id2": {
        title: "Old 2",
        description: "Old 2",
        userId: "random",
      },
    };

    const { app, db } = await setup(auth, data);

    const postsRef = collection(db, "posts");

    await expect(getDocs(postsRef)).toAllow();

    await app.cleanup();
  });

  test("should allow read doc", async () => {
    const auth = {
      user_id: "random",
      email: "random@example.com",
    };

    const data = {
      "posts/id1": {
        title: "Old Title",
        description: "Old Description",
        userId: "user",
      },
      "posts/id2": {
        title: "Old 2",
        description: "Old 2",
        userId: "random",
      },
    };

    const { app, db } = await setup(auth, data);

    const docRef = doc(db, "posts", "id1");

    await expect(getDoc(docRef)).toAllow();

    await app.cleanup();
  });
});
