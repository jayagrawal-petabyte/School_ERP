const users = [];

let nextId = 1;

function now() {
  return new Date().toISOString();
}

function addUser(data) {
  const user = {
    id: String(nextId++),
    fullName: data.fullName,
    email: data.email,
    role: data.role,
    accountStatus: data.accountStatus || 'active',
    createdBy: data.createdBy,
    createdAt: now(),
    updatedAt: now(),
  };

  users.push(user);
  return user;
}

function findUser(id) {
  return users.find((item) => item.id === String(id));
}

function findUserByEmail(email) {
  return users.find(
    (item) => item.email.toLowerCase() === String(email).toLowerCase()
  );
}

function updateUser(id, changes) {
  const user = findUser(id);

  if (!user) {
    return null;
  }

  Object.assign(user, changes, {
    updatedAt: now(),
  });

  return user;
}

function removeUser(id) {
  const index = users.findIndex((item) => item.id === String(id));

  if (index === -1) {
    return null;
  }

  const [removed] = users.splice(index, 1);
  return removed;
}

function listUsers(filters = {}) {
  return users.filter((item) => {
    if (filters.role && item.role !== filters.role) {
      return false;
    }

    if (filters.accountStatus && item.accountStatus !== filters.accountStatus) {
      return false;
    }

    return true;
  });
}

module.exports = {
  addUser,
  findUser,
  findUserByEmail,
  updateUser,
  removeUser,
  listUsers,
};
