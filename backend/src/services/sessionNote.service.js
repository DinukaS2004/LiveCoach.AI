const SessionNote = require("../models/SessionNote");
const User = require("../models/User");

exports.createNote = async (ownerUserId, payload) => {
  const noteDate = payload.noteDate ? new Date(payload.noteDate) : new Date();

  return await SessionNote.create({
    ownerUserId,
    title: payload.title || "",
    content: payload.content,
    sessionDate: noteDate,
  });
};

exports.listMine = async (ownerUserId, filters = {}) => {
  const query = { ownerUserId };

  if (filters.date) {
    const d = new Date(filters.date);
    const start = new Date(d);
    start.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    query.sessionDate = { $gte: start, $lte: end };
  }

  return await SessionNote.find(query).sort({ sessionDate: -1, createdAt: -1 });
};

exports.getByIdForUser = async (noteId, ownerUserId) => {
  const note = await SessionNote.findOne({ _id: noteId, ownerUserId });
  if (!note){ 
    throw new Error("Not found");
  }
    
  return note;
};

exports.updateNote = async (noteId, ownerUserId, updates) => {
  const note = await SessionNote.findOne({ _id: noteId, ownerUserId });
  if (!note) throw new Error("Not found or forbidden");

  delete updates.ownerUserId;

  if (typeof updates.title === "string"){ 
    note.title = updates.title;
  }  
  
  if (typeof updates.content === "string"){ 
    note.content = updates.content;
  }  
  
  if (updates.sessionDate) note.sessionDate = new Date(updates.sessionDate);

  await note.save();
  return note;
};

exports.deleteNote = async (noteId, ownerUserId) => {
  const result = await SessionNote.deleteOne({ _id: noteId, ownerUserId });
  if (result.deletedCount === 0){ 
    throw new Error("Not found or forbidden");
  }
};