function cleanIdsAndVersion(obj, seen = new WeakSet()) {
  if (obj && typeof obj === "object") {
    if (seen.has(obj)) {
      return undefined;
    }
    seen.add(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => cleanIdsAndVersion(item, seen));
  } else if (obj && typeof obj === "object") {
    // Convert any Mongoose document (document or subdocument) to plain object
    if (typeof obj.toObject === "function") {
      return cleanIdsAndVersion(obj.toObject(), seen);
    }
    if (
      obj &&
      typeof obj === "object" &&
      (obj._bsontype === "ObjectID" ||
        obj._bsontype === "ObjectId" ||
        obj.toHexString)
    ) {
      return obj.toHexString ? obj.toHexString() : obj.toString();
    }
    const newObj = {};
    for (const key in obj) {
      if (key === "_id") {
        if (obj[key] && typeof obj[key] === "object" && obj[key].toHexString) {
          newObj["id"] = obj[key].toHexString();
        } else if (obj[key] && obj[key].toString) {
          newObj["id"] = obj[key].toString();
        } else {
          newObj["id"] = String(obj[key]);
        }
      } else if (key === "__v") {
        continue;
      } else if (obj[key] instanceof Date) {
        newObj[key] = obj[key].toISOString();
      } else {
        newObj[key] = cleanIdsAndVersion(obj[key], seen);
      }
    }
    return newObj;
  }
  return obj;
}

function formatError(error) {
  const timestamp = new Date().toISOString();
  
  if (!error) {
    return null;
  }

  if (typeof error === "string") {
    return {
      timestamp,
      message: error,
      stacktrace: null
    };
  }

  if (error instanceof Error) {
    return {
      timestamp,
      message: error.message || "An error occurred",
      stacktrace: error.stack || null
    };
  }

  if (typeof error === "object") {
    return {
      timestamp: error.timestamp || timestamp,
      message: error.message || "An error occurred",
      stacktrace: error.stacktrace || error.stack || null
    };
  }

  return {
    timestamp,
    message: String(error),
    stacktrace: null
  };
}

function sendResponse(res, status, data, error, options = {}) {
  const formattedError = error ? formatError(error) : null;
  
  res.status(status).json({
    statusCode: status,
    data: cleanIdsAndVersion(data),
    error: formattedError
  });
}

module.exports = {
  sendResponse,
  cleanIdsAndVersion,
  formatError
};

