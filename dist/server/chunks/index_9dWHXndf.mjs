import Database from 'bun:sqlite';

var UserFlags = /* @__PURE__ */ ((UserFlags2) => {
  UserFlags2[UserFlags2["None"] = 0] = "None";
  UserFlags2[UserFlags2["Admin"] = 2] = "Admin";
  UserFlags2[UserFlags2["SuperAdmin"] = 4] = "SuperAdmin";
  UserFlags2[UserFlags2["Banned"] = 8] = "Banned";
  UserFlags2[UserFlags2["Deleted"] = 16] = "Deleted";
  UserFlags2[UserFlags2["Suspended"] = 32] = "Suspended";
  UserFlags2[UserFlags2["EmailVerified"] = 64] = "EmailVerified";
  return UserFlags2;
})(UserFlags || {});
const USERS_INIT = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    flags INTEGER NOT NULL DEFAULT 0,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );`;
const SESSIONS_INIT = `
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,        -- Add UNIQUE constraint
    expiresAt DATETIME NOT NULL,       -- Add expiration timestamp
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Add index for faster token lookups
  CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
  
  -- Add index for user sessions
  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(userId);
`;
const ANALYTICS_INIT = `
  CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      userAgent TEXT,
      ipAddress TEXT,
      sessionId TEXT,
      referrer TEXT
  );
