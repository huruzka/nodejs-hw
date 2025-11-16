import createHttpError from 'http-errors';
import { Note } from '../models/note.js';

// отримати всі нотатки
export const getAllNotes = async (req, res) => {
    const { page = 1, perPage = 15, tag } = req.query;
    const skip = (page - 1) * perPage;

    // Запити формуємо тут
    const notesQuery = Note.find();

    if (tag) {
        notesQuery.where("tag").equals(tag);
    }
    
    const [totalNotes, notes] = await Promise.all([
        notesQuery.clone().countDocuments(),     // рахуємо кількість документів
        notesQuery.skip(skip).limit(perPage),   // пагінація
    ]);

    const totalPages = Math.ceil(totalNotes / perPage);

    res.status(200).json({
        page,
        perPage,
        totalNotes,
        totalPages,
        notes,
    });
};

// отримати одну нотатку за id
export const getNoteById = async (req, res, next) => {
    try {
        const { noteId } = req.params;
        const note = await Note.findById(noteId);
        if (!note) {
            return next(createHttpError(404, 'Note not found'));
        }
        res.status(200).json(note);
    } catch (error) {
        next(error);
    }
};

// зчитування даних з req.body
export const createNote = async (req, res) => {
        const note = await Note.create(req.body);
        res.status(201).json(note);
    };

//delete
export const deleteNote = async (req, res, next) => {
    const { noteId } = req.params;
    const note = await Note.findOneAndDelete({
        _id: noteId,
    });
    if (!note) {
        next(createHttpError(404, 'Note not found'));
        return;
    }
    res.status(200).json(note);
};

//patch (update)
export const updateNote = async (req, res, next) => {
    const { noteId } = req.params;

    const note = await Note.findOneAndUpdate(
        { _id: noteId },
        req.body,
        { new: true },
    );
    if (!note) {
        next(createHttpError(404, 'Note not found'));
        return;
    };
    res.status(200).json(note);
};