const sessionService = require("../services/sessionNote.service");

exports.create = async (req, res, next) => {
  try {
    const note = await sessionService.createNote(req.user._id, req.body);

    res.status(201).json({ success: true, data: note });
  
  } catch (e) {
    next(e);
  }
};

exports.listNotes = async (req, res, next) => {
  try {
    const data = (req.user.role = await sessionService.listMine(
      req.user._id,
      req.query,
    ));

    res.json({ success: true, data });
  
  } catch (e) {
    next(e);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const note = await sessionService.getByIdForUser(req.params.id, req.user);
    res.json({ success: true, data: note });
  
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const note = await sessionService.updateNote(
      req.params.id,
      req.user._id,
      req.body,
    );
    res.json({ success: true, data: note });
  
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await sessionService.deleteNote(req.params.id, req.user._id);
    res.json({ success: true, message: "Deleted" });
  
  } catch (e) {
    next(e);
  }
};
