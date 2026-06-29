let results = [];
let nextId = 1;

const create = async (resultData) => {
  const result = {
    id: String(nextId++),
    ...resultData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  results.push(result);
  return result;
};

const update = async (id, updates) => {
  const index = results.findIndex((result) => result.id === String(id));
  if (index === -1) {
    return null;
  }

  const existingResult = results[index];
  const updatedResult = {
    ...existingResult,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  results[index] = updatedResult;
  return updatedResult;
};

const findById = async (id) => results.find((result) => result.id === String(id)) || null;
const findAll = async () => [...results];

module.exports = {
  create,
  update,
  findById,
  findAll,
};