`;

const db = new Database("db.sqlite");
db.run(USERS_INIT);
db.run(SESSIONS_INIT);
db.run(ANALYTICS_INIT);
var Users;
((Users2) => {
  Users2.hasFlags = (user, ...flags) => flags.every((flag) => (user.flags & flag) === flag);
  Users2.setFlags = (user, ...flags) => {
    const flagAsNumber = flags.reduce((acc, flag) => acc | flag, 0);
    const query = db.prepare(`
      UPDATE users SET flags = $flags WHERE id = $id;
    `);
    return query.run({
      $id: user.id,
      $flags: flagAsNumber
    }).lastInsertRowid;
  };
  Users2.isBanned = (user) => (0, Users2.hasFlags)(user, UserFlags.Banned);
  Users2.isAdmin = (user) => (0, Users2.hasFlags)(user, UserFlags.Admin) || (0, Users2.hasFlags)(user, UserFlags.SuperAdmin);
  Users2.isSuperAdmin = (user) => user.username === "asleepace" || (0, Users2.hasFlags)(user, UserFlags.SuperAdmin);
  async function verifyPassword(hashedPassword, rawPassword) {
    return Bun.password.verify(rawPassword, hashedPassword);
  }
  Users2.verifyPassword = verifyPassword;
  async function hashPassword(rawPassword) {
    return Bun.password.hash(rawPassword, {
      algorithm: "bcrypt",
      cost: 10
    });
  }
  Users2.hashPassword = hashPassword;
  function fetchUsers() {
    return db.query("SELECT * FROM users").all();
  }
  Users2.fetchUsers = fetchUsers;
  async function createUser({
    email,
    username,
    password
  }) {
    const query = db.prepare(`
      INSERT INTO users (email, username, password)
      VALUES ($email, $username, $password)
      RETURNING *;
    `);
    const hash = await hashPassword(password);
    const user = query.get({
      $email: email,
      $username: username,
      $password: hash
    });
    if (!user) {
      throw new Error("Failed to create user");
    }
    return user;
  }
  Users2.createUser = createUser;
  function getUserByEmail(email) {
    return db.query("SELECT * FROM users WHERE email = $email").get({
      $email: email
    });
  }
  Users2.getUserByEmail = getUserByEmail;
  function getUserByUsername(username) {
    return db.query("SELECT * FROM users WHERE username = $username").get({
      $username: username
    });
  }
  Users2.getUserByUsername = getUserByUsername;
  function getUserById(id) {
    return db.query("SELECT * FROM users WHERE id = $id").get({
      $id: id
    });
  }
  Users2.getUserById = getUserById;
  function findUser(user) {
    return db.query(
      "SELECT * FROM users WHERE id = $id OR email = $email OR username = $username LIMIT 1;"
    ).get({
      $id: user.id ?? null,
      $email: user.email ?? null,
      $username: user.username ?? null
    });
  }
  Users2.findUser = findUser;
})(Users || (Users = {}));
var Sessions;
((Sessions2) => {
  const TOKEN_BYTES = 32;
  const TOKEN_EXPIRATION_DAYS = 30;
  function adminOnly(sessionCookie) {
    if (!sessionCookie) throw new Error("No session cookie provided");
    const session = findByToken(sessionCookie);
    const user = Users.getUserById(session.userId);
    if (!user) throw new Error("No user found");
    if (Users.isAdmin(user) || Users.isSuperAdmin(user)) {
      return user;
    } else {
      throw new Error("Invalid permissions!");
    }
  }
  Sessions2.adminOnly = adminOnly;
  function getUser(sessionCookie) {
    if (!sessionCookie) return void 0;
    const session = findByToken(sessionCookie);
    return Users.getUserById(session.userId);
  }
  Sessions2.getUser = getUser;
  function isValid(sessionCookie) {
    if (!sessionCookie) return false;
    const session = findByToken(sessionCookie);
    console.log("[Sessions] session:", session);
    return true;
  }
  Sessions2.isValid = isValid;
  function getExpiry() {
    return new Date(Date.now() + 1e3 * 60 * 60 * 24 * TOKEN_EXPIRATION_DAYS);
  }
  Sessions2.getExpiry = getExpiry;
  function generateToken() {
    const bytes = crypto.getRandomValues(new Uint8Array(TOKEN_BYTES));
    const token = Buffer.from(bytes).toString("hex");
    return token;
  }
  Sessions2.generateToken = generateToken;
  function findUser(sessionToken) {
    const session = findByToken(sessionToken);
    const user = Users.getUserById(session.userId);
    if (!user) {
      console.warn("User not found for session!");
      throw new Error("User not found for session!");
    }
    return user;
  }
  Sessions2.findUser = findUser;
  function findByToken(token) {
    const session = db.query("SELECT * FROM sessions WHERE token = $token").get({
      $token: token
    });
    if (!session) {
      throw new Error("Session not found");
    }
    return session;
  }
  Sessions2.findByToken = findByToken;
  function create(userId) {
    const token = generateToken();
    const expiresAt = getExpiry();
    const query = db.prepare(`
      INSERT INTO sessions (userId, token, expiresAt)
      VALUES ($userId, $token, $expiresAt)
      RETURNING *;
    `);
    const session = query.get({
      $userId: userId,
      $token: token,
      $expiresAt: expiresAt.toISOString()
    });
    if (!session) {
      console.error("Failed to create session:", session);
      throw new Error("Failed to create session");
    }
    return session;
  }
  Sessions2.create = create;
})(Sessions || (Sessions = {}));
var Analytics;
((Analytics2) => {
  function track(data) {
    const query = db.prepare(`
      INSERT INTO analytics (path, userAgent, ipAddress, sessionId, referrer)
      VALUES ($path, $userAgent, $ipAddress, $sessionId, $referrer)
      RETURNING *;
    `);
    const result = query.run({
      $path: data.path ?? "/",
      $userAgent: data.userAgent ?? null,
      $ipAddress: data.ipAddress ?? null,
      $sessionId: data.sessionId ?? null,
      $referrer: data.referrer ?? null
    });
    return result.lastInsertRowid;
  }
  Analytics2.track = track;
  function fetchAnalytics(limit = 100, offset = 0) {
    if (limit < 0 || offset < 0) {
      throw new Error("Limit and offset must be non-negative");
    }
    const query = db.prepare(
      `
      SELECT 
        *,
        COUNT(*) OVER() as totalCcount 
      FROM analytics 
      ORDER BY createdAt DESC
      LIMIT $limit OFFSET $offset;
  `.trim()
    );
    const result = query.run({
      $limit: limit,
      $offset: offset
    });
    return result;
  }
  Analytics2.fetchAnalytics = fetchAnalytics;
})(Analytics || (Analytics = {}));

export { Analytics as A, Sessions as S, Users as U };
